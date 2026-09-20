import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
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
import type { DetalleCerro } from '../types/detalleCerro'
import cerros from '../services/cerros'
import type { ComentarioType } from '../types/comentario'
import Comentario from '../components/Comentario'

const Cerro = () => {
  const { id } = useParams()
  const cerroId = Number(id)
  const [cerro, setCerro] = useState<DetalleCerro | null>(null)

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
    const nuevo: ComentarioType = {
      id: Date.now(),
      cerro: cerroId,
      contenido: nuevoComentario,
      autor: nuevoAutor,
    }

    setComentarios(cajaComentarios.concat(nuevo))
    setNuevoAutor('')
    setNuevoComentario('')
  }

  const mostrados = mostrarCaja ? cajaComentarios : []

  useEffect(() => {
    if (cerroId) {
      setCerro(cerros.getCerro(cerroId))
    }
  }, [])

  if (!id) return null
  if (!cerro) return <Typography sx={{ p: 4 }}>Cargando...</Typography>

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
      </Paper>

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

export default Cerro
