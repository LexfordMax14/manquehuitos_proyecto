import { useEffect, useRef } from 'react'
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { Close, DirectionsWalk, Straighten, Timer } from '@mui/icons-material'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { RutaCerro } from '../types/cerro'

interface MapaRutaModalProps {
  open: boolean
  nombreCerro: string
  rutas: RutaCerro[]
  rutaActiva: RutaCerro | null
  onSelectRuta: (ruta: RutaCerro) => void
  onClose: () => void
}

const MapaRutaModal = ({
  open,
  nombreCerro,
  rutas,
  rutaActiva,
  onSelectRuta,
  onClose,
}: MapaRutaModalProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const layersGroupRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!open || !rutaActiva) return

    // Esperar al siguiente tick para que el Dialog de MUI monte el DOM con dimensiones reales
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map)

        layersGroupRef.current = L.layerGroup().addTo(map)
        mapInstanceRef.current = map
      }

      const map = mapInstanceRef.current
      const layersGroup = layersGroupRef.current
      if (!map || !layersGroup) return

      map.invalidateSize()
      layersGroup.clearLayers()

      const todasLasCoordenadas: L.LatLngExpression[] = []

      // 1. Dibujar todas las rutas secundarias en negro/gris oscuro (como en el boceto)
      rutas.forEach(ruta => {
        ruta.coordenadas.forEach(coord => todasLasCoordenadas.push(coord))

        if (ruta.id !== rutaActiva.id) {
          const lineaSecundaria = L.polyline(ruta.coordenadas, {
            color: '#222222',
            weight: 4,
            opacity: 0.65,
          })
          lineaSecundaria.bindTooltip(ruta.nombre, { sticky: true })
          lineaSecundaria.on('click', () => onSelectRuta(ruta))
          lineaSecundaria.addTo(layersGroup)
        }
      })

      // 2. Dibujar la ruta seleccionada encima en ROJO
      const lineaActiva = L.polyline(rutaActiva.coordenadas, {
        color: '#e53935',
        weight: 6,
        opacity: 0.95,
      })
      lineaActiva.bindTooltip(`${rutaActiva.nombre} (Seleccionada)`, { sticky: true })
      lineaActiva.addTo(layersGroup)

      // 3. Marcadores de Inicio y Cumbre para la ruta activa
      const inicio = rutaActiva.coordenadas[0]
      const fin = rutaActiva.coordenadas[rutaActiva.coordenadas.length - 1]

      if (inicio) {
        L.circleMarker(inicio, {
          radius: 7,
          fillColor: '#2E5E3A',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1,
        })
          .bindPopup(`<b>Inicio:</b> ${rutaActiva.nombre}`)
          .addTo(layersGroup)
      }

      if (fin) {
        L.circleMarker(fin, {
          radius: 8,
          fillColor: '#e53935',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1,
        })
          .bindPopup(`<b>Cumbre:</b> ${nombreCerro}`)
          .addTo(layersGroup)
      }

      if (todasLasCoordenadas.length > 0) {
        const bounds = L.latLngBounds(todasLasCoordenadas)
        map.fitBounds(bounds, { padding: [36, 36] })
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [open, rutaActiva, rutas, nombreCerro, onSelectRuta])

  // Limpiar instancia del mapa cuando se cierra el modal
  useEffect(() => {
    if (!open && mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
      layersGroupRef.current = null
    }
  }, [open])

  if (!rutaActiva) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 3, overflow: 'hidden' },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: 1.5,
          px: 2.5,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
            Mapa de Rutas · {nombreCerro}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            {rutaActiva.nombre}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'inherit' }} aria-label="Cerrar mapa">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        {/* Selector rápido para cambiar entre Ruta #1, #2, #3 dentro del mismo modal */}
        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {rutas.map(ruta => {
            const seleccionada = ruta.id === rutaActiva.id
            return (
              <Chip
                key={ruta.id}
                label={ruta.nombre.split('·')[0].trim()}
                onClick={() => onSelectRuta(ruta)}
                color={seleccionada ? 'error' : 'default'}
                variant={seleccionada ? 'filled' : 'outlined'}
                sx={{ fontWeight: seleccionada ? 700 : 500 }}
              />
            )
          })}
        </Stack>

        {/* Información de la ruta seleccionada */}
        <Stack
          direction="row"
          sx={{
            gap: 1.5,
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1.5,
          }}
        >
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<Straighten />}
              label={`${rutaActiva.distanciaKm} km`}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<Timer />}
              label={rutaActiva.duracion}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<DirectionsWalk />}
              label={`Dificultad: ${rutaActiva.dificultad}`}
              size="small"
              color="secondary"
              variant="outlined"
            />
          </Stack>

          {/* Leyenda de colores */}
          <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
            <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center' }}>
              <Box sx={{ width: 18, height: 4, bgcolor: '#e53935', borderRadius: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Ruta elegida
              </Typography>
            </Stack>
            <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center' }}>
              <Box sx={{ width: 18, height: 4, bgcolor: '#222222', borderRadius: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Otras rutas
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        {/* Contenedor del mapa Leaflet */}
        <Box
          ref={mapContainerRef}
          sx={{
            width: '100%',
            height: { xs: 320, sm: 430 },
            borderRadius: 2,
            border: '2px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

export default MapaRutaModal

