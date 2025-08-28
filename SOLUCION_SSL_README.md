# Solución de Problemas SSL con SQL Server

## Problema Común

El error "self signed certificate" es muy común cuando se conecta a SQL Server, especialmente en entornos de desarrollo o servidores locales.

## Soluciones

### 1. Usar el Botón "Probar Configuraciones SSL"

La aplicación ahora incluye un botón que prueba automáticamente diferentes configuraciones SSL:

1. Complete todos los campos de conexión
2. Haga clic en "Probar Configuraciones SSL"
3. La aplicación probará automáticamente:
   - Sin SSL (recomendado para desarrollo)
   - SSL con certificado de confianza
   - SSL estricto

### 2. Configuración Recomendada para Desarrollo

Para entornos de desarrollo, use esta configuración:

```javascript
{
  encrypt: false,
  trustServerCertificate: true,
  enableArithAbort: true
}
```

### 3. Configuración para Producción

Para entornos de producción con certificados válidos:

```javascript
{
  encrypt: true,
  trustServerCertificate: false,
  enableArithAbort: true
}
```

## Configuración del Servidor SQL Server

### Para SQL Server Express/Local

1. Abra SQL Server Configuration Manager
2. Vaya a "SQL Server Network Configuration"
3. Habilite "TCP/IP"
4. En las propiedades de TCP/IP, configure el puerto (por defecto 1433)

### Para Deshabilitar SSL en SQL Server

1. Abra SQL Server Configuration Manager
2. Vaya a "SQL Server Network Configuration"
3. Haga clic derecho en "Protocols for [INSTANCE]"
4. Seleccione "Properties"
5. En la pestaña "Certificate", desmarque "Force Encryption"

### Para Configurar Certificado SSL

1. Instale un certificado SSL válido en el servidor
2. Configure SQL Server para usar el certificado
3. Habilite "Force Encryption" en SQL Server Configuration Manager

## Verificación de Conexión

### Usando SQL Server Management Studio

1. Abra SSMS
2. En "Connect to Server":
   - Server name: `react-pc` (o su servidor)
   - Authentication: SQL Server Authentication
   - Login: `sa`
   - Password: su contraseña
3. Haga clic en "Options >>"
4. En "Connection Properties":
   - Marque "Trust server certificate"
   - Desmarque "Encrypt connection" (para desarrollo)

### Usando la Aplicación

1. Use el botón "Probar Configuraciones SSL"
2. Si ninguna funciona, verifique:
   - El nombre del servidor es correcto
   - El puerto está abierto (1433)
   - Las credenciales son correctas
   - SQL Server está ejecutándose

## Mensajes de Error Comunes

### "self signed certificate"

- **Solución**: Use `encrypt: false` y `trustServerCertificate: true`

### "Login failed for user"

- **Solución**: Verifique usuario y contraseña

### "Cannot connect to server"

- **Solución**: Verifique nombre del servidor y que SQL Server esté ejecutándose

### "Connection timeout"

- **Solución**: Verifique firewall y que el puerto 1433 esté abierto

## Configuración de Firewall

Asegúrese de que el puerto 1433 esté abierto en el firewall:

1. Abra Windows Firewall
2. Vaya a "Advanced settings"
3. Cree una nueva regla para el puerto 1433
4. Permita conexiones TCP en el puerto 1433

## Notas Importantes

- Para desarrollo, es seguro usar `encrypt: false`
- Para producción, siempre use SSL con certificados válidos
- El botón "Probar Configuraciones SSL" ayuda a encontrar la configuración correcta automáticamente
- Si ninguna configuración funciona, el problema puede estar en el servidor SQL Server
