const express = require('express');
const sql = require('mssql');
const dbManager = require('../../config/database-manager');
const router = express.Router();

// Obtener productos con paginación y búsqueda
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
      SELECT codprod, descrip, precioi1, precioi2, precioi3, instancia, codIns, codInsPadre
      FROM (
        SELECT 
          a.codprod as codprod, 
          a.descrip as descrip, 
          a.precioi1, 
          a.precioi2, 
          a.precioi3,
          b.Descrip as instancia,
          b.InsPadre as codInsPadre,
          b.CodInst as codIns,
          ROW_NUMBER() OVER (ORDER BY a.codprod) AS row
        FROM saprod a
        INNER JOIN SAINSTA b ON a.CodInst = b.CodInst
        WHERE a.codprod LIKE @search OR a.descrip LIKE @search or b.descrip like @search
      ) AS sub
      WHERE row BETWEEN @rowStart AND @rowEnd
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar precios
router.put('/:codprod', async (req, res) => {
  const { codprod } = req.params;
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
      UPDATE saprod SET
        precioi1 = ${precioi1},
        precioi2 = ${precioi2},
        precioi3 = ${precioi3}
      WHERE codprod = '${codprod}'
    `);
    res.json({ message: `Precios actualizados` }); // probando aca
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Función para obtener instancias hijas (directas e indirectas)
async function obtenerInstanciasHijas(pool, codInst) {
  let instancias = [codInst];
  let subIns = [codInst];
  while (subIns.length > 0) {
    const result = await pool.request().query(`
      SELECT CodInst FROM SAINSTA WHERE InsPadre IN (${subIns.map(i => `'${i}'`).join(',')})
    `);
    subIns = result.recordset.map(r => r.CodInst);
    instancias.push(...subIns);
  }
  return instancias;
}

// Aumentar precios porcentual individualmente
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
      const instancias = await obtenerInstanciasHijas(pool, instancia);
      where = `WHERE codinst IN (${instancias.map(i => `'${i}'`).join(',')})`;
    }

    const result = await pool
      .request()
      .query(
        `SELECT codinst, codprod, precioi1, precioi2, precioi3 FROM saprod ${where}`
      );

    // Preparar los CASE WHEN para cada campo
    const campos = ['precioi1', 'precioi2', 'precioi3'];
    const updates = {};

    campos.forEach((campo, idx) => {
      const ajuste = ajustes[idx];
      if (ajuste && ajuste.op && ajuste.val) {
        updates[campo] = `CASE codprod
${result.recordset
  .map(row => {
    const original = row[campo];
    let nuevo =
      ajuste.op === 'up'
        ? original * (1 + ajuste.val / 100)
        : original * (1 - ajuste.val / 100);
    return `WHEN '${row.codprod}' THEN ${nuevo.toFixed(2)}`;
  })
  .join('\n')}
ELSE ${campo} END`;
      }
    });

    if (Object.keys(updates).length) {
      const updateQuery = `
        UPDATE saprod SET
        ${Object.entries(updates)
          .map(([k, v]) => `${k} = ${v}`)
          .join(', ')}
        WHERE codprod IN (${result.recordset.map(r => `'${r.codprod}'`).join(',')})
      `;
      await pool.request().query(updateQuery);
    }

    res.status(200).json({ message: 'Precios actualizados correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Aumentar precio3 basado en precio2
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
    }

    const result = await pool
      .request()
      .query(`SELECT codprod, precioi2 FROM saprod ${where}`);

    // Construir CASE WHEN para precioi3
    const updatePrecio3 = `CASE codprod
${result.recordset
  .map(row => {
    let base = row.precioi2;
    let nuevo =
      modo === 'up'
        ? base * (1 + porcentaje / 100)
        : base * (1 - porcentaje / 100);
    return `WHEN '${row.codprod}' THEN ${nuevo.toFixed(2)}`;
  })
  .join('\n')}
ELSE precioi3 END`;

    if (result.recordset.length > 0) {
      const updateQuery = `
        UPDATE saprod SET
        precioi3 = ${updatePrecio3}
        WHERE codprod IN (${result.recordset.map(r => `'${r.codprod}'`).join(',')})
      `;
      await pool.request().query(updateQuery);
    }

    res.status(200).json({ message: 'Precio3 actualizado.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener todas las instancias (categorías)
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
      where tipoins ='0'
      ORDER BY Descrip
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
