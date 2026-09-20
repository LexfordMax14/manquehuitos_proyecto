import { InputAdornment, TextField } from '@mui/material'
import { Search } from '@mui/icons-material'

interface BarraBusquedaProps {
  busqueda: string
  onBusquedaChange: (valor: string) => void
}

function BarraBusqueda({ busqueda, onBusquedaChange }: BarraBusquedaProps) {
  return (
    <TextField
      fullWidth
      type="search"
      placeholder="Encuentra un cerro..."
      value={busqueda}
      onChange={(event) => onBusquedaChange(event.target.value)}
      slotProps={{
        htmlInput: { 'aria-label': 'Buscar cerro por nombre' },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{ backgroundColor: 'background.paper' }}
    />
  )
}

export default BarraBusqueda
