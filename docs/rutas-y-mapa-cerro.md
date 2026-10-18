# Documentación: Visualización de Rutas y Mapa Superpuesto por Cerro

Esta funcionalidad permite que al consultar el display individual de cualquier cerro (`/detalle/:id` o `/:id`), puedan ver un listado visual de las **rutas o senderos disponibles** para dicho cerro con datos clave (distancia en km, tiempo estimado y nivel de dificultad).



## 2. Decisiones de Diseño y Arquitectura

### 2.1. Capa Superpuesta (`Dialog` de Material UI)

- **Implementación:** Se utilizó el componente `Dialog` de `@mui/material` (`maxWidth="md" fullWidth`), alineado a los patrones de renderizado condicional de estado en React (`open={rutaActiva !== null}`).


### 2.2. Motor de Mapas: Leaflet + OpenStreetMap

Se integró el core de `leaflet` mediante un componente React controlado con `useRef` y `useEffect`.

---

## 3. Modelo de Datos y Tipos TypeScript

- Interfaz `RutaCerro` (`src/types/cerro.ts`)
- Datos: MongoDB, base local `manquehuapp`. El frontend consulta los GET de cerros. El archivo JSON de carga fue retirado tras verificar la importación.
- `MapaRutaModal.tsx` (`src/components/MapaRutaModal.tsx`)
Componente responsable de la capa superpuesta y de la lógica cartográfica:
- **Props recibidas:**
  - `open: boolean`: Controla si el modal está visible.
  - `nombreCerro: string`: Título del cerro actual.
  - `rutas: RutaCerro[]`: Colección de todas las rutas del cerro.
  - `rutaActiva: RutaCerro | null`: Ruta seleccionada que se resaltará.
  - `onSelectRuta: (ruta: RutaCerro) => void`: Callback para cambiar la ruta activa.
  - `onClose: () => void`: Callback para cerrar el modal.
- **Lógica de dibujo:**
  - Capa base con mosaicos de OpenStreetMap.
  - Recorrido de todas las rutas no activas con `L.polyline` en color `#222222` (grosor 4, opacidad 0.65) e interactividad por clic.
  - Dibujo de la ruta activa en color rojo `#e53935` (grosor 6, opacidad 0.95).
  - Marcadores de tipo `circleMarker` para el inicio (verde) y la cumbre (rojo).

### 4.2. `Cerro.tsx` (`src/pages/Cerro.tsx`)
Vista individual del cerro:
- Muestra el bloque **"Rutas disponibles"** con botones redondeados en formato píldora (`border-radius: 999px`) emulando el boceto de diseño.
- Gestiona el estado reactivo:
  ```typescript
  const [rutaActiva, setRutaActiva] = useState<RutaCerro | null>(null)
  ```
- Al presionar **"Ver"** (o hacer clic en la fila de la ruta), activa dicho estado y despliega el componente `<MapaRutaModal />`.

---

## 5. Flujo
   - Navegar a la página principal (`/`).
   - Seleccionar un cerro (ej. *Cerro Manquehue*).
   - En la ficha del cerro, descender hasta la sección **Rutas disponibles**.
   - Hacer clic en el botón **"Ver"** de cualquiera de las rutas (ej. *Ruta #1*).
   - Verificar la apertura de la capa superpuesta, la ruta roja, el inicio/cumbre y el cambio dinámico al presionar los chips de las otras rutas (*Ruta #2*, *Ruta #3*).
   - Cerrar el modal mediante el botón de cierre `✕` o haciendo clic fuera del modal.

---

## 6. Integración con MongoDB

El modelo `backend/src/models/cerros.ts` guarda `rutas` como subdocumentos del cerro, sin `_id` adicional. Cada ruta conserva su ID numérico, nombre, distancia, duración, dificultad y coordenadas `[latitud, longitud]`, como las espera Leaflet. El esquema contiene solamente los campos y sus tipos, sin validaciones adicionales de rutas.

El directorio y el detalle consultan `GET /api/cerros` y `GET /api/cerros/:idcerro`. El ID del cerro es ahora el ObjectId de MongoDB serializado como texto. Se añadieron estados de carga, error, lista vacía y cerro no encontrado. `MapaRutaModal.tsx` se conserva sin cambios. No se modificaron los POST/PUT.

### Carga realizada

El 18-10-2026 se cargaron los datos en MongoDB local, base `manquehuapp`.
Se verificaron 6 cerros y 18 rutas. La segunda ejecución creó 0 cerros y la comprobación final encontró 0 cerros duplicados y 0 rutas repetidas dentro de cada cerro.
Después de verificar la persistencia se eliminaron el script, su servicio auxiliar y el JSON temporal de carga. No hay importaciones automáticas al arrancar ni código de carga pendiente de ejecutar.

El mapa de Vicho permanece sin modificaciones. Por el alcance acordado, se retiraron los tests, fixtures y herramientas de prueba agregados para rutas. Las pruebas preexistentes de autenticacion se conservan.
