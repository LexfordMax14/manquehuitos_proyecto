import type { ComentarioType } from "../types/comentario";

interface Prop {
  comentario: ComentarioType;
}
const Comentario = ({ comentario }: Prop) => (
  <li>
    {comentario.contenido}
  </li>
);

export default Comentario;
