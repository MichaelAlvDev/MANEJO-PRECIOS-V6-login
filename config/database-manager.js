const fs = require('fs');
const path = require('path');
const sql = require('mssql');
const crypto = require('crypto');

class DatabaseManager {
  constructor() {
    // En producción, guardar en el directorio de datos de la aplicación
    const userDataPath =
      process.env.NODE_ENV === 'development'
        ? path.join(__dirname, '..')
        : path.join(process.env.APPDATA || process.env.HOME, '.manejo-precios');

    this.configDir = userDataPath;
    this.configFile = path.join(this.configDir, '.db-config');

    // Crear directorio si no existe
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  // Encriptar datos sensibles
  encrypt(text, key = 'manejo-precios-key-2024') {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  // Desencriptar datos sensibles
  decrypt(encryptedText, key = 'manejo-precios-key-2024') {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Verificar si existe configuración
  hasConfiguration() {
    return fs.existsSync(this.configFile);
  }

  // Obtener configuración
  getConfiguration() {
    if (!this.hasConfiguration()) {
      return null;
    }

    try {
      const encryptedData = fs.readFileSync(this.configFile, 'utf8');
      const decryptedData = this.decrypt(encryptedData);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Error al leer configuración:', error);
      return null;
    }
  }

  // Guardar configuración
  saveConfiguration(config) {
    try {
      const configData = {
        user: config.user,
        password: config.password,
        server: config.server,
        database: config.database,
        options: {
          encrypt: false,
          trustServerCertificate: true,
          enableArithAbort: true,
          requestTimeout: 30000,
          connectionTimeout: 30000,
        },
      };

      const encryptedData = this.encrypt(JSON.stringify(configData));
      fs.writeFileSync(this.configFile, encryptedData);
      return true;
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      return false;
    }
  }

  // Probar conexión
  async testConnection(config = null) {
    const testConfig = config || this.getConfiguration();

    if (!testConfig) {
      throw new Error('No hay configuración disponible');
    }

    // Asegurar que las opciones de SSL estén configuradas correctamente
    const connectionConfig = {
      ...testConfig,
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        requestTimeout: 30000,
        connectionTimeout: 30000,
        ...testConfig.options,
      },
    };

    try {
      const pool = await sql.connect(connectionConfig);
      await pool.close();
      return { success: true, message: 'Conexión exitosa' };
    } catch (error) {
      // Manejar específicamente errores de certificado SSL
      if (
        error.message.includes('self signed certificate') ||
        error.message.includes('certificate') ||
        error.message.includes('SSL')
      ) {
        return {
          success: false,
          message: `Error de certificado SSL. Verifique que el servidor SQL Server esté configurado correctamente para conexiones sin SSL o que el certificado sea válido.`,
        };
      }

      return {
        success: false,
        message: `Error de conexión: ${error.message}`,
      };
    }
  }

  // Obtener configuración para uso en el backend
  getConfigForBackend() {
    const config = this.getConfiguration();
    if (!config) {
      return null;
    }

    // Asegurar que las opciones de SSL estén configuradas correctamente
    return {
      ...config,
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        requestTimeout: 30000,
        connectionTimeout: 30000,
        ...config.options,
      },
    };
  }

  // Eliminar configuración
  deleteConfiguration() {
    if (this.hasConfiguration()) {
      try {
        fs.unlinkSync(this.configFile);
        return true;
      } catch (error) {
        console.error('Error al eliminar configuración:', error);
        return false;
      }
    }
    return false;
  }

  // Probar diferentes configuraciones de SSL
  async testConnectionWithDifferentSSLConfigs(config) {
    const sslConfigs = [
      {
        name: 'Sin SSL (recomendado para desarrollo)',
        options: {
          encrypt: false,
          trustServerCertificate: true,
          enableArithAbort: true,
        },
      },
      {
        name: 'SSL con certificado de confianza',
        options: {
          encrypt: true,
          trustServerCertificate: true,
          enableArithAbort: true,
        },
      },
      {
        name: 'SSL estricto',
        options: {
          encrypt: true,
          trustServerCertificate: false,
          enableArithAbort: true,
        },
      },
    ];

    const results = [];

    for (const sslConfig of sslConfigs) {
      try {
        const testConfig = {
          ...config,
          options: {
            ...sslConfig.options,
            requestTimeout: 10000,
            connectionTimeout: 10000,
          },
        };

        const pool = await sql.connect(testConfig);
        await pool.close();

        results.push({
          name: sslConfig.name,
          success: true,
          message: 'Conexión exitosa',
        });

        // Si la primera configuración funciona, no probar las demás
        if (sslConfig.name === 'Sin SSL (recomendado para desarrollo)') {
          break;
        }
      } catch (error) {
        results.push({
          name: sslConfig.name,
          success: false,
          message: error.message,
        });
      }
    }

    return results;
  }
}

module.exports = new DatabaseManager();
