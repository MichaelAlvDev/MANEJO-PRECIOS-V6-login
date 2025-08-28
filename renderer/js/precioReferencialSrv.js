let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {
  loadServicios();
  document.getElementById('search').addEventListener('input', () => {
    currentPage = 1;
    loadServicios();
  });
  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadServicios();
    }
  });
  document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++;
    loadServicios();
  });
});

async function loadServicios() {
  const search = document.getElementById('search').value.trim();
  const res = await fetch(
    `http://localhost:3000/api/servicios?page=${currentPage}&search=${search}`
  );
  const servicios = await res.json();
  renderServicios(servicios);
}

function renderServicios(servicios) {
  const container = document.getElementById('servicios');
  container.innerHTML = '';

  if (!servicios.length) {
    container.innerHTML = '<p>No se encontraron servicios.</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'table table-striped';
  const thead = `
    <thead>
      <tr>
        <th>Codigo</th>
        <th>Instancia</th>
        <th>Descripcion</th>
        <th>Precio 1</th>
        <th>Precio 2</th>
        <th>Precio 3</th>
        <th>Guardar</th>
      </tr>
    </thead>`;
  const tbody = servicios
    .map(
      s => `
    <tr data-codserv="${s.codserv}">
      <td>${s.codserv}</td>
      <td>${s.instancia}</td>
      <td>${s.descrip}</td>
      <td><input type="number" class="form-control precio" data-index="1" value="${s.precioi1}"></td>
      <td><input type="number" class="form-control precio" data-index="2" value="${s.precioi2}"></td>
      <td><input type="number" class="form-control precio" data-index="3" value="${s.precioi3}"></td>
      <td><button class="btn btn-sm btn-outline-success guardar">Guardar</button></td>
    </tr>`
    )
    .join('');

  table.innerHTML = thead + '<tbody>' + tbody + '</tbody>';
  container.appendChild(table);

  document
    .querySelectorAll('.guardar')
    .forEach(btn => btn.addEventListener('click', guardarCambios));
}

async function guardarCambios(e) {
  const row = e.target.closest('tr');
  const codserv = row.dataset.codserv;
  const precios = row.querySelectorAll('.precio');
  const data = {
    precioi1: precios[0].value,
    precioi2: precios[1].value,
    precioi3: precios[2].value,
  };

  const res = await fetch(`http://localhost:3000/api/servicios/${codserv}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  showStatusLabel(`El codigo ${codserv} actualizado correctamente`, 'success');
}

function showStatusLabel(message, type = 'success') {
  const label = document.getElementById('status-label');
  label.textContent = message;
  label.className = `alert alert-${type}`;
  label.classList.remove('d-none');
  setTimeout(() => {
    label.classList.add('d-none');
  }, 3000);
}

// Lógica para el botón "Actualizar Todo"
document
  .getElementById('actualizar-todo')
  .addEventListener('click', async () => {
    const filas = document.querySelectorAll('#servicios tbody tr');
    let errores = 0;

    for (const row of filas) {
      const codserv = row.dataset.codserv;
      const precios = row.querySelectorAll('.precio');
      const data = {
        precioi1: precios[0].value,
        precioi2: precios[1].value,
        precioi3: precios[2].value,
      };

      try {
        const res = await fetch(
          `http://localhost:3000/api/servicios/${codserv}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          }
        );
        if (!res.ok) errores++;
      } catch (err) {
        errores++;
      }
    }

    if (errores === 0) {
      showStatusLabel(
        'Todos los servicios visibles han sido actualizados.',
        'success'
      );
    } else {
      showStatusLabel(
        `Algunos servicios no se pudieron actualizar (${errores} errores).`,
        'danger'
      );
    }
  });

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
