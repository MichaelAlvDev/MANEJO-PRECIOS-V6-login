const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const remote = require('@electron/remote/main');
remote.initialize();

// Importar el gestor de configuración de base de datos
const dbManager = require('./config/database-manager');

// Importar y configurar el servidor Express
const express = require('express');
const cors = require('cors');
const productosRoutes = require('./backend/routes/productos');
const serviciosRoutes = require('./backend/routes/servicios');

// Configurar Express
const server = express();
server.use(cors());
server.use(express.json());
server.use('/api/productos', productosRoutes);
server.use('/api/servicios', serviciosRoutes);

// Puerto para el servidor
const PORT = 3000;

let mainWin = null;
let loginWindow = null;
let aumentoPreciosWin = null;
let precioReferencialWin = null;
let aumentoPreciosSrvWin = null;
let precioReferencialSrvWin = null;
let configuracionWin = null;
let serverInstance = null; // Variable para mantener referencia al servidor

// Función para iniciar el servidor
function startServer() {
  return new Promise((resolve, reject) => {
    serverInstance = server
      .listen(PORT, () => {
        console.log(`API running on port ${PORT}`);
        resolve();
      })
      .on('error', err => {
        console.error('Error starting server:', err);
        reject(err);
      });
  });
}

// Función para cerrar el servidor
function stopServer() {
  return new Promise(resolve => {
    console.log('Intentando cerrar servidor...');
    if (serverInstance) {
      console.log('Servidor encontrado, cerrando...');
      serverInstance.close(() => {
        console.log('Servidor Express cerrado correctamente');
        serverInstance = null;
        resolve();
      });

      // Timeout de seguridad para forzar el cierre si no responde
      setTimeout(() => {
        if (serverInstance) {
          console.log('Forzando cierre del servidor...');
          serverInstance.unref();
          serverInstance = null;
          resolve();
        }
      }, 5000);
    } else {
      console.log('No hay servidor activo para cerrar');
      resolve();
    }
  });
}

function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 400,
    height: 450,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      contentSecurityPolicy:
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self' http://localhost:3000; font-src 'self' data: https://cdn.jsdelivr.net; img-src 'self' data:",
    },
    frame: false,
  });
  loginWindow.loadFile('renderer/login.html');
  loginWindow.on('closed', () => (loginWindow = null));
}

function createMainWindow() {
  mainWin = new BrowserWindow({
    width: 400,
    height: 450,
    resizable: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      contentSecurityPolicy:
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self' http://localhost:3000; font-src 'self' data: https://cdn.jsdelivr.net; img-src 'self' data:",
    },
    frame: false,
  });
  remote.enable(mainWin);
  mainWin.loadFile('renderer/principal.html');

  // Manejar el cierre de la ventana principal
  mainWin.on('closed', async () => {
    console.log('Ventana principal cerrada');
    mainWin = null;
    // Cerrar el servidor cuando se cierra la ventana principal
    await stopServer();
  });
}

function abrirAumentoPrecios() {
  if (aumentoPreciosWin) {
    aumentoPreciosWin.focus();
    return;
  }
  aumentoPreciosWin = new BrowserWindow({
    width: 500,
    height: 700,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      contentSecurityPolicy:
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self' http://localhost:3000; font-src 'self' data: https://cdn.jsdelivr.net; img-src 'self' data:",
    },
    frame: false,
  });
  remote.enable(aumentoPreciosWin);
  aumentoPreciosWin.loadFile('renderer/aumentoPreciosPrd.html');
  aumentoPreciosWin.on('closed', () => {
    aumentoPreciosWin = null;
  });
}

function abrirPrecioReferencial() {
  if (precioReferencialWin) {
    precioReferencialWin.focus();
    return;
  }
  precioReferencialWin = new BrowserWindow({
    width: 1200,
    height: 1000,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      contentSecurityPolicy:
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self' http://localhost:3000; font-src 'self' data: https://cdn.jsdelivr.net; img-src 'self' data:",
    },
    frame: false,
  });
  remote.enable(precioReferencialWin);
  precioReferencialWin.loadFile('renderer/precioReferencialPrd.html');
  precioReferencialWin.on('closed', () => {
    precioReferencialWin = null;
  });
}

function abrirAumentoPreciosSrv() {
  if (aumentoPreciosSrvWin) {
    aumentoPreciosSrvWin.focus();
    return;
  }
  aumentoPreciosSrvWin = new BrowserWindow({
    width: 500,
    height: 700,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      contentSecurityPolicy:
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self' http://localhost:3000; font-src 'self' data: https://cdn.jsdelivr.net; img-src 'self' data:",
    },
    frame: false,
  });
  remote.enable(aumentoPreciosSrvWin);
  aumentoPreciosSrvWin.loadFile('renderer/aumentoPreciosSrv.html');
  aumentoPreciosSrvWin.on('closed', () => {
    aumentoPreciosSrvWin = null;
  });
}

function abrirPrecioReferencialSrv() {
  if (precioReferencialSrvWin) {
    precioReferencialSrvWin.focus();
    return;
  }
  precioReferencialSrvWin = new BrowserWindow({
    width: 1200,
    height: 1000,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      contentSecurityPolicy:
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self' http://localhost:3000; font-src 'self' data: https://cdn.jsdelivr.net; img-src 'self' data:",
    },
    frame: false,
  });
  remote.enable(precioReferencialSrvWin);
  precioReferencialSrvWin.loadFile('renderer/precioReferencialSrv.html');
  precioReferencialSrvWin.on('closed', () => {
    precioReferencialSrvWin = null;
  });
}

function abrirConfiguracion() {
  if (configuracionWin) {
    configuracionWin.focus();
    return;
  }
  configuracionWin = new BrowserWindow({
    width: 600,
    height: 600,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      contentSecurityPolicy:
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self' http://localhost:3000; font-src 'self' data: https://cdn.jsdelivr.net; img-src 'self' data:",
    },
    frame: false,
  });
  remote.enable(configuracionWin);
  configuracionWin.loadFile('renderer/configuracion.html');
  configuracionWin.on('closed', () => {
    configuracionWin = null;
  });
}

// Iniciar servidor y luego la aplicación
app.whenReady().then(async () => {
  // Verificar configuración de base de datos
  const dbConfigValid = await checkDatabaseConfiguration();

  if (!dbConfigValid) {
    // Si la configuración no es válida, no crear la ventana principal
    // La ventana de configuración ya se abrió en checkDatabaseConfiguration()
    return;
  }

  // Solo iniciar el servidor si no estamos en modo desarrollo
  if (process.env.NODE_ENV !== 'development') {
    try {
      await startServer();
      console.log('Servidor Express iniciado en modo producción');
    } catch (err) {
      console.error('Failed to start server:', err);
      app.quit();
      return;
    }
  } else {
    console.log('Modo desarrollo: el servidor se ejecuta por separado');
  }

  createLoginWindow();
});

app.on('window-all-closed', async () => {
  console.log('Evento window-all-closed detectado');
  // Cerrar el servidor antes de salir
  await stopServer();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Evento adicional para cuando se cierra la aplicación
app.on('quit', async () => {
  console.log('Evento quit detectado');
  await stopServer();
});

// Evento para cuando se cierra la aplicación desde el administrador de tareas
app.on('exit', async () => {
  console.log('Evento exit detectado');
  await stopServer();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createLoginWindow();
  }
});

// Manejar el cierre forzado de la aplicación
app.on('before-quit', async event => {
  console.log('Evento before-quit detectado');
  // Prevenir el cierre inmediato
  event.preventDefault();

  // Cerrar el servidor
  await stopServer();

  // Ahora permitir que la aplicación se cierre
  app.exit();
});

// Manejar el cierre cuando se cierra la última ventana
app.on('before-quit', async event => {
  console.log('Evento before-quit (segundo) detectado');
  if (serverInstance) {
    event.preventDefault();
    await stopServer();
    app.exit();
  }
});

// Manejar señales del sistema (Ctrl+C, etc.)
process.on('SIGINT', async () => {
  console.log('Recibida señal SIGINT, cerrando aplicación...');
  await stopServer();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Recibida señal SIGTERM, cerrando aplicación...');
  await stopServer();
  process.exit(0);
});

// IPC para abrir ventanas desde principal.js
//Ventanas Productos
ipcMain.on('abrir-aumento-precios', () => {
  abrirAumentoPrecios();
});
ipcMain.on('abrir-precio-referencial', () => {
  abrirPrecioReferencial();
});
//Ventanas Productos Servicios
ipcMain.on('abrir-aumento-precios-srv', () => {
  abrirAumentoPreciosSrv();
});
ipcMain.on('abrir-precio-referencial-srv', () => {
  abrirPrecioReferencialSrv();
});
//Ventanas Configuracion
ipcMain.on('abrir-configuracion', () => {
  abrirConfiguracion();
});

//manejo de ventanas Max - Min - Close
ipcMain.on('window-close', event => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win.close();
});
ipcMain.on('window-minimize', event => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win.minimize();
});
ipcMain.on('window-maximize', event => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});

// Cerrar servidor desde el renderer
ipcMain.on('close-server', async event => {
  console.log('Solicitud de cierre de servidor desde renderer');
  await stopServer();
});

// Cerrar servidor solo si es la ventana principal
ipcMain.on('close-server-if-main', async event => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win === mainWin) {
    console.log('Cierre de servidor solicitado desde ventana principal');
    await stopServer();
  } else {
    console.log('Cierre de servidor ignorado - no es la ventana principal');
  }
});

// Funciones para manejo de configuración de base de datos
ipcMain.handle('check-database-config', async () => {
  return dbManager.hasConfiguration();
});

ipcMain.handle('test-database-connection', async () => {
  return await dbManager.testConnection();
});

ipcMain.handle('save-database-config', async (event, config) => {
  return dbManager.saveConfiguration(config);
});

ipcMain.handle('get-database-config', async () => {
  return dbManager.getConfiguration();
});

ipcMain.handle('test-database-config', async (event, config) => {
  return await dbManager.testConnection(config);
});

ipcMain.handle('test-database-ssl-configs', async (event, config) => {
  return await dbManager.testConnectionWithDifferentSSLConfigs(config);
});

ipcMain.handle('restart-app', async () => {
  // Reiniciar la aplicación
  app.relaunch();
  app.exit();
});

// Función para verificar configuración al inicio
async function checkDatabaseConfiguration() {
  if (!dbManager.hasConfiguration()) {
    // No hay configuración, mostrar ventana de configuración
    abrirConfiguracion();
    return false;
  }

  // Probar conexión
  const testResult = await dbManager.testConnection();
  if (!testResult.success) {
    // Error de conexión, mostrar mensaje y ventana de configuración
    dialog.showErrorBox(
      'Error de Conexión',
      `No se pudo conectar a la base de datos:\n${testResult.message}\n\nPor favor, configure la conexión.`
    );
    abrirConfiguracion();
    return false;
  }

  return true;
}

// Recibe credenciales desde login.html
ipcMain.on('login-attempt', (event, { username, password }) => {
  //Validar Usuario y contraseña
  if (username === 'admin' && password === '1234') {
    // Login exitoso
    createMainWindow();
    mainWin.show();
    loginWindow.close();
  } else {
    // Login fallido
    event.reply('login-failed', 'Usuario o contraseña incorrectos');
  }
});
