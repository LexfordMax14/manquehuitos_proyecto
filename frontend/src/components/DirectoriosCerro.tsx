import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'
import cerrosData from '../data/cerros.json'
import BarraBusqueda from './BarraBusqueda'
import ListaCerros from './ListaCerros'
import type { Cerro } from '../types/cerro'

function DirectorioCerros() {
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const cerros = cerrosData as Cerro[]
  const cerrosFiltrados = cerros.filter(cerro =>
    cerro.nombre.toLocaleLowerCase().includes(busqueda.toLocaleLowerCase()),
  )

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ gap: 2, alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ color: 'primary.dark' }}>
            Cerros
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {cerrosFiltrados.length} cerros para explorar
          </Typography>
        </Box>

        <Button component={Link} to="/form" variant="contained" startIcon={<Add />}>
          Crear cerro
        </Button>
      </Stack>

      <Box sx={{ mb: 4 }}>
        <BarraBusqueda busqueda={busqueda} onBusquedaChange={setBusqueda} />
      </Box>

      <ListaCerros
        cerros={cerrosFiltrados}
        onSelect={cerro => navigate(`/${cerro.id}`)}
      />
    </Container>
  )
}

export default DirectorioCerros
