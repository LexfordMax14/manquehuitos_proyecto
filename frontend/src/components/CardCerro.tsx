import { useState } from 'react'
import { Box, Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material'
import type { Cerro } from '../types/cerro'

interface CardCerroProps {
  cerro: Cerro
  onSelect: () => void
}

function CardCerro({ cerro, onSelect }: CardCerroProps) {
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
                image={cerro.imagenes[0]}
                onError={() => setImagenFallo(true)}
                alt={`Foto del cerro ${cerro.nombre}`}
                
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
