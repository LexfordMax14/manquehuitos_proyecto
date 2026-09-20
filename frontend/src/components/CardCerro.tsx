import { useState } from 'react'
import { Box, Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material'
import type { Cerro } from '../types/cerro'

interface CardCerroProps {
  cerro: Cerro
  // Qué hacer al clickear la tarjeta. La navegación la resuelve quien use
  // este componente.
  onSelect: () => void
}

function CardCerro({ cerro, onSelect }: CardCerroProps) {
  // Estado local: si la imagen no carga, mostramos un texto de reemplazo.
  const [imagenFallo, setImagenFallo] = useState(false)

  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea
        onClick={onSelect}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        {imagenFallo
          ? (
              <Box
                sx={{
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'action.hover',
                  color: 'text.secondary',
                }}
              >
                <Typography variant="body2">Imagen no disponible</Typography>
              </Box>
            )
          : (
              <CardMedia
                component="img"
                image={cerro.imagen}
                alt={`Foto del cerro ${cerro.nombre}`}
                onError={() => setImagenFallo(true)}
                sx={{ height: 200, objectFit: 'cover' }}
              />
            )}

        <CardContent sx={{ width: '100%' }}>
          <Typography variant="h6" sx={{ color: 'primary.dark' }}>
            {cerro.nombre}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {cerro.altura} m · {cerro.ubicacion}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default CardCerro
