# AVINEXT

Plataforma de gestión avícola con autenticación JWT, autorización por roles, administración de usuarios y control central de licencias.

## Estructura

- `frontend/`: aplicación operativa AVINEXT (React).
- `backend/`: API segura (Node.js, Express y PostgreSQL).
- `backend/database/`: scripts versionados de base de datos.
- `license-admin/`: aplicación independiente para administrar clientes y licencias.

## Requisitos

- Node.js 20 o superior.
- PostgreSQL 15 o superior.
- HTTPS y secretos administrados de forma segura para producción.

## Instalación local

1. Crea una base llamada `avinext` y ejecuta:

   ```powershell
   psql -U postgres -d avinext -f backend/database/001_initial_schema.sql
   ```

2. Copia `backend/.env.example` como `backend/.env` y configura `DATABASE_URL` y un `JWT_SECRET` aleatorio de al menos 32 caracteres.
3. Copia `frontend/.env.example` como `frontend/.env`.
4. Copia `license-admin/.env.example` como `license-admin/.env`.
5. Instala y ejecuta cada componente en una terminal diferente:

   ```powershell
   cd backend; npm install; npm start
   cd frontend; npm install; npm start
   cd license-admin; npm install; npm run dev
   ```

Para actualizar una base existente con clasificación de usuarios, cupos por licencia y sesión única, ejecuta antes de iniciar el backend:

```powershell
cd backend
npm run db:migrate:access
```

El backend usa el puerto `3005`, la aplicación cliente el `3006` y el portal administrativo el `5173`.

## Primer acceso

- Usuario: `admin`
- Contraseña temporal: `Cambiar123!`

Esta cuenta sólo facilita la puesta en marcha. Cambia inmediatamente la contraseña y elimina las credenciales temporales de cualquier documentación de producción.

## Activación del licenciamiento

En desarrollo, `LICENSE_ENFORCEMENT=false` permite preparar el primer cliente. Para exigir una licencia válida:

1. Registra el cliente y emite una licencia desde `license-admin`.
2. Guarda el identificador y la clave mostrada al emitirla.
3. Cambia `LICENSE_ENFORCEMENT=true` en el backend y reinicia la API.
4. En la primera apertura del cliente, introduce esos datos en la pantalla de activación.

La aplicación guarda un certificado firmado en el navegador. No es necesario editar `.env` ni volver a copiar la clave en cada inicio. Para trasladar la instalación a otro equipo o recuperar una clave perdida, usa **Editar → Generar nueva clave** en el portal administrativo.

Una licencia suspendida, vencida o revocada bloquea el inicio de sesión y presenta el mensaje profesional de renovación. Los usuarios dados de baja invalidan sus tokens mediante `token_version`.

## Buenas prácticas incluidas

- Contraseñas con bcrypt (factor 12).
- Tokens JWT de corta duración y revocables.
- Consultas PostgreSQL parametrizadas.
- Helmet, CORS restringido y límite de intentos de login.
- Roles y permisos verificados en la API, no solamente en la interfaz.
- Bajas lógicas y bitácora de auditoría.
- Claves de licencia almacenadas como hash SHA-256.
- Secretos y direcciones configurables mediante variables de entorno.

Antes de producción se recomienda agregar recuperación de contraseña por correo, rotación/refresh tokens en cookie segura, respaldo automatizado, monitoreo, migraciones dentro del pipeline y pruebas de penetración.
