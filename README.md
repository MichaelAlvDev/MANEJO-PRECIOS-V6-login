# Aplicación de Manejo de Precios v4

Aplicación Electron para gestión de precios de productos y servicios con backend integrado.

## Instalación

```bash
npm install
```

## Modos de Ejecución

### Desarrollo (Recomendado)

Ejecuta el backend con nodemon (auto-reload) y el frontend Electron por separado:

```bash
npm run start:dev
```

- Backend: Se ejecuta en puerto 3000 con nodemon (auto-reload)
- Frontend: Electron se ejecuta por separado
- Ambos procesos se inician simultáneamente

### Producción

Ejecuta solo la aplicación Electron con el backend integrado:

```bash
npm start
```

- Todo integrado en un solo proceso
- Backend se inicia automáticamente dentro de Electron
- Ideal para distribución

### Solo Backend (Desarrollo)

```bash
npm run start:backend:dev
```

### Solo Frontend (Desarrollo)

```bash
npm run start:electron:dev
```

## Construcción para Distribución

```bash
npm run build
```

La aplicación empaquetada incluirá tanto el frontend como el backend integrados.

## Estructura del Proyecto

- `main.js` - Proceso principal de Electron con servidor Express integrado
- `backend/` - Código del servidor API
- `renderer/` - Interfaz de usuario (HTML, CSS, JS)
- `config/` - Configuración de base de datos

## Configuración de Base de Datos

Edita `config/db.config` con tus credenciales de SQL Server.

## Notas Importantes

- **Desarrollo**: El backend se ejecuta por separado en puerto 3000
- **Producción**: El backend se ejecuta automáticamente dentro de Electron
- **Auto-reload**: En desarrollo, el backend se reinicia automáticamente con nodemon
- **Distribución**: Un solo ejecutable incluye todo el sistema
- **Cierre Automático**: El servidor se cierra automáticamente al cerrar la aplicación
- **Múltiples Eventos**: Manejo robusto de eventos de cierre (ventana, aplicación, señales del sistema)

## Verificación del Servidor

Para verificar si el servidor está ejecutándose:

```bash
npm run check-server
```

## Pruebas de la Aplicación Empaquetada

Para probar la aplicación empaquetada y verificar el cierre del servidor:

```bash
npm run test-build
```

Para probar específicamente el comportamiento de las ventanas secundarias:

```bash
npm run test-secondary
```

## Solución de Problemas

Si el puerto 3000 está ocupado después de cerrar la aplicación:

### Verificación

```bash
npm run check-server
```

### Solución Automática

```bash
npm run kill-server
```

### Solución Manual (Windows)

```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000

# Matar el proceso (reemplaza XXXX con el PID)
taskkill /F /PID XXXX
```

### Solución Manual (Linux/Mac)

```bash
# Ver qué proceso usa el puerto
lsof -ti:3000

# Matar el proceso
kill -9 $(lsof -ti:3000)
```

## Mejoras Implementadas

### Cierre Robusto del Servidor

- **Eventos Múltiples**: Manejo de `window-all-closed`, `before-quit`, `quit`, `exit`
- **Señales del Sistema**: Manejo de `SIGINT` y `SIGTERM`
- **IPC desde Renderer**: Cierre del servidor desde las ventanas de la interfaz
- **Timeout de Seguridad**: Cierre forzado si el servidor no responde
- **Logging Detallado**: Registros para debugging del proceso de cierre

### Manejo Inteligente de Ventanas

- **Ventana Principal**: Solo la ventana principal puede cerrar el servidor
- **Ventanas Secundarias**: Las ventanas secundarias no afectan el estado del servidor
- **Persistencia del Servidor**: El servidor se mantiene activo mientras la aplicación principal esté abierta
- **Cierre Selectivo**: El servidor solo se cierra cuando se cierra la ventana principal
