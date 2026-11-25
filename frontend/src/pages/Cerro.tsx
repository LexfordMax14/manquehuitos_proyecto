import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { AddPhotoAlternate, Close, Map as MapIcon } from '@mui/icons-material'
import type { Cerro, RutaCerro } from '../types/cerro'
import cerros from '../services/cerros'
import type { ComentarioType } from '../types/comentario'
import Comentario from '../components/Comentario'
import MapaRutaModal from '../components/MapaRutaModal'
import comentarios from '../services/comentarios'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store/store'
import {
  obtenerComentarios,
  crearComentario,
} from '../store/comentariosSlice'
import { useAuth } from '../auth/AuthContext'
import { errorMessage } from '../services/auth'

// Deben coincidir con lo que acepta el backend (que vuelve a validar el contenido real).
const FORMATOS_FOTO = ['image/png', 'image/jpeg', 'image/webp']
const MAX_FOTOS = 4
const MAX_BYTES_FOTO = 5 * 1024 * 1024

const DetalleCerro = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const cerroId = id ?? ''
  const [status, setStatus] = useState('loading')
  const [cerro, setCerro] = useState<Cerro | null>(null)
  const [rutaActiva, setRutaActiva] = useState<RutaCerro | null>(null)

  const [nuevoAutor, setNuevoAutor] = useState<string>('')
  const [nuevoComentario, setNuevoComentario] = useState<string>('')
  const dispatch = useDispatch<AppDispatch>()

  const cajaComentarios = useSelector(
    (state: RootState) =>
      state.comentarios.comentariosPorCerro[cerroId] ?? []
  )

  const guardandoComentario = useSelector(
    (state: RootState) =>
      state.comentarios.guardandoPorCerro[cerroId] ?? false
  )

  const comentarioError = useSelector(
    (state: RootState) =>
      state.comentarios.errorPorCerro[cerroId] ?? null
  )
  const [cajaComentarios, setComentarios] = useState<ComentarioType[]>([])
  const [comentarioError, setComentarioError] = useState<string | null>(null)
  const [guardandoComentario, setGuardandoComentario] = useState(false)
  const [fotos, setFotos] = useState<File[]>([])
  const [fotosError, setFotosError] = useState<string | null>(null)

  // Vistas previas de las fotos elegidas; se liberan al cambiar la selección.
  const previews = useMemo(() => fotos.map(foto => URL.createObjectURL(foto)), [fotos])
  useEffect(() => () => previews.forEach(url => URL.revokeObjectURL(url)), [previews])

  const handleFotosChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const elegidas = Array.from(event.target.files ?? [])
    event.target.value = '' // permite volver a elegir el mismo archivo
    const invalida = elegidas.find(foto => !FORMATOS_FOTO.includes(foto.type))
    const pesada = elegidas.find(foto => foto.size > MAX_BYTES_FOTO)
    if (invalida) {
      setFotosError(`"${invalida.name}" no es PNG, JPG ni WEBP.`)
    } else if (pesada) {
      setFotosError(`"${pesada.name}" pesa más de 5 MB.`)
    } else if (fotos.length + elegidas.length > MAX_FOTOS) {
      setFotosError(`Puedes subir como máximo ${MAX_FOTOS} fotos por comentario.`)
    } else {
      setFotosError(null)
      setFotos(actuales => actuales.concat(elegidas))
    }
  }

  const quitarFoto = (index: number) => {
    setFotos(actuales => actuales.filter((_, i) => i !== index))
  }

  const handleAutorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoAutor(event.target.value)
  }

  const handleComentarioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoComentario(event.target.value)
  }

  const addComentario = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    try {
      await dispatch(
        crearComentario({
          cerroId,
          contenido: nuevoComentario,
          autor: nuevoAutor,
        })
      ).unwrap()

      setNuevoAutor('')
      setNuevoComentario('')
    } catch {
      // El error ya se almacena en Redux.
    }
    setComentarioError(null)
    setGuardandoComentario(true)

    comentarios.create({ contenido: nuevoComentario, autor: nuevoAutor }, cerroId, fotos)
      .then(nuevo => {
        setComentarios(comentariosActuales => comentariosActuales.concat(nuevo))
        setNuevoAutor('')
        setNuevoComentario('')
        setFotos([])
        setFotosError(null)
      })
      .catch(error => {
        setComentarioError(errorMessage(error))
      })
      .finally(() => setGuardandoComentario(false))
  }

  const editarComentario = async (comentarioId: string, contenido: string) => {
    setComentarioError(null)
    try {
      const actualizado = await comentarios.update(cerroId, comentarioId, contenido)
      setComentarios(actuales => actuales.map(c => (c.id === comentarioId ? actualizado : c)))
    } catch (error) {
      setComentarioError(errorMessage(error))
      throw error
    }
  }

  const eliminarComentario = async (comentarioId: string) => {
    setComentarioError(null)
    try {
      await comentarios.remove(cerroId, comentarioId)
      setComentarios(actuales => actuales.filter(c => c.id !== comentarioId))
    } catch (error) {
      setComentarioError(errorMessage(error))
      throw error
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    cerros.getCerro(cerroId, controller.signal).then(data => {
      setCerro(data); setRutaActiva(null); setStatus('ready')
    }).catch(error => {
      if (!controller.signal.aborted) setStatus(error.response?.status === 404 ? 'missing' : 'error')
    })
    return () => controller.abort()
  }, [cerroId])

  useEffect(() => {
    if (cerroId) {
      dispatch(obtenerComentarios(cerroId))
    }
  }, [cerroId, dispatch])

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
        {comentarioError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {comentarioError}
          </Alert>
        )}

        <Typography variant="h6" sx={{ color: 'primary.dark', mb: 2 }}>
          Comentarios ({cajaComentarios.length})
        </Typography>

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
          {fotos.length > 0 && (
            <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
              {fotos.map((foto, index) => (
                <Box key={previews[index]} sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    src={previews[index]}
                    alt={foto.name}
                    sx={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 1, display: 'block' }}
                  />
                  <IconButton
                    size="small"
                    aria-label={`Quitar ${foto.name}`}
                    onClick={() => quitarFoto(index)}
                    sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.paper' } }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          )}

          {fotosError && <Alert severity="warning">{fotosError}</Alert>}

          <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
            {user ? (
              <Button
                component="label"
                startIcon={<AddPhotoAlternate />}
                disabled={guardandoComentario || fotos.length >= MAX_FOTOS}
              >
                Agregar fotos
                <input
                  hidden
                  type="file"
                  multiple
                  accept={FORMATOS_FOTO.join(',')}
                  onChange={handleFotosChange}
                />
              </Button>
            ) : (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Inicia sesión para subir fotos.
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={guardandoComentario}
            >
              {guardandoComentario ? 'Guardando...' : 'Publicar'}
            </Button>
          </Stack>
          {user && (
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: -1 }}>
              PNG, JPG o WEBP · máximo {MAX_FOTOS} fotos de 5 MB
            </Typography>
          )}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Stack component="ul" sx={{ gap: 1.5, listStyle: 'none', p: 0, m: 0 }}>
          {cajaComentarios.map(comentario => (
            <Comentario
              key={comentario.id}
              comentario={comentario}
              esAutor={!!user && comentario.usuario === user.id}
              esAdmin={user?.rol === 'admin'}
              onEditar={contenido => editarComentario(comentario.id, contenido)}
              onEliminar={() => eliminarComentario(comentario.id)}
            />
          ))}
        </Stack>
      </Paper>
    </Container>
  )
}

export default DetalleCerro