const { spawn } = require('child_process');
const path = require('path');

async function testBuild() {
  console.log('🧪 Iniciando prueba de la aplicación empaquetada...');

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

  // Esperar 10 segundos para que la aplicación se inicie completamente
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log('⏰ Esperando 10 segundos para que la aplicación se inicie...');

  // Verificar si el servidor está ejecutándose
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

  const serverRunning = await checkPort(3000);
  console.log(
    serverRunning
      ? '✅ Servidor ejecutándose en puerto 3000'
      : '❌ Servidor no encontrado en puerto 3000'
  );

  // Cerrar la aplicación después de 5 segundos
  console.log('⏰ Esperando 5 segundos antes de cerrar la aplicación...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('🔄 Cerrando aplicación...');
  app.kill('SIGTERM');

  // Esperar a que la aplicación se cierre
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Verificar si el servidor se cerró
  const serverStillRunning = await checkPort(3000);
  console.log(
    serverStillRunning
      ? '❌ Servidor sigue ejecutándose'
      : '✅ Servidor se cerró correctamente'
  );

  if (serverStillRunning) {
    console.log('⚠️ El servidor no se cerró automáticamente');
    console.log('🔧 Ejecutando script de limpieza...');

    // Ejecutar el script de limpieza
    const { exec } = require('child_process');
    exec('npm run kill-server', (error, stdout, stderr) => {
      if (error) {
        console.error('Error ejecutando kill-server:', error);
      } else {
        console.log('✅ Script de limpieza ejecutado');
      }
    });
  }

  console.log('🏁 Prueba completada');
}

testBuild().catch(console.error);
