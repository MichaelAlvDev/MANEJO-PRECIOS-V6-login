//console.log('aumentoPrecios.js cargado');
function showLabel(id, message, type = 'success') {
  const label = document.getElementById(id);
  label.textContent = message;
  label.className = `alert alert-${type}`;
  label.classList.remove('d-none');
  setTimeout(() => {
    label.classList.add('d-none');
  }, 3000);
}

document.getElementById('ajusteForm').addEventListener('submit', async e => {
  console.log('Submit ajusteForm');
  e.preventDefault();
  const data = new FormData(e.target);
  const body = {
    ajustes: [
      {
        campo: 'precioi1',
        op: data.get('op1'),
        val: parseFloat(data.get('val1') || 0),
      },
      {
        campo: 'precioi2',
        op: data.get('op2'),
        val: parseFloat(data.get('val2') || 0),
      },
      {
        campo: 'precioi3',
        op: data.get('op3'),
        val: parseFloat(data.get('val3') || 0),
      },
    ],
    instancia: data.get('instancia'), // <-- AGREGADO
  };

  try {
    const res = await fetch('http://localhost:3000/api/productos/aumentar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    let result = {};
    try {
      result = await res.json();
    } catch (jsonErr) {
      console.error('Error parseando JSON:', jsonErr);
    }
    console.log('Respuesta del backend:', result);
    showLabel(
      'ajuste-label',
      result.message || 'Actualizado',
      res.ok ? 'success' : 'danger'
    );
  } catch (err) {
    console.error('Error en fetch:', err);
    showLabel(
      'ajuste-label',
      'Error de comunicación con el servidor',
      'danger'
    );
  }
});

document.getElementById('basadoForm').addEventListener('submit', async e => {
  console.log('Submit basadoForm');
  e.preventDefault();
  const data = new FormData(e.target);
  const body = {
    modo: data.get('modo'),
    porcentaje: parseFloat(data.get('porcentaje')),
    instancia: data.get('instancia'), // <-- Agregado data para filtro por instancia
  };

  try {
    const res = await fetch(
      'http://localhost:3000/api/productos/precio3-basado-en-2',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    let result = {};
    try {
      result = await res.json();
    } catch (jsonErr) {
      console.error('Error parseando JSON:', jsonErr);
    }
    console.log('Respuesta del backend:', result);
    showLabel(
      'basado-label',
      result.message || 'Actualizado',
      res.ok ? 'success' : 'danger'
    );
  } catch (err) {
    console.error('Error en fetch:', err);
    showLabel(
      'basado-label',
      'Error de comunicación con el servidor',
      'danger'
    );
  }
});

async function cargarInstancias() {
  const res = await fetch('http://localhost:3000/api/productos/instancias');
  const instancias = await res.json();
  const selects = [
    document.getElementById('instancia-ajuste'),
    document.getElementById('instancia-basado'),
  ];
  selects.forEach(select => {
    // Limpia y agrega la opción por defecto
    select.innerHTML = '<option value="">Todas las instancias</option>';
    instancias.forEach(inst => {
      const option = document.createElement('option');
      option.value = inst.CodInst;
      option.textContent = inst.Descrip;
      select.appendChild(option);
    });
  });
}

document.addEventListener('DOMContentLoaded', cargarInstancias);

// logica botones cerrar abrir minimizar
document.getElementById('close-button').addEventListener('click', () => {
  // No cerrar el servidor desde ventanas secundarias
  window.electronAPI.closeWindow();
});

document.getElementById('minimize-button').addEventListener('click', () => {
  window.electronAPI.minimizeWindow();
});

document.getElementById('maximize-button').addEventListener('click', () => {
  window.electronAPI.maximizeWindow();
});

// No cerrar servidor cuando se cierre la ventana secundaria
// window.addEventListener('beforeunload', () => {
//   window.electronAPI.closeServer();
// });
