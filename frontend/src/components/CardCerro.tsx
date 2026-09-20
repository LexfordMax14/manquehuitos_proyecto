import { useState } from 'react'
import type { Cerro } from '../types/cerro'

interface CardCerroProps {
  cerro: Cerro
  // Qué hacer al clickear la tarjeta. La navegación a la nueva ruta la resuelve
  // quien use este componente (p. ej. onSelect={() => navigate(`/cerros/${cerro.id}`)}).
  onSelect: () => void
}

function CardCerro({ cerro, onSelect }: CardCerroProps) {
  // Estado local: si la imagen no carga, mostramos un texto de reemplazo.
  const [imagenFallo, setImagenFallo] = useState(false)

  return (
    <button type="button" onClick={onSelect}>
      {imagenFallo
        ? <span>Imagen no disponible</span>
        : (
            <img
              src={cerro.imagen}
              alt={`Foto del cerro ${cerro.nombre}`}
              width={200}
              onError={() => setImagenFallo(true)}
            />
          )}
      <br />
      <span>{cerro.nombre}</span>
    </button>
  )
}

export default CardCerro