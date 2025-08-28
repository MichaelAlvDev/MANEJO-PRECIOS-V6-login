document.getElementById('btn-precios-prd').addEventListener('click', () => {
  window.electronAPI.abrirAumentoPrecios();
});

document.getElementById('btn-referencial-prd').addEventListener('click', () => {
  window.electronAPI.abrirPrecioReferencial();
});

document.getElementById('btn-precios-srv').addEventListener('click', () => {
  window.electronAPI.abrirAumentoPreciosSrv();
});

document.getElementById('btn-referencial-srv').addEventListener('click', () => {
  window.electronAPI.abrirPrecioReferencialSrv();
});

document.getElementById('btn-configuracion').addEventListener('click', () => {
  window.electronAPI.abrirConfiguracion();
});

// Manejo de botones de ventana
document.getElementById('close-button').addEventListener('click', () => {
  // Cerrar el servidor antes de cerrar la ventana (solo si es la ventana principal)
  window.electronAPI.closeServerIfMain();
  setTimeout(() => {
    window.electronAPI.closeWindow();
  }, 100);
});

document.getElementById('minimize-button').addEventListener('click', () => {
  window.electronAPI.minimizeWindow();
});

document.getElementById('maximize-button').addEventListener('click', () => {
  window.electronAPI.maximizeWindow();
});

// Cerrar servidor cuando se cierre la ventana (solo si es la ventana principal)
window.addEventListener('beforeunload', () => {
  window.electronAPI.closeServerIfMain();
});
