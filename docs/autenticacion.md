# Autenticación de Manquehuapp — parte de Lázaro

Implementación local del 18 de octubre de 2026, en `feat/auth`. No se ha hecho commit, push ni despliegue.

## Qué se construyó

La aplicación ahora puede registrar usuarios, iniciar y cerrar sesión, recuperar la sesión después de recargar y restringir rutas tanto en React como en Express. El backend decide si una petición está autorizada; la protección de React evita mostrar pantallas que requieren sesión.

El flujo es el siguiente:

1. La persona ingresa usuario y contraseña en la pantalla de Bea.
2. Express busca al usuario de los modelos de Ale/Diego y compara la contraseña con su hash usando bcrypt.
3. Si corresponde, firma un JWT con `id`, `username` y un valor CSRF aleatorio, válido por una hora.
4. El JWT viaja en una cookie `token`, `httpOnly`, `sameSite=strict` y `secure` en producción. El frontend recibe el CSRF en `X-CSRF-Token` y los datos públicos del usuario en el cuerpo.
5. Axios guarda el CSRF y los datos complementarios en localStorage. Nunca guarda el JWT ni la contraseña. En las peticiones posteriores envía la cookie automáticamente y el CSRF como encabezado.
6. El middleware verifica la firma, la expiración y el CSRF antes de dejar pasar una ruta protegida.
7. Al recargar, React consulta `/api/login/me`. Los datos de localStorage por sí solos no acreditan una sesión.
8. Al cerrar sesión, el servidor elimina la cookie y el frontend limpia sus datos. Una respuesta 401 también elimina el estado local de sesión.

`httpOnly` impide que JavaScript lea la cookie, pero no elimina todas las consecuencias de XSS: un script inyectado podría actuar desde el navegador. El CSRF comprobado por el backend y `sameSite` reducen las peticiones cruzadas indebidas. No se debe presentar este diseño como inmunidad completa frente a XSS.

## Relación con el material docente

Se revisaron `Clases/08_Authentication.pdf`, `Codigos/c08_authentication.zip` y `Laboratorios/Laboratorio_7.pdf` del ZIP entregado. Los documentos se trataron como material de referencia; los prompts incluidos en el ejemplo no se ejecutaron como instrucciones.

La base concreta es `backend/src/controllers/login.ts`, `backend/src/utils/middleware.ts`, `frontend/src/services/login.ts` y `frontend/src/utils/axiosSecure.ts` del ejemplo c08. Se conserva el patrón de P3–P6 del laboratorio: bcrypt, JWT de una hora en cookie httpOnly, CSRF, `/me`, logout y comentarios opcionalmente autenticados.

Adaptaciones al proyecto:

- `Usuario`, `username`, `email` y `passwordHash` reutilizan los nombres del backend de los compañeros.
- `/api/login`, `/api/login/me` y `/api/login/logout` mantienen el ejemplo. `/api/auth` ofrece los mismos endpoints como alias; `/api/auth/me` cumple el endpoint de sesión propuesto en el reparto.
- `withUser` devuelve 401 ante sesión ausente, inválida o expirada; un CSRF incorrecto devuelve 403 para distinguir ambos errores.
- `withOptionalUser` permite comentar sin cookie; una cookie presente debe superar la verificación. Con sesión, se ignora el autor enviado por el cliente y se usa el usuario real.
- Se conservó el mínimo de cinco caracteres de contraseña que ya había implementado Diego, en vez de cambiarlo al mínimo del laboratorio.
- React agrega un contexto de sesión y una ruta protegida, porque el proyecto tiene varias páginas.

## Relación con las ramas del equipo

| Trabajo | Base utilizada | Integración realizada |
|---|---|---|
| Ale | `feat/backend/modelos`, `28c50df` | Los modelos ya están contenidos en la rama de Diego. Se reutilizaron usuarios, comentarios y cerros. |
| Diego | `backend-general`, `6b855ff` | Se trajeron fuentes y configuración del backend, sin importar su node_modules versionado. Se agregaron sesiones y autorización. |
| Bea | `feat/login`, `7afd501` | Se conservaron sus pantallas y se reemplazaron los envíos a consola por llamadas a API, mensajes de error y espera durante el envío. |
| Vicho | `hito2feat/mapas_rutas`, `6292760` | Mapas incorporados desde main sin modificar sus fuentes. Las consultas siguen públicas. |
| Ricardo | Middleware/refactor pendientes de subir | La autenticación está en `utils/auth.ts`; `apiErrors.ts` es un manejador mínimo para esta integración, que puede consolidarse con su middleware después. |

Actualización: `feat/auth` ya parte de `origin/main` en `2020b88`, que integra backend, login/registro y mapas. Se conservaron el controlador de cerros de Diego y los cambios de Vicho; la autenticación se aplica encima. Se retiró `backend/node_modules` del índice de Git, conservando las dependencias instaladas localmente. Hay un respaldo anterior en el stash.

## Qué está protegido

| Recurso | Regla |
|---|---|
| Directorio, detalle de cerros y GET de comentarios | Públicos. |
| Registro y login | Públicos. |
| React `/form` | Espera la comprobación de sesión; si no existe, redirige a login. Después del login vuelve a la ruta solicitada. |
| `/api/login/me` y `/api/auth/me` | JWT y CSRF válidos. |
| Logout y listado de usuarios | JWT y CSRF válidos. |
| Crear, actualizar y eliminar cerros | JWT y CSRF válidos. No se agregó un rol administrador que el proyecto no define. |
| Crear comentarios | Invitado o sesión validada, según P5. |
| Editar y eliminar comentarios | Sesión válida y propiedad del comentario. |

## Archivos para entenderlo

- `backend/src/controllers/login.ts`: credenciales, cookie, `/me` y logout.
- `backend/src/utils/auth.ts`: `withUser` y `withOptionalUser`.
- `frontend/src/services/auth.ts`: Axios, CSRF y operaciones de sesión.
- `frontend/src/auth/AuthContext.tsx`: usuario activo, restauración y `ProtectedRoute`.
- `frontend/src/pages/Login.tsx`, `Registro.tsx` y `components/Header.tsx`: interacción visible.
- `backend/tests/auth.test.ts`: pruebas HTTP con MongoDB temporal.
- `scripts/verify_auth_browser.py`: recorrido de navegador y capturas.

## Correcciones necesarias para integrar

- El `index.ts` del backend iniciaba un servidor Hello World separado: ahora arranca `app.ts`.
- Se reemplazó el CRUD provisional de cerros por el controlador de Diego ya mergeado. Se agregaron los guards de sesión, GET por ID y el retorno después del 404 en DELETE.
- Se corrigió la validación de dificultad: convertía a minúsculas antes de comparar con nombres que comenzaban en mayúscula.
- Se eliminó la repetición de `/comentarios` entre el montaje del router y sus rutas. El contrato es `/api/comentarios` y `/api/comentarios/:idcerro` para listar/crear; las actualizaciones y eliminaciones usan el ID del comentario, o el par cerro/comentario.
- Se agregó la declaración TypeScript de `request.userId` y dependencias de autenticación. Se ajustó la compilación del backend y se generó su lockfile.
- Se agregó `.env` a las exclusiones y un `.env.example` sin secretos reales.
- Vite redirige `/api` al backend, evitando configurar CORS para el desarrollo habitual.
- El build del frontend fallaba por `setImagenFallo` sin usar; se conectó al evento de error de la imagen para activar el fallback que ya existía.

## Verificación

Pasaron las pruebas HTTP con una instancia MongoDB temporal: registro sin exponer passwordHash, duplicado, credenciales incorrectas, ausencia de sesión, cookie httpOnly/sameSite, `/me`, CSRF incorrecto, comentario de invitado, autor tomado de sesión, bloqueo de eliminación ajena, eliminación propia, creación protegida de cerro, lectura pública, JWT inválido/vencido y logout.

Pasó el recorrido Chromium: redirección desde `/form`, registro, login incorrecto/correcto, acceso autenticado, restauración al recargar, cookie inaccesible desde `document.cookie`, logout y rechazo de un usuario falsificado en localStorage. Las capturas están en `docs/evidencia-auth/`.

La compilación de backend y frontend pasó. El lint completo del frontend encuentra un error preexistente de `setState` dentro de un efecto y una dependencia faltante en `pages/Cerro.tsx`; no se modificó esa pantalla para resolverlo. El build muestra además una advertencia de tamaño del bundle.

## Cómo ejecutarlo con tu base

Desde la raíz:

```powershell
npm install --prefix backend
npm install --prefix frontend
Copy-Item backend/.env.example backend/.env
```

Configura `backend/.env` con tu MongoDB y reemplaza `JWT_SECRET` por un valor aleatorio largo. Abre dos terminales:

```powershell
cd backend
npm run dev
```

```powershell
cd frontend
npm run dev
```

Para comprobar API: `npm test --prefix backend`. Las pruebas usan MongoDB temporal y no necesitan tu `.env` ni tu base; la primera ejecución descarga MongoDB.

## Límites y coordinación pendiente

La autenticación está implementada y verificada con base temporal. No se probó contra una base compartida ni un despliegue del equipo. No se hizo commit, push o merge.

El formulario de creación de cerros y la pantalla de comentarios conservan sus flujos de demostración previos: todavía no guardan sus datos desde la interfaz en la API. Su integración de persistencia debe coordinarse con el backend; la ruta y los endpoints ya tienen la protección de sesión. Los IDs numéricos del JSON del frontend tampoco se deben confundir con los ObjectId de MongoDB. Los mapas de Vicho ya están integrados desde main.

El logout elimina la cookie del navegador; como en el ejemplo JWT sin almacenamiento de sesiones, no revoca copias de un token robado antes de su expiración. La revocación global y roles adicionales no forman parte de esta entrega.

Se conservaron las cinco eliminaciones locales que ya tenía el repositorio antes del trabajo.

## Guion breve para exponer

“Mi parte conecta las vistas de acceso con una sesión comprobada por el servidor. El backend compara la contraseña con bcrypt y entrega un JWT en una cookie que JavaScript no puede leer. El frontend conserva el CSRF y los datos públicos; cuando recargamos consulta `/me`, por lo que cambiar localStorage no permite hacerse pasar por otro usuario. React redirige al login si falta sesión, pero Express también protege las operaciones aunque alguien intente llamarlas directamente. Además, los comentarios autenticados toman el autor desde la sesión y sólo ese autor puede modificarlos o borrarlos.”
