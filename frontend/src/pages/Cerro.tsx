import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Map as MapIcon } from '@mui/icons-material'
import type { Cerro, RutaCerro } from '../types/cerro'
import cerros from '../services/cerros'
import comentarios from '../services/comentarios'
import type { ComentarioType } from '../types/comentario'
import Comentario from '../components/Comentario'
import MapaRutaModal from '../components/MapaRutaModal'

const DetalleCerro = () => {
  const { id } = useParams()
  const cerroId = id ?? ''
  const [status, setStatus] = useState('loading')
  const [cerro, setCerro] = useState<Cerro | null>(null)
  const [rutaActiva, setRutaActiva] = useState<RutaCerro | null>(null)

  const [mostrarCaja, setCaja] = useState<boolean>(false)
  const [nuevoAutor, setNuevoAutor] = useState<string>('')
  const [nuevoComentario, setNuevoComentario] = useState<string>('')
  const [cajaComentarios, setComentarios] = useState<ComentarioType[]>([])

  const handleAutorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoAutor(event.target.value)
  }

  const handleComentarioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoComentario(event.target.value)
  }

  const addComentario = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!id) return

    comentarios
      .create({ contenido: nuevoComentario, autor: nuevoAutor }, id)
      .then(nuevo => {
        setComentarios(comentariosActuales => comentariosActuales.concat(nuevo))
        setNuevoAutor('')
        setNuevoComentario('')
      })
      .catch(() => setComentariosError('No se pudo publicar el comentario.'))
  }

  const mostrados = mostrarCaja ? cajaComentarios : []

  useEffect(() => {
    const controller = new AbortController()
    cerros.getCerro(cerroId, controller.signal).then(data => {
      setCerro(data); setRutaActiva(null); setStatus('ready')
    }).catch(error => {
      if (!controller.signal.aborted) setStatus(error.response?.status === 404 ? 'missing' : 'error')
    })
    return () => controller.abort()
  }, [cerroId])

  if (status === 'missing') return <Alert severity="info">Cerro no encontrado.</Alert>
  if (status === 'error') return <Alert severity="error">No se pudo cargar el cerro. Intenta recargar.</Alert>
  if (!cerro || cerro.id !== cerroId) return <Typography sx={{ p: 4 }}>Cargando...</Typography>

  const rutasCerro = cerro.rutas ?? []

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
        <Typography variant="h4" sx={{ color: 'primary.dark', mb: 1 }}>
          {cerro.nombre}
        </Typography>

        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mb: 3 }}>
          <Chip label={`${cerro.altura} m`} color="primary" variant="outlined" />
          <Chip label={cerro.dificultad} color="secondary" variant="outlined" />
          <Chip label={cerro.ubicacion} variant="outlined" />
          <Chip label={`${cerro.descansos} descansos`} variant="outlined" />
          <Chip label={cerro.banos ? 'Con baños' : 'Sin baños'} variant="outlined" />
        </Stack>

        <Box
          component="img"
          src={cerro.imagenes[0]}
          alt={cerro.nombre}
          sx={{ width: '100%', height: { xs: 220, sm: 360 }, objectFit: 'cover', borderRadius: 2, mb: 3 }}
        />

        <Typography sx={{ color: 'text.secondary', mb: 3 }}>
          {cerro.descripcion}
        </Typography>

        {cerro.imagenes.length > 1 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 1.5,
              mb: rutasCerro.length > 0 ? 3 : 0,
            }}
          >
            {cerro.imagenes.slice(1).map((imagen, index) => (
              <Box
                key={index}
                component="img"
                src={imagen}
                alt={`${cerro.nombre} ${index + 2}`}
                sx={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 1 }}
              />
            ))}
          </Box>
        )}

        {rutasCerro.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ color: 'primary.dark', mb: 1.5 }}>
              Rutas disponibles
            </Typography>
            <Stack sx={{ gap: 1.5 }}>
              {rutasCerro.map(ruta => (
                <Paper
                  key={ruta.id}
                  variant="outlined"
                  onClick={() => setRutaActiva(ruta)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2.5,
                    py: 1.25,
                    borderRadius: 999,
                    borderWidth: 2,
                    borderColor: 'primary.main',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease, transform 0.1s ease',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Box sx={{ pr: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {ruta.nombre}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {ruta.distanciaKm} km · {ruta.duracion} · Dificultad {ruta.dificultad}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<MapIcon />}
                    onClick={e => {
                      e.stopPropagation()
                      setRutaActiva(ruta)
                    }}
                    sx={{ borderRadius: 999, px: 2, flexShrink: 0 }}
                  >
                    Ver
                  </Button>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}
      </Paper>

      <MapaRutaModal
        open={rutaActiva !== null}
        nombreCerro={cerro.nombre}
        rutas={rutasCerro}
        rutaActiva={rutaActiva}
        onSelectRuta={setRutaActiva}
        onClose={() => setRutaActiva(null)}
      />

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack
          direction="row"
          sx={{ gap: 2, alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
        >
          <Typography variant="h6" sx={{ color: 'primary.dark' }}>
            Comentarios ({cajaComentarios.length})
          </Typography>
          <Button onClick={() => setCaja(!mostrarCaja)}>
            {mostrarCaja ? 'Ocultar' : 'Mostrar'}
          </Button>
        </Stack>

        {comentariosError && (
          <Typography sx={{ color: 'error.main', mb: 2 }}>
            {comentariosError}
          </Typography>
        )}

        <Stack component="form" onSubmit={addComentario} sx={{ gap: 2, mb: 3 }}>
          <TextField
            size="small"
            label="Nombre (opcional)"
            value={nuevoAutor}
            onChange={handleAutorChange}
          />
          <TextField
            size="small"
            label="Escribe un comentario"
            required
            value={nuevoComentario}
            onChange={handleComentarioChange}
          />
          <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-end' }}>
            Publicar
          </Button>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Stack component="ul" sx={{ gap: 1.5, listStyle: 'none', p: 0, m: 0 }}>
          {mostrados.map(comentario => (
            <Comentario key={comentario.id} comentario={comentario} />
          ))}
        </Stack>
      </Paper>
    </Container>
  )
}

export default DetalleCerro
