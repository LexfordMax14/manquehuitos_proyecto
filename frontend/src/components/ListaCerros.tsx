import { Box, Typography } from '@mui/material'
import type { Cerro } from '../types/cerro'
import CardCerro from './CardCerro'

interface ListaCerrosProps {
  cerros: Cerro[]
  onSelect: (cerro: Cerro) => void
}

function ListaCerros({ cerros, onSelect }: ListaCerrosProps) {
  if (cerros.length === 0) {
    return (
      <Typography sx={{ color: 'text.secondary', py: 4, textAlign: 'center' }}>
        No encontramos ningún cerro con ese nombre.
      </Typography>
    )
  }

  return (
    <Box
      component="section"
      aria-label="Lista de cerros"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 3,
      }}
    >
      {cerros.map(cerro => (
        <CardCerro
          key={cerro.id}
          cerro={cerro}
          onSelect={() => onSelect(cerro)}
        />
      ))}
    </Box>
  )
}

export default ListaCerros
