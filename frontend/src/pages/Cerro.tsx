import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { DetalleCerro } from '../types/detalleCerro'
import cerros from '../services/cerros'
import serviceComentario from '../services/comentarios'
import type { Comentario } from '../types/comentario'

const Cerro = () => {
  const { id } = useParams()
  const cerroId = Number(id);
  const [cerro, setCerro] = useState<DetalleCerro | null>(null)

  const [mostrarCaja, setCaja] = useState<boolean>(false);
  const [nuevoAutor, setNuevoAutor] = useState<string>("");
  const [nuevoComentario, setNuevoComentario] = useState<string>("");
  const [cajaComentarios, setComentarios] = useState<Comentario[]>([])

  useEffect(() => {
    serviceComentario.getAll().then((data) => {
      console.log("la llamada termino");
      setComentarios(data);
    });
  }, []);

  const handleAutorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setNuevoAutor(event.target.value);
  };

  const handleComentarioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setNuevoComentario(event.target.value);
  };

  const addComentario = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const comentarioObject: Omit<Comentario, "id"> = {
      cerro: cerroId,
      contenido: nuevoComentario,
      autor: nuevoAutor
    };
    serviceComentario.create(comentarioObject).then((data) => {
      setComentarios(cajaComentarios.concat(data));
      setNuevoAutor("");
      setNuevoComentario("");
    });
  };

  const mostrados = mostrarCaja
  ? cajaComentarios
  : []


  useEffect(() => {
    if (cerroId) {
      setCerro(cerros.getCerro(cerroId))
      //.then(cerro => setCerro(cerro))
    }
  }, [])

  if (!id) return null
  if (!cerro) return <p>Cargando...</p>

  return(
    <>
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

      <div>
        <div>
          <button onClick={() => setCaja(!mostrarCaja)}>
          {mostrarCaja ? "Ocultar" : "Mostrar"} comentarios
          </button>
        </div>

        <form onSubmit={addComentario}>
          <input
            type="text"
            value={nuevoAutor}
            placeholder="Nombre (opcional)"
            onChange={handleAutorChange}
          />
          <input
            type="text"
            value={nuevoComentario}
            placeholder="Pone un comentario"
            onChange={handleComentarioChange}
          />
          <button type="submit">Publicar comentario</button>
        </form>

        <ul>
          {mostrados.map((comentario) => (
            <Comentario
              key={comentario.id}
              note={comentario}
            />
          ))}
        </ul>
      </div>
    </>
  )
}

export default Cerro