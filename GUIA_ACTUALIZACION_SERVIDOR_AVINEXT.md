# Guía de actualización de AviNext en el servidor

Esta guía explica cómo enviar una versión nueva de AviNext desde Windows al servidor Ubuntu `160.34.217.66`, conservar los archivos privados `.env`, actualizar dependencias, reconstruir los frontends y reiniciar los servicios.

## Datos del despliegue

- Servidor: `160.34.217.66`
- Usuario SSH: `ubuntu`
- Proyecto local: `E:\Users\Users\chernandez\Repositorio_AviNext\AviNext`
- Proyecto en Ubuntu: `/home/ubuntu/AviNext`
- Llave SSH: `E:\Users\Users\chernandez\Downloads\LLAVE2.key`
- Backend interno: `http://127.0.0.1:3005`
- Cliente público: `http://160.34.217.66/`
- Administrador: `http://160.34.217.66/licencias/`
- API pública: `http://160.34.217.66/api/health`

## Importante antes de comenzar

- Los cambios deben estar incluidos en un commit local. `git archive` no incluye cambios sin commit.
- No se deben subir ni reemplazar los archivos `.env` del servidor.
- No se deben copiar `node_modules` desde Windows.
- No ejecutar `git pull` dentro de `/home/ubuntu/AviNext`, porque esa copia tiene un historial de despliegue anterior y puede generar conflictos.
- No abrir públicamente los puertos `3005`, `3006`, `5173` ni `5432`. El acceso público se realiza por Nginx en el puerto `80`.

## 1. Preparar el código en Windows

Abrir PowerShell y entrar al proyecto:

```powershell
cd "E:\Users\Users\chernandez\Repositorio_AviNext\AviNext"
```

Comprobar el estado y el último commit:

```powershell
git status
git log -1 --oneline
```

Si hay cambios pendientes que deben publicarse:

```powershell
git add .
git commit -m "Describe aquí la actualización"
git push developer main
```

Crear un ZIP únicamente con los archivos versionados del último commit:

```powershell
git archive --format=zip --output="$env:TEMP\AviNext-deploy.zip" HEAD
```

## 2. Transferir el paquete al servidor

Desde PowerShell:

```powershell
scp -i "E:\Users\Users\chernandez\Downloads\LLAVE2.key" "$env:TEMP\AviNext-deploy.zip" ubuntu@160.34.217.66:/home/ubuntu/
```

Conectarse al servidor:

```powershell
ssh -i "E:\Users\Users\chernandez\Downloads\LLAVE2.key" ubuntu@160.34.217.66
```

## 3. Respaldar los archivos de configuración

Ya dentro de Ubuntu, instalar las herramientas necesarias si todavía no existen:

```bash
sudo apt update
sudo apt install unzip rsync -y
```

Crear el directorio de respaldo:

```bash
mkdir -p /home/ubuntu/avinext-env-backup
```

Respaldar los tres archivos privados:

```bash
cp /home/ubuntu/AviNext/backend/.env /home/ubuntu/avinext-env-backup/backend.env
cp /home/ubuntu/AviNext/frontend/.env /home/ubuntu/avinext-env-backup/frontend.env
cp /home/ubuntu/AviNext/license-admin/.env /home/ubuntu/avinext-env-backup/license-admin.env
```

## 4. Preparar el paquete recibido

Vaciar y volver a crear únicamente el directorio temporal de despliegue:

```bash
rm -rf /home/ubuntu/avinext-deploy-temp
mkdir -p /home/ubuntu/avinext-deploy-temp
```

Descomprimir la actualización:

```bash
unzip -o /home/ubuntu/AviNext-deploy.zip -d /home/ubuntu/avinext-deploy-temp
```

Verificar su contenido:

```bash
ls -la /home/ubuntu/avinext-deploy-temp
```

Deben aparecer al menos:

```text
backend
frontend
license-admin
README.md
```

## 5. Actualizar las fuentes

El siguiente comando sincroniza el código y elimina archivos antiguos, pero conserva `.env`, `.git` y `node_modules`:

```bash
rsync -a --delete \
  --exclude='.env' \
  --exclude='.git/' \
  --exclude='node_modules/' \
  /home/ubuntu/avinext-deploy-temp/ \
  /home/ubuntu/AviNext/
```

Confirmar que los archivos privados continúan presentes:

```bash
test -f /home/ubuntu/AviNext/backend/.env && echo "backend env OK"
test -f /home/ubuntu/AviNext/frontend/.env && echo "frontend env OK"
test -f /home/ubuntu/AviNext/license-admin/.env && echo "admin env OK"
```

Los tres comandos deben mostrar `env OK`.

## 6. Actualizar el backend

```bash
cd /home/ubuntu/AviNext/backend
npm ci
sudo systemctl restart avinext-backend
sudo systemctl status avinext-backend --no-pager
```

Comprobar directamente la API interna:

```bash
curl http://127.0.0.1:3005/api/health
```

Respuesta esperada:

```json
{"status":"ok","service":"AVINEXT API"}
```

Si el backend no inicia, revisar los registros:

```bash
sudo journalctl -u avinext-backend -n 100 --no-pager
```

## 7. Reconstruir y publicar el cliente

```bash
cd /home/ubuntu/AviNext/frontend
npm ci
npm run build
sudo rsync -a --delete build/ /var/www/avinext/client/
```

La construcción debe terminar con `built` y sin errores.

## 8. Reconstruir y publicar el administrador

```bash
cd /home/ubuntu/AviNext/license-admin
npm ci
npm run build -- --base=/licencias/
sudo rsync -a --delete dist/ /var/www/avinext/admin/
```

## 9. Validar y recargar Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Comprobar todos los componentes desde Ubuntu:

```bash
curl http://127.0.0.1/api/health
curl -I http://127.0.0.1/
curl -I http://127.0.0.1/licencias/
```

La API debe devolver JSON y ambos frontends deben responder `HTTP/1.1 200 OK`.

## 10. Verificar desde el navegador

Abrir:

```text
Cliente:       http://160.34.217.66/
Administrador: http://160.34.217.66/licencias/
API:           http://160.34.217.66/api/health
```

Si el navegador conserva una versión anterior, realizar una recarga forzada con `Ctrl+F5`.

## Verificación rápida de servicios

```bash
systemctl is-active postgresql
systemctl is-active avinext-backend
systemctl is-active nginx
```

Los tres deben mostrar `active`.

## Restaurar los `.env` si fuera necesario

Solo si alguno se pierde o queda dañado:

```bash
cp /home/ubuntu/avinext-env-backup/backend.env /home/ubuntu/AviNext/backend/.env
cp /home/ubuntu/avinext-env-backup/frontend.env /home/ubuntu/AviNext/frontend/.env
cp /home/ubuntu/avinext-env-backup/license-admin.env /home/ubuntu/AviNext/license-admin/.env
sudo systemctl restart avinext-backend
```

## Errores frecuentes

### `npm error ENOENT ... package.json`

El comando se ejecutó desde una carpeta incorrecta. Usar una de estas rutas:

```bash
cd /home/ubuntu/AviNext/backend
cd /home/ubuntu/AviNext/frontend
cd /home/ubuntu/AviNext/license-admin
```

### `Cannot find module`

Instalar exactamente las dependencias registradas:

```bash
npm ci
```

### Error de JSX en un archivo `.js`

Puede haber quedado una fuente antigua. El despliegue con `rsync --delete` evita este problema al retirar archivos que ya no existen en el paquete nuevo.

### La API funciona internamente pero no desde Internet

Comprobar:

```bash
sudo ufw status
sudo ss -ltnp | grep ':80'
```

Oracle Cloud también debe permitir tráfico de entrada TCP al puerto `80` desde `0.0.0.0/0` en la lista de seguridad o NSG de la VNIC.

### El backend falla después de actualizar

```bash
sudo systemctl status avinext-backend --no-pager
sudo journalctl -u avinext-backend -n 100 --no-pager
```

No mostrar ni compartir el contenido de `/home/ubuntu/AviNext/backend/.env`.

## Limpieza opcional del paquete temporal

Después de confirmar que todo funciona, se pueden eliminar únicamente el ZIP y el directorio temporal:

```bash
rm -f /home/ubuntu/AviNext-deploy.zip
rm -rf /home/ubuntu/avinext-deploy-temp
```

No eliminar `/home/ubuntu/AviNext` ni `/home/ubuntu/avinext-env-backup`.
