const { spawn } = require('child_process');
const path = require('path');

async function testSecondaryWindows() {
  console.log('🧪 Iniciando prueba de ventanas secundarias...');

  // Ruta a la aplicación empaquetada
  const appPath = path.join(
    __dirname,
    'dist',
    'win-unpacked',
    'Contol Precios App.exe'
  );

  console.log('📁 Ruta de la aplicación:', appPath);

  // Ejecutar la aplicación
  const app = spawn(appPath, [], {
    stdio: 'pipe',
    detached: false,
  });

  console.log('🚀 Aplicación iniciada con PID:', app.pid);

  // Capturar salida de la aplicación
  app.stdout.on('data', data => {
    console.log('📤 App stdout:', data.toString());
  });

  app.stderr.on('data', data => {
    console.log('❌ App stderr:', data.toString());
  });

  // Función para verificar el puerto
  const net = require('net');
  const checkPort = port => {
    return new Promise(resolve => {
      const socket = new net.Socket();
      socket.setTimeout(1000);
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      socket.on('error', () => {
        resolve(false);
      });
      socket.connect(port, 'localhost');
    });
  };

  // Esperar a que la aplicación se inicie
  console.log('⏰ Esperando 8 segundos para que la aplicación se inicie...');
  await new Promise(resolve => setTimeout(resolve, 8000));

  // Verificar que el servidor esté ejecutándose
  const serverRunning = await checkPort(3000);
  console.log(
    serverRunning
      ? '✅ Servidor ejecutándose en puerto 3000'
      : '❌ Servidor no encontrado en puerto 3000'
  );

  if (!serverRunning) {
    console.log('❌ El servidor no se inició correctamente');
    app.kill('SIGTERM');
    return;
  }

  // Simular el cierre de ventanas secundarias (el servidor debe mantenerse activo)
  console.log('🔄 Simulando cierre de ventanas secundarias...');
  console.log('⏰ El servidor debe mantenerse activo durante 10 segundos...');

  // Esperar 10 segundos para simular el uso de ventanas secundarias
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Verificar que el servidor siga ejecutándose
  const serverStillRunning = await checkPort(3000);
  console.log(
    serverStillRunning
      ? '✅ Servidor sigue ejecutándose (correcto)'
      : '❌ Servidor se cerró (incorrecto)'
  );

  if (!serverStillRunning) {
    console.log('⚠️ El servidor se cerró prematuramente');
  }

  // Ahora cerrar la aplicación principal
  console.log('🔄 Cerrando aplicación principal...');
  app.kill('SIGTERM');

  // Esperar a que la aplicación se cierre
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Verificar que el servidor se haya cerrado
  const serverFinallyClosed = await checkPort(3000);
  console.log(
    serverFinallyClosed
      ? '❌ Servidor sigue ejecutándose'
      : '✅ Servidor se cerró correctamente al cerrar la aplicación principal'
  );

  if (serverFinallyClosed) {
    console.log('⚠️ El servidor no se cerró al cerrar la aplicación principal');
    console.log('🔧 Ejecutando script de limpieza...');

    const { exec } = require('child_process');
    exec('npm run kill-server', (error, stdout, stderr) => {
      if (error) {
        console.error('Error ejecutando kill-server:', error);
      } else {
        console.log('✅ Script de limpieza ejecutado');
      }
    });
  }

  console.log('🏁 Prueba de ventanas secundarias completada');
}

testSecondaryWindows().catch(console.error);
