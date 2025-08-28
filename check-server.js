const net = require('net');

function checkPort(port) {
  return new Promise(resolve => {
    const socket = new net.Socket();

    socket.setTimeout(1000);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true); // Puerto en uso
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false); // Puerto libre
    });

    socket.on('error', () => {
      resolve(false); // Puerto libre
    });

    socket.connect(port, 'localhost');
  });
}

async function main() {
  const portInUse = await checkPort(3000);

  if (portInUse) {
    console.log('❌ Puerto 3000 está en uso - El servidor sigue ejecutándose');
  } else {
    console.log(
      '✅ Puerto 3000 está libre - El servidor se cerró correctamente'
    );
  }
}

main();
