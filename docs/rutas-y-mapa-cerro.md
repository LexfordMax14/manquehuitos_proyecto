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
- Datos (`src/data/cerros.json`) (se encuentran harcodeados de momento)
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

## 6. Próximos Pasos (Integración con Backend)

Cuando el proyecto avance hacia la persistencia en servidor (según las cátedras c06 a c08):
1. **Modelo en Mongoose / Backend:** Añadir el esquema anidado de `rutas` en el modelo `Cerro`.
2. **Controlador:** Asegurar que el endpoint `GET /api/cerros/:id` devuelva el array `rutas`.
3. **Servicio Frontend:** `src/services/cerros.ts` consumirá `axios` hacia la API en lugar de `cerros.json`, manteniendo la interfaz `RutaCerro` intacta sin requerir cambios en los componentes visuales.

