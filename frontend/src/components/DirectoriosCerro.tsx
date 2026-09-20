import { useState } from 'react'
import cerrosData from '../data/cerros.json'
import BarraBusqueda from './BarraBusqueda'
import ListaCerros from './ListaCerros'
import type { Cerro } from '../types/cerro'

function DirectorioCerros() {
  const [busqueda, setBusqueda] = useState('')
  const [cerroSeleccionado, setCerroSeleccionado] = useState<Cerro | null>(null)
  const cerros = cerrosData as Cerro[]
  const cerrosFiltrados = cerros.filter((cerro) =>
    cerro.nombre.toLocaleLowerCase().includes(busqueda.toLocaleLowerCase()),
  )

  return (
    <div>
      <BarraBusqueda busqueda={busqueda} onBusquedaChange={setBusqueda} />
      {cerroSeleccionado && (
        <p>Seleccionaste: {cerroSeleccionado.nombre}</p>
      )}
      <ListaCerros
        cerros={cerrosFiltrados}
        onSelect={setCerroSeleccionado}
      />
    </div>
  )
}

export default DirectorioCerros
