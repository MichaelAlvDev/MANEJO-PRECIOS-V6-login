const dbManager = require('./config/database-manager');

async function testDatabaseManager() {
  console.log('=== Prueba del Gestor de Configuración de Base de Datos ===\n');

  // 1. Verificar si existe configuración
  console.log('1. Verificando si existe configuración...');
  const hasConfig = dbManager.hasConfiguration();
  console.log(`   Configuración existente: ${hasConfig}\n`);

  // 2. Obtener configuración actual
  console.log('2. Obteniendo configuración actual...');
  const currentConfig = dbManager.getConfiguration();
  if (currentConfig) {
    console.log('   Configuración encontrada:');
    console.log(`   - Servidor: ${currentConfig.server}`);
    console.log(`   - Base de datos: ${currentConfig.database}`);
    console.log(`   - Usuario: ${currentConfig.user}`);
    console.log(
      `   - Contraseña: ${currentConfig.password ? '***' : 'No definida'}`
    );
  } else {
    console.log('   No hay configuración guardada');
  }
  console.log('');

  // 3. Probar conexión (si existe configuración)
  if (currentConfig) {
    console.log('3. Probando conexión...');
    try {
      const testResult = await dbManager.testConnection();
      console.log(`   Resultado: ${testResult.success ? 'ÉXITO' : 'ERROR'}`);
      console.log(`   Mensaje: ${testResult.message}`);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
    console.log('');
  }

  // 4. Probar guardar configuración de prueba
  console.log('4. Probando guardar configuración de prueba...');
  const testConfig = {
    server: 'test-server',
    database: 'test-database',
    user: 'test-user',
    password: 'test-password',
  };

  const saved = dbManager.saveConfiguration(testConfig);
  console.log(`   Guardado: ${saved ? 'ÉXITO' : 'ERROR'}`);
  console.log('');

  // 5. Verificar que se guardó
  console.log('5. Verificando configuración guardada...');
  const savedConfig = dbManager.getConfiguration();
  if (savedConfig) {
    console.log('   Configuración guardada:');
    console.log(`   - Servidor: ${savedConfig.server}`);
    console.log(`   - Base de datos: ${savedConfig.database}`);
    console.log(`   - Usuario: ${savedConfig.user}`);
    console.log(
      `   - Contraseña: ${savedConfig.password ? '***' : 'No definida'}`
    );
  }
  console.log('');

  // 6. Probar conexión con configuración de prueba
  console.log('6. Probando conexión con configuración de prueba...');
  try {
    const testResult = await dbManager.testConnection(testConfig);
    console.log(`   Resultado: ${testResult.success ? 'ÉXITO' : 'ERROR'}`);
    console.log(`   Mensaje: ${testResult.message}`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  // 6.5. Probar diferentes configuraciones SSL
  console.log('6.5. Probando diferentes configuraciones SSL...');
  try {
    const sslResults =
      await dbManager.testConnectionWithDifferentSSLConfigs(testConfig);
    sslResults.forEach(result => {
      const status = result.success ? 'ÉXITO' : 'ERROR';
      console.log(`   ${result.name}: ${status} - ${result.message}`);
    });
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  // 7. Restaurar configuración original (si existía)
  if (currentConfig) {
    console.log('7. Restaurando configuración original...');
    const restored = dbManager.saveConfiguration(currentConfig);
    console.log(`   Restaurado: ${restored ? 'ÉXITO' : 'ERROR'}`);
  } else {
    console.log('7. Eliminando configuración de prueba...');
    const deleted = dbManager.deleteConfiguration();
    console.log(`   Eliminado: ${deleted ? 'ÉXITO' : 'ERROR'}`);
  }
  console.log('');

  console.log('=== Prueba completada ===');
}

// Ejecutar prueba
testDatabaseManager().catch(console.error);
