// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  abrirAumentoPrecios: () => ipcRenderer.send('abrir-aumento-precios'),
  abrirPrecioReferencial: () => ipcRenderer.send('abrir-precio-referencial'),
  abrirAumentoPreciosSrv: () => ipcRenderer.send('abrir-aumento-precios-srv'),
  abrirPrecioReferencialSrv: () =>
    ipcRenderer.send('abrir-precio-referencial-srv'),
  abrirConfiguracion: () => ipcRenderer.send('abrir-configuracion'),
  closeWindow: () => ipcRenderer.send('window-close'),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeServer: () => ipcRenderer.send('close-server'),
  closeServerIfMain: () => ipcRenderer.send('close-server-if-main'),
  // APIs para configuración de base de datos
  checkDatabaseConfig: () => ipcRenderer.invoke('check-database-config'),
  testDatabaseConnection: () => ipcRenderer.invoke('test-database-connection'),
  saveDatabaseConfig: config =>
    ipcRenderer.invoke('save-database-config', config),
  getDatabaseConfig: () => ipcRenderer.invoke('get-database-config'),
  testDatabaseConfig: config =>
    ipcRenderer.invoke('test-database-config', config),
  testDatabaseSSLConfigs: config =>
    ipcRenderer.invoke('test-database-ssl-configs', config),
  restartApp: () => ipcRenderer.invoke('restart-app'),
  loginAttempt: (credentials) => ipcRenderer.send('login-attempt', credentials),
  onLoginFailed: (callback) => ipcRenderer.on('login-failed', (event, message) => callback(message)),
});
