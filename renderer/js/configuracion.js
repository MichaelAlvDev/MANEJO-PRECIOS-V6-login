// Manejo de botones de ventana
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

// Elementos del formulario
const form = document.querySelector('form');
const serverInput = document.getElementById('server');
const databaseInput = document.getElementById('database');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const statusLabel = document.getElementById('status-label');

// Cargar configuración existente al abrir la ventana
async function loadExistingConfig() {
  try {
    const config = await window.electronAPI.getDatabaseConfig();
    if (config) {
      serverInput.value = config.server || '';
      databaseInput.value = config.database || '';
      usernameInput.value = config.user || '';
      passwordInput.value = config.password || '';
    }
  } catch (error) {
    console.error('Error al cargar configuración:', error);
  }
}

// Mostrar mensaje de estado
function showStatus(message, isSuccess = true) {
  statusLabel.textContent = message;
  statusLabel.className = `alert ${isSuccess ? 'alert-success' : 'alert-danger'}`;
  statusLabel.classList.remove('d-none');

  // Ocultar mensaje después de 5 segundos
  setTimeout(() => {
    statusLabel.classList.add('d-none');
  }, 5000);
}

// Probar conexión
async function testConnection() {
  const config = {
    server: serverInput.value.trim(),
    database: databaseInput.value.trim(),
    user: usernameInput.value.trim(),
    password: passwordInput.value,
  };

  // Validar campos requeridos
  if (!config.server || !config.database || !config.user || !config.password) {
    showStatus('Por favor, complete todos los campos', false);
    return false;
  }

  try {
    showStatus('Probando conexión...', true);
    const result = await window.electronAPI.testDatabaseConfig(config);

    if (result.success) {
      showStatus('Conexión exitosa!', true);
      return true;
    } else {
      showStatus(result.message, false);
      return false;
    }
  } catch (error) {
    showStatus(`Error al probar conexión: ${error.message}`, false);
    return false;
  }
}

// Guardar configuración
async function saveConfiguration() {
  const config = {
    server: serverInput.value.trim(),
    database: databaseInput.value.trim(),
    user: usernameInput.value.trim(),
    password: passwordInput.value,
  };

  // Validar campos requeridos
  if (!config.server || !config.database || !config.user || !config.password) {
    showStatus('Por favor, complete todos los campos', false);
    return;
  }

  try {
    // Primero probar la conexión
    const testResult = await window.electronAPI.testDatabaseConfig(config);
    if (!testResult.success) {
      showStatus(`No se puede guardar: ${testResult.message}`, false);
      return;
    }

    // Guardar configuración
    const saved = await window.electronAPI.saveDatabaseConfig(config);
    if (saved) {
      showStatus(
        'Configuración guardada exitosamente! Reiniciando aplicación...',
        true
      );

      // Reiniciar aplicación después de 2 segundos
      setTimeout(async () => {
        await window.electronAPI.restartApp();
      }, 2000);
    } else {
      showStatus('Error al guardar la configuración', false);
    }
  } catch (error) {
    showStatus(`Error: ${error.message}`, false);
  }
}

// Manejar envío del formulario
form.addEventListener('submit', async event => {
  event.preventDefault();
  await saveConfiguration();
});

// Botón para probar conexión
document
  .getElementById('test-button')
  .addEventListener('click', testConnection);

// Botón para probar configuraciones SSL
document
  .getElementById('test-ssl-button')
  .addEventListener('click', testSSLConfigurations);

// Probar diferentes configuraciones SSL
async function testSSLConfigurations() {
  const config = {
    server: serverInput.value.trim(),
    database: databaseInput.value.trim(),
    user: usernameInput.value.trim(),
    password: passwordInput.value,
  };

  // Validar campos requeridos
  if (!config.server || !config.database || !config.user || !config.password) {
    showStatus('Por favor, complete todos los campos', false);
    return;
  }

  try {
    showStatus('Probando diferentes configuraciones SSL...', true);
    const results = await window.electronAPI.testDatabaseSSLConfigs(config);

    let message = 'Resultados de pruebas SSL:\n\n';
    let hasSuccess = false;

    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      message += `${status} ${result.name}: ${result.message}\n`;
      if (result.success) hasSuccess = true;
    });

    if (hasSuccess) {
      message +=
        '\n✅ Se encontró una configuración que funciona. Puede proceder a guardar.';
      showStatus(message, true);
    } else {
      message +=
        '\n❌ Ninguna configuración funcionó. Verifique los datos de conexión.';
      showStatus(message, false);
    }
  } catch (error) {
    showStatus(`Error al probar configuraciones SSL: ${error.message}`, false);
  }
}

// Cargar configuración al iniciar
document.addEventListener('DOMContentLoaded', loadExistingConfig);
