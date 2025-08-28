const { exec } = require('child_process');
const os = require('os');

function killProcessOnPort(port) {
  return new Promise((resolve, reject) => {
    const platform = os.platform();
    let command;

    if (platform === 'win32') {
      // Windows
      command = `netstat -ano | findstr :${port}`;
    } else {
      // Linux/Mac
      command = `lsof -ti:${port}`;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`No se encontraron procesos en el puerto ${port}`);
        resolve();
        return;
      }

      if (platform === 'win32') {
        // Parsear salida de Windows
        const lines = stdout.split('\n');
        const pids = [];

        lines.forEach(line => {
          const match = line.match(/\s+(\d+)$/);
          if (match) {
            pids.push(match[1]);
          }
        });

        if (pids.length > 0) {
          const killCommand = `taskkill /F /PID ${pids.join(' /PID ')}`;
          exec(killCommand, killError => {
            if (killError) {
              console.log('Error al matar procesos:', killError.message);
              reject(killError);
            } else {
              console.log(
                `✅ Procesos matados en puerto ${port}:`,
                pids.join(', ')
              );
              resolve();
            }
          });
        } else {
          console.log(`No se encontraron PIDs para matar en puerto ${port}`);
          resolve();
        }
      } else {
        // Linux/Mac
        const pids = stdout
          .trim()
          .split('\n')
          .filter(pid => pid);

        if (pids.length > 0) {
          const killCommand = `kill -9 ${pids.join(' ')}`;
          exec(killCommand, killError => {
            if (killError) {
              console.log('Error al matar procesos:', killError.message);
              reject(killError);
            } else {
              console.log(
                `✅ Procesos matados en puerto ${port}:`,
                pids.join(', ')
              );
              resolve();
            }
          });
        } else {
          console.log(`No se encontraron PIDs para matar en puerto ${port}`);
          resolve();
        }
      }
    });
  });
}

async function main() {
  try {
    console.log('🔍 Buscando procesos en puerto 3000...');
    await killProcessOnPort(3000);
    console.log('✅ Operación completada');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
