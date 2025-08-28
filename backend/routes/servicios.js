const express = require('express');
const sql = require('mssql');
const dbManager = require('../../config/database-manager');
const router = express.Router();

// Obtener servicios con paginación y búsqueda
router.get('/', async (req, res) => {
  const { page = 1, search = '' } = req.query;
  const pageSize = 11;
  const offset = (page - 1) * pageSize;

  try {
    const config = dbManager.getConfigForBackend();
    if (!config) {
      return res
        .status(500)
        .json({ error: 'Configuración de base de datos no encontrada' });
    }
    const pool = await sql.connect(config);
    const request = pool.request();
    request.input('search', sql.VarChar, `%${search}%`);
    request.input('rowStart', sql.Int, offset + 1);
    request.input('rowEnd', sql.Int, offset + pageSize);

    const result = await request.query(`
      SELECT codserv, descrip, precioi1, precioi2, precioi3, instancia, codIns, codInsPadre
      FROM (
        SELECT 
          a.codserv as codserv, 
          a.descrip as descrip, 
          a.precioi1, 
          a.precioi2, 
          a.precioi3,
          b.Descrip as instancia,
          b.InsPadre as codInsPadre,
          b.CodInst as codIns,
          ROW_NUMBER() OVER (ORDER BY a.codserv) AS row
        FROM saserv a
        INNER JOIN SAINSTA b ON a.CodInst = b.CodInst
        WHERE (a.codserv LIKE @search OR a.descrip LIKE @search or b.descrip like @search)
        AND b.tipoins = '1'
      ) AS sub
      WHERE row BETWEEN @rowStart AND @rowEnd
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar precios de servicios
router.put('/:codserv', async (req, res) => {
  const { codserv } = req.params;
  const { precioi1, precioi2, precioi3 } = req.body;

  try {
    const config = dbManager.getConfigForBackend();
    if (!config) {
      return res
        .status(500)
        .json({ error: 'Configuración de base de datos no encontrada' });
    }
    const pool = await sql.connect(config);
    await pool.request().query(`
      UPDATE saserv SET
        precioi1 = ${precioi1},
        precioi2 = ${precioi2},
        precioi3 = ${precioi3}
      WHERE codserv = '${codserv}'
    `);
    res.json({ message: `Precios actualizados` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Función para obtener instancias hijas (directas e indirectas) para servicios
async function obtenerInstanciasHijas(pool, codInst) {
  let instancias = [codInst];
  let subIns = [codInst];
  while (subIns.length > 0) {
    const result = await pool.request().query(`
      SELECT CodInst FROM SAINSTA WHERE InsPadre IN (${subIns.map(i => `'${i}'`).join(',')})
      AND tipoins = '1'
    `);
    subIns = result.recordset.map(r => r.CodInst);
    instancias.push(...subIns);
  }
  return instancias;
}

// Aumentar precios porcentual individualmente para servicios
router.post('/aumentar', async (req, res) => {
  const { ajustes, instancia } = req.body;
  try {
    const config = dbManager.getConfigForBackend();
    if (!config) {
      return res
        .status(500)
        .json({ error: 'Configuración de base de datos no encontrada' });
    }
    const pool = await sql.connect(config);

    let where = '';
    if (instancia) {
      // Obtener instancias hijas
      const instancias = await obtenerInstanciasHijas(pool, instancia);
      where = `WHERE codinst IN (${instancias.map(i => `'${i}'`).join(',')})`;
    } else {
      // Si no se especifica instancia, usar solo servicios (tipoins = 1)
      where = `WHERE codinst IN (SELECT CodInst FROM SAINSTA WHERE tipoins = '1')`;
    }

    const result = await pool
      .request()
      .query(
        `SELECT codinst, codserv, precioi1, precioi2, precioi3 FROM saserv ${where}`
      );

    // Construir los CASE WHEN para cada campo
    const campos = ['precioi1', 'precioi2', 'precioi3'];
    const updates = {};

    campos.forEach((campo, idx) => {
      const ajuste = ajustes[idx];
      if (ajuste && ajuste.op && ajuste.val) {
        updates[campo] = `CASE codserv
${result.recordset
  .map(row => {
    const original = row[campo];
    let nuevo =
      ajuste.op === 'up'
        ? original * (1 + ajuste.val / 100)
        : original * (1 - ajuste.val / 100);
    return `WHEN '${row.codserv}' THEN ${nuevo.toFixed(2)}`;
  })
  .join('\n')}
ELSE ${campo} END`;
      }
    });

    if (Object.keys(updates).length) {
      const updateQuery = `
        UPDATE saserv SET
        ${Object.entries(updates)
          .map(([k, v]) => `${k} = ${v}`)
          .join(', ')}
        WHERE codserv IN (${result.recordset.map(r => `'${r.codserv}'`).join(',')})
      `;
      await pool.request().query(updateQuery);
    }

    res
      .status(200)
      .json({ message: 'Precios de servicios actualizados correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Aumentar precio3 basado en precio2 para servicios
router.post('/precio3-basado-en-2', async (req, res) => {
  const { modo, porcentaje, instancia } = req.body;
  try {
    const config = dbManager.getConfigForBackend();
    if (!config) {
      return res
        .status(500)
        .json({ error: 'Configuración de base de datos no encontrada' });
    }
    const pool = await sql.connect(config);

    let where = '';
    if (instancia) {
      // Obtener instancias hijas
      const instancias = await obtenerInstanciasHijas(pool, instancia);
      where = `WHERE codinst IN (${instancias.map(i => `'${i}'`).join(',')})`;
    } else {
      // Si no se especifica instancia, usar solo servicios (tipoins = 1)
      where = `WHERE codinst IN (SELECT CodInst FROM SAINSTA WHERE tipoins = '1')`;
    }

    const result = await pool
      .request()
      .query(`SELECT codserv, precioi2 FROM saserv ${where}`);

    // Construir CASE WHEN para precioi3
    const updatePrecio3 = `CASE codserv
${result.recordset
  .map(row => {
    let base = row.precioi2;
    let nuevo =
      modo === 'up'
        ? base * (1 + porcentaje / 100)
        : base * (1 - porcentaje / 100);
    return `WHEN '${row.codserv}' THEN ${nuevo.toFixed(2)}`;
  })
  .join('\n')}
ELSE precioi3 END`;

    if (result.recordset.length > 0) {
      const updateQuery = `
        UPDATE saserv SET
        precioi3 = ${updatePrecio3}
        WHERE codserv IN (${result.recordset.map(r => `'${r.codserv}'`).join(',')})
      `;
      await pool.request().query(updateQuery);
    }

    res.status(200).json({ message: 'Precio3 de servicios actualizado.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener todas las instancias de servicios (tipoins = 1)
router.get('/instancias', async (req, res) => {
  try {
    const config = dbManager.getConfigForBackend();
    if (!config) {
      return res
        .status(500)
        .json({ error: 'Configuración de base de datos no encontrada' });
    }
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT CodInst, Descrip, InsPadre FROM SAINSTA
      WHERE tipoins = '1'
      ORDER BY Descrip
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
