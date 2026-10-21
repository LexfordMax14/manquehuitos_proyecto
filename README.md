# Manquehuapp

Aplicación web para explorar cerros, consultar su dificultad y visualizar sus rutas en un mapa. Proyecto del curso CC5003 Aplicaciones Web Reactivas.

El frontend utiliza React, TypeScript, Material UI y Leaflet. El backend utiliza Express, Mongoose y MongoDB, con autenticación JWT mediante cookies httpOnly.

## Aplicación desplegada

[https://fullstack.dcc.uchile.cl:7036/](https://fullstack.dcc.uchile.cl:7036/)

El backend sirve también el frontend compilado. En el servidor del curso, el proyecto está en `/home/fullstack/manquehuapp/backend` y se mantiene activo con el proceso PM2 `manquehuapp-7036`.

## Requisitos para ejecutar localmente

- Node.js y npm. Durante el desarrollo se utilizó Node.js 24.
- Una instancia MongoDB accesible, local o remota.
- La base que contiene los cerros y sus rutas. Los datos se consultan desde MongoDB y no se cargan automáticamente al iniciar la aplicación.

## Variables de entorno

Crear `backend/.env` a partir de `backend/.env.example`. El archivo de ejemplo no se carga automáticamente: el backend usa `.env`.

| Variable | Configuración | Uso |
|---|---|---|
| `MONGODB_URI` | Necesaria | URI de conexión a MongoDB. Para una instancia local: `mongodb://127.0.0.1:27017`. |
| `MONGODB_DBNAME` | Nombre de la base del proyecto | En el entorno local usado para cargar los datos: `manquehuapp`. |
| `JWT_SECRET` | Necesaria | Secreto aleatorio para firmar y verificar los JWT. Reemplazar el valor de ejemplo. |
| `PORT` | Opcional, por defecto `3001` | Puerto del backend. |
| `HOST` | Opcional, por defecto `localhost` | Dirección donde escucha el backend. El ejemplo usa `127.0.0.1`. |
| `NODE_ENV` | `production` en producción | Activa el atributo `secure` de la cookie de sesión, que requiere HTTPS. |

El frontend no necesita un archivo de variables para el desarrollo habitual. Vite redirige `/api` a `http://127.0.0.1:3001`. Si el backend escucha en otra dirección, se puede configurar `API_PROXY_TARGET` en el entorno de la terminal que inicia Vite.

No publicar `.env` ni credenciales en el repositorio.

## Ejecución local

Desde la raíz del repositorio, instalar las dependencias:

```powershell
npm install --prefix backend
npm install --prefix frontend
```

Si todavía no existe `backend/.env`, copiar el ejemplo:

```powershell
Copy-Item backend/.env.example backend/.env
```

Editar `backend/.env`, configurar MongoDB y reemplazar `JWT_SECRET`. Iniciar MongoDB si se utiliza una instancia local.

En una terminal, levantar el backend:

```powershell
cd backend
npm run dev
```

En una segunda terminal, desde la raíz, levantar el frontend:

```powershell
cd frontend
npm run dev
```

Abrir la URL que indique Vite, normalmente [http://localhost:5173](http://localhost:5173). El backend escucha normalmente en [http://127.0.0.1:3001](http://127.0.0.1:3001).

## Despliegue en el servidor del curso

Compilar desde la raíz del repositorio, con las dependencias de ambos proyectos instaladas:

```powershell
cd backend
npm run build:ui
npm run build
cd ..
```

`build:ui` compila el frontend y lo copia a `backend/dist`. `build` genera el backend en `backend/out`.

Conectarse desde una terminal local y crear la carpeta del proyecto si todavía no existe:

```bash
ssh -p 219 fullstack@fullstack.dcc.uchile.cl
mkdir -p ~/manquehuapp/backend
exit
```

Subir desde la raíz del repositorio, en la terminal local. No se deben transferir `node_modules` ni el `.env` local:

```powershell
scp -P 219 backend/package.json backend/package-lock.json fullstack@fullstack.dcc.uchile.cl:manquehuapp/backend/
scp -P 219 -r backend/out backend/dist fullstack@fullstack.dcc.uchile.cl:manquehuapp/backend/
```

Entrar nuevamente por SSH y ejecutar en el servidor:

```bash
cd ~/manquehuapp/backend
npm ci --omit=dev
```

Crear en esa carpeta un archivo `.env` con esta configuración, reemplazando los valores indicados:

```dotenv
MONGODB_URI=URI_CON_CREDENCIALES_DEL_CURSO
MONGODB_DBNAME=fullstack
PORT=7036
HOST=0.0.0.0
NODE_ENV=production
JWT_SECRET=SECRETO_ALEATORIO_PROPIO
```

El usuario de MongoDB debe tener permisos sobre la base indicada. La carpeta del servidor no determina la base de datos: en este despliegue se usa la base compartida `fullstack`.

Proteger el archivo e iniciar el proceso **solo en el primer despliegue**:

```bash
chmod 600 .env
pm2 start npm --name manquehuapp-7036 -- run start
pm2 save
```

Para actualizar una instalación existente, volver a compilar y subir los archivos, instalar las dependencias y reiniciar únicamente nuestro proceso:

```bash
pm2 restart manquehuapp-7036
```

Comprobar el arranque y la respuesta de la API:

```bash
pm2 logs manquehuapp-7036 --lines 30 --nostream
curl -I http://127.0.0.1:7036/
curl http://127.0.0.1:7036/api/cerros
```

Todos los grupos comparten el usuario del servidor. No detener, reiniciar ni eliminar procesos de otros equipos.

### Datos e imágenes

Los datos de MongoDB no se transfieren al subir el código. Los cerros y sus rutas deben cargarse por separado en la base de producción. La exportación local preparada contiene 6 cerros y 18 rutas; al importarlos se conservan sus identificadores para evitar duplicados. Una respuesta `[]` de `/api/cerros` significa que la colección consultada está vacía.

Las imágenes originales están en `frontend/public/images` y se incluyen en `backend/dist/images` al compilar. Actualmente, el formulario de creación guarda el nombre del archivo seleccionado, pero no sube su contenido al servidor; por eso seleccionar una imagen nueva no basta para publicarla.

## Uso de IA

En la integración de rutas utilizamos IA para agregar los campos y el modelo de rutas al backend y adaptar su lectura desde MongoDB. Ajustamos la propuesta al estilo del repositorio y al alcance acordado: modelos y campos, sin validaciones adicionales ni herramientas de carga permanentes. Conservamos el componente de mapa realizado por Vicente Garrido.

## Documentación

- [Visualización de rutas y mapa por cerro](docs/rutas-y-mapa-cerro.md)
- [Autenticación y rutas protegidas](docs/autenticacion.md)
