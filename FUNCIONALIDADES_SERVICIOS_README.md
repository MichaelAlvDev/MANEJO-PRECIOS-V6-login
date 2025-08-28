# Funcionalidades de Servicios Implementadas

## Descripción

Se han implementado las mismas funcionalidades que tienen las ventanas de productos (PRD) en las ventanas de servicios (SRV), pero trabajando con la tabla `SASERV` en lugar de `SAPROD`, y con instancias de tipo 1 en lugar de tipo 0.

## Diferencias Clave

### Tabla de Datos

- **Productos**: Trabaja con la tabla `SAPROD`
- **Servicios**: Trabaja con la tabla `SASERV`

### Campos de Precios

- **Productos**: `saprod.precioi1`, `saprod.precioi2`, `saprod.precioi3`
- **Servicios**: `saserv.precioi1`, `saserv.precioi2`, `saserv.precioi3`

### Instancias

- **Productos**: `sainsta.tipoins = '0'`
- **Servicios**: `sainsta.tipoins = '1'`

## Funcionalidades Implementadas

### 1. Ajuste de Precios de Servicios

**Archivo**: `renderer/aumentoPreciosSrv.html` y `renderer/js/aumentoPreciosSrv.js`

#### Características:

- **Ajuste Individual**: Permite modificar porcentualmente los precios 1, 2 y 3
- **Filtro por Instancia**: Opción para aplicar cambios solo a una instancia específica
- **Ajuste Basado en Precio 2**: Permite actualizar el precio 3 basándose en el precio 2
- **Validación**: Verifica que los datos sean válidos antes de aplicar cambios

#### Endpoints utilizados:

- `GET /api/servicios/instancias` - Obtener instancias de servicios
- `POST /api/servicios/aumentar` - Aplicar ajustes porcentuales
- `POST /api/servicios/precio3-basado-en-2` - Actualizar precio 3 basado en precio 2

### 2. Precio Referencial de Servicios

**Archivo**: `renderer/precioReferencialSrv.html` y `renderer/js/precioReferencialSrv.js`

#### Características:

- **Lista de Servicios**: Muestra todos los servicios con sus precios actuales
- **Búsqueda**: Filtro por código, descripción o instancia
- **Paginación**: Navegación entre páginas de resultados
- **Edición Individual**: Modificar precios de servicios específicos
- **Actualización Masiva**: Botón "Actualizar Todo" para guardar todos los cambios visibles
- **Validación en Tiempo Real**: Verificación de datos antes de guardar

#### Endpoints utilizados:

- `GET /api/servicios` - Obtener lista de servicios con paginación y búsqueda
- `PUT /api/servicios/:codserv` - Actualizar precios de un servicio específico

## Backend - Rutas de Servicios

### Archivo: `backend/routes/servicios.js`

#### Endpoints Implementados:

1. **GET /api/servicios**
   - Obtiene servicios con paginación y búsqueda
   - Filtra por `tipoins = '1'` (servicios)
   - Parámetros: `page`, `search`

2. **PUT /api/servicios/:codserv**
   - Actualiza los precios de un servicio específico
   - Campos: `precioi1`, `precioi2`, `precioi3`

3. **POST /api/servicios/aumentar**
   - Aplica ajustes porcentuales a múltiples servicios
   - Parámetros: `ajustes[]`, `instancia`

4. **POST /api/servicios/precio3-basado-en-2**
   - Actualiza precio 3 basándose en precio 2
   - Parámetros: `modo`, `porcentaje`, `instancia`

5. **GET /api/servicios/instancias**
   - Obtiene todas las instancias de servicios (`tipoins = '1'`)

## Configuración del Servidor

### Archivo: `main.js`

Se agregó la ruta de servicios al servidor Express:

```javascript
const serviciosRoutes = require('./backend/routes/servicios');
server.use('/api/servicios', serviciosRoutes);
```

## Estructura de Datos

### Tabla SASERV

```sql
CREATE TABLE SASERV (
  codserv VARCHAR(20) PRIMARY KEY,
  descrip VARCHAR(255),
  precioi1 DECIMAL(10,2),
  precioi2 DECIMAL(10,2),
  precioi3 DECIMAL(10,2),
  codinst VARCHAR(20),
  -- otros campos...
);
```

### Tabla SAINSTA (para servicios)

```sql
SELECT CodInst, Descrip, InsPadre
FROM SAINSTA
WHERE tipoins = '1'
ORDER BY Descrip;
```

## Uso

### Ajuste de Precios

1. Abrir "Ajuste Precios Srv" desde el menú principal
2. Seleccionar instancia (opcional)
3. Configurar ajustes para precios 1, 2 y 3
4. Hacer clic en "Aplicar Cambios"

### Precio Referencial

1. Abrir "Precio Referencial Srv" desde el menú principal
2. Usar el campo de búsqueda para filtrar servicios
3. Modificar precios directamente en la tabla
4. Guardar cambios individuales o usar "Actualizar Todo"

## Compatibilidad

- Mantiene la misma interfaz de usuario que las ventanas de productos
- Usa las mismas validaciones y manejo de errores
- Compatible con la configuración de base de datos existente
- Funciona tanto en modo desarrollo como en producción

## Notas Importantes

- Los servicios se identifican por `codserv` en lugar de `codprod`
- Las instancias de servicios tienen `tipoins = '1'`
- Todas las operaciones respetan la estructura jerárquica de instancias
- Los cambios se aplican solo a servicios, no afectan productos
