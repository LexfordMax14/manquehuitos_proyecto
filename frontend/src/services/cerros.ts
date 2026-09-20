import axios from 'axios'
import cerros from "../assets/ejemplo.json";
import type { DetalleCerro } from '../types/detalleCerro'


const getCerro = (id: number): DetalleCerro => {
  const cerro = cerros.find(cerro => cerro.id === id);

    if (!cerro) {
        throw new Error("Cerro no encontrado");
    }

    return cerro as DetalleCerro;
}


export default {
  getCerro
}
