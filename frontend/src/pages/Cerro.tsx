import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { DetalleCerro } from '../types/detalleCerro'
import cerros from '../services/cerros'

const Cerro = () => {
  const { id } = useParams()
  const cerroId = Number(id);
  const [cerro, setCerro] = useState<DetalleCerro | null>(null)

  useEffect(() => {
    if (cerroId) {
      setCerro(cerros.getCerro(cerroId))
      //.then(cerro => setCerro(cerro))
    }
  }, [])

  if (!id) return null
  if (!cerro) return <p>Cargando...</p>

  return(
    <div className="details">
      <h1>{cerro.nombre}</h1>
      <p>{cerro.createdAt}</p>
      <p>{cerro.updatedAt}</p>
      <div className="top-details">
        <p>{cerro.altura}</p>
        <p>{cerro.dificultad}</p>
        <p>{cerro.ubicacion}</p>
      </div>
      <img
        src={cerro.imagenes[0]}
        alt={cerro.nombre}/>
      <div className="bottom-details">
        <p>{cerro.descripcion}</p>
        <p>{cerro.descansos}</p>
        <p>{cerro.banos}</p>
      </div>
      <div className="images-cont">
        {cerro.imagenes.map((imagen, index) => (
        <img
            key={index}
            src={imagen}
        />
        ))}
      </div>
    </div>
  )
}

export default Cerro