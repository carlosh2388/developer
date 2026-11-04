# Roles de acceso

Migración: `cd backend` y `npm run db:migrate:roles` antes de iniciar el backend actualizado.
Debe ejecutarse con un usuario propietario de las tablas. En el servidor se aplicó con PostgreSQL administrador,
porque la cuenta de la aplicación no es propietaria de `active_user_sessions`.
La migración agrega perfiles; no reasigna cuentas existentes ni elimina los roles Supervisor y Operador.
Ambos mantenimientos consultan el mismo catálogo de roles: cliente y administración de licencias.
Los usuarios de plataforma conservan el rol Administrador y el alcance PLATFORM.

| Perfil cliente | Datos maestros | Operaciones normales | Ajustes entrada/salida | Usuarios |
| --- | --- | --- | --- | --- |
| Administrador | Administrar | Registrar, editar y anular | Administrar | Administrar |
| Encargado Granja | Administrar | Registrar, editar y anular | Sin acceso | Sin acceso |
| Encargado Incubadora | Administrar | Registrar, editar y anular | Sin acceso | Sin acceso |
| Gerente Producción | Administrar | Registrar, editar y anular | Administrar | Sin acceso |
| Consultas | Consultar | Consultar | Sin formulario de captura | Sin acceso |

Los perfiles nuevos pueden consultar los reportes. Se conserva la restricción existente de exportación Excel exclusiva del Administrador.
Los ajustes se registran directamente por los dos perfiles autorizados; no se agrega un flujo de solicitud pendiente.
La restricción de ajustes también cubre editar/anular documentos anteriores y el inventario vinculado a ajustes de huevo.
La migración identifica ajustes históricos de huevo mediante los mismos criterios que utilizaban sus formularios y guarda `is_adjustment` para los nuevos movimientos.

Todos los perfiles cliente admiten como máximo dos sesiones simultáneas por cuenta, sin excepción para Consultas.
Consultas no requiere empleado asociado al crear la cuenta desde el cliente. Salir cierra únicamente la sesión actual; cambiar contraseña,
desactivar, editar el usuario o cerrar sesiones desde el mantenimiento revoca las sesiones del usuario.
El cupo de licencia continúa contando cuentas activas, no sesiones.

## Validación

`npm test --prefix backend` ejecuta las pruebas unitarias.
Para integración, usar exclusivamente una base aislada con el esquema operativo completo y definir `TEST_DATABASE_URL`:
`node --test test/roleAccess.test.js` desde backend. Esa prueba agrega datos de prueba y aplica la migración dos veces.
No ejecutar la prueba de integración contra producción.

## Respaldo del 2 de noviembre de 2026

Servidor: `160.34.217.66`.
Archivo remoto: `/home/ubuntu/backups/avinext/avinext-before-roles-2026-11-02T13-12-35-291Z.dump`.
Copia local: `backups/avinext-before-roles-2026-11-02T13-12-35-291Z.dump` (excluida de Git).
Formato PostgreSQL custom, 255905 bytes.
SHA-256: `129fb191e0f726faa3db2b0ba4365e6e492de019fb33ddc222723e4de546ca35`.

Se validó con `pg_restore --list` y restauración completa en una base aislada.
La migración y las pruebas de concurrencia/autorización pasaron sobre esa restauración.
La base de producción no fue modificada durante estas pruebas.

## Publicación y corrección del límite de sesiones

El 2 de noviembre de 2026 se publicaron el backend, el cliente y el administrador de licencias en `160.34.217.66`.
La regla vigente es **máximo dos sesiones simultáneas por cuenta cliente**, con independencia entre sesiones.
El tercer ingreso se rechaza. No hay una excepción para Consultas.
No se modificaron el cupo de usuarios de las licencias, las cuentas existentes ni los archivos privados de configuración.
Los roles quedan disponibles para asignarlos desde cualquiera de los dos mantenimientos.

Respaldo inmediato anterior a la publicación:
`/home/ubuntu/backups/avinext/roles-two-sessions-2026-11-02T13-34-31-065Z.dump`.
Copia local con el mismo nombre en `backups/`.
SHA-256: `a65d4a2fa91180d2a219922e830feb04f4d9a58f60870435a6f0f36dd13fd00c`.
Se restauró en una base aislada y las pruebas de sesiones concurrentes, cierre independiente y autorización pasaron.

Se conservaron los archivos anteriores para reversión en el servidor:
`/home/ubuntu/backups/avinext/roles-two-sessions-source-before.tgz` y
`/home/ubuntu/backups/avinext/roles-two-sessions-public-before.tgz`.
El manifiesto publicado está en `/home/ubuntu/backups/avinext/roles-two-sessions-deployed.json`.
Se verificaron la API, ambas páginas públicas y sus archivos JavaScript después de publicar.
