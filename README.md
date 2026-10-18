# Manquehuapp

Aplicación web para explorar cerros, consultar su dificultad y visualizar sus rutas en un mapa. Proyecto del curso CC5003 Aplicaciones Web Reactivas.

El frontend utiliza React, TypeScript, Material UI y Leaflet. El backend utiliza Express, Mongoose y MongoDB, con autenticación JWT mediante cookies httpOnly.

## Aplicación desplegada

**URL del servidor del curso: pendiente de informar.**

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

## Uso de IA

En la integración de rutas utilizamos IA para agregar los campos y el modelo de rutas al backend y adaptar su lectura desde MongoDB. Ajustamos la propuesta al estilo del repositorio y al alcance acordado: modelos y campos, sin validaciones adicionales ni herramientas de carga permanentes. Conservamos el componente de mapa realizado por Vicente Garrido.

## Documentación

- [Visualización de rutas y mapa por cerro](docs/rutas-y-mapa-cerro.md)
- [Autenticación y rutas protegidas](docs/autenticacion.md)
