# Configuración de Prettier

Este proyecto está configurado con Prettier para formatear automáticamente el código.

## Comandos disponibles

### Formatear todo el código
```bash
npm run format
```

### Verificar si el código está formateado correctamente
```bash
npm run format:check
```

## Configuración

### Archivos de configuración
- `.prettierrc` - Configuración principal de Prettier
- `.prettierignore` - Archivos y carpetas que se ignoran al formatear
- `.vscode/settings.json` - Configuración de VS Code para formateo automático

### Configuración actual de Prettier
- **Semicolons**: Habilitadas
- **Comillas**: Simples
- **Ancho de línea**: 80 caracteres
- **Indentación**: 2 espacios
- **Comas finales**: ES5

## Uso en VS Code

### Extensiones recomendadas
1. **Prettier - Code formatter** (`esbenp.prettier-vscode`)
2. **Auto Rename Tag** (`formulahendry.auto-rename-tag`)
3. **Path Intellisense** (`christian-kohler.path-intellisense`)

### Configuración automática
- El formateo automático está habilitado al guardar
- Prettier es el formateador por defecto para JavaScript, HTML, CSS y JSON
- Se requiere el archivo de configuración de Prettier

## Flujo de trabajo recomendado

1. **Desarrollo**: Escribe código normalmente
2. **Antes de commit**: Ejecuta `npm run format` para formatear todo
3. **Verificación**: Ejecuta `npm run format:check` para verificar que todo esté formateado
4. **VS Code**: El formateo automático se ejecuta al guardar archivos

## Archivos formateados

Prettier formatea automáticamente:
- ✅ Archivos JavaScript (.js)
- ✅ Archivos HTML (.html)
- ✅ Archivos CSS (.css)
- ✅ Archivos JSON (.json)
- ✅ Archivos Markdown (.md)

## Archivos ignorados

Los siguientes archivos/carpetas se ignoran:
- `node_modules/`
- `package-lock.json`
- Archivos de build y distribución
- Archivos de logs
- Archivos de configuración del sistema
