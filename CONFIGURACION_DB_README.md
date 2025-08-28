# Configuración Dinámica de Base de Datos

## Descripción

Se ha implementado un sistema de configuración dinámica para la conexión a SQL Server que elimina la necesidad de tener datos hardcodeados en archivos de configuración.

## Características

### Seguridad

- Los datos de conexión se almacenan encriptados en un archivo oculto
- En desarrollo: se guarda en el directorio del proyecto
- En producción: se guarda en el directorio de datos de la aplicación (APPDATA en Windows)

### Flujo de Inicio

1. **Verificación**: Al abrir la aplicación se verifica si existen datos de configuración
2. **Prueba de Conexión**: Si existen datos, se prueba la conexión automáticamente
3. **Configuración**: Si no existen datos o la conexión falla, se abre la ventana de configuración
4. **Ejecución**: Solo si la conexión es exitosa, se ejecuta el programa principal

### Ventana de Configuración

- Formulario para ingresar datos de conexión:
  - Servidor
  - Base de datos
  - Usuario
  - Contraseña
- Botón "Probar Conexión" para verificar antes de guardar
- Botón "Guardar" que valida y guarda la configuración
- Mensajes de estado en tiempo real

### Funcionalidades

- **Carga automática**: Los datos existentes se cargan automáticamente en el formulario
- **Validación**: Se valida que todos los campos estén completos
- **Prueba de conexión**: Se puede probar la conexión antes de guardar
- **Reinicio automático**: La aplicación se reinicia automáticamente después de guardar la configuración
- **Manejo de errores**: Mensajes claros para errores de conexión

## Archivos Modificados

### Nuevos Archivos

- `config/database-manager.js`: Gestor de configuración con encriptación

### Archivos Modificados

- `main.js`: Agregada verificación de configuración al inicio
- `preload.js`: Nuevas APIs para gestión de configuración
- `renderer/js/configuracion.js`: Funcionalidad completa del formulario
- `renderer/configuracion.html`: Agregado botón de prueba de conexión
- `backend/routes/productos.js`: Uso de configuración dinámica

### Archivos Eliminados

- `config/db.config`: Archivo de configuración hardcodeado

## Uso

### Primera Instalación

1. Al ejecutar la aplicación por primera vez, se abrirá automáticamente la ventana de configuración
2. Ingresar los datos de conexión a SQL Server
3. Hacer clic en "Probar Conexión" para verificar
4. Hacer clic en "Guardar" para guardar la configuración
5. La aplicación se reiniciará automáticamente

### Cambio de Configuración

1. Desde la ventana principal, hacer clic en "Configuración"
2. Modificar los datos necesarios
3. Probar la conexión
4. Guardar los cambios

### Ubicación de Datos

- **Desarrollo**: `./.db-config` (en el directorio del proyecto)
- **Producción**: `%APPDATA%/.manejo-precios/.db-config` (Windows)

## Seguridad

- Los datos se almacenan encriptados usando AES-256-CBC
- El archivo de configuración está oculto (prefijo `.`)
- En producción, se guarda en el directorio de datos del sistema
- No se pueden editar manualmente los datos guardados

## Compatibilidad

- Funciona tanto en modo desarrollo como en producción
- Compatible con todas las versiones de SQL Server soportadas por mssql
- Mantiene compatibilidad con la funcionalidad existente
