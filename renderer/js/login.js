const form = document.getElementById('loginForm');
const errorDiv = document.getElementById('error');

form.addEventListener('submit', e => {
  e.preventDefault();
  window.electronAPI.loginAttempt({
    username: document.getElementById('username').value,
    password: document.getElementById('password').value,
  });
});

window.electronAPI.onLoginFailed((message) => {
  errorDiv.textContent = message;
});

// Manejo de botones de ventana
document.getElementById('close-button').addEventListener('click', () => {
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
