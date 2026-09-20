interface BarraBusquedaProps {
  busqueda: string
  onBusquedaChange: (valor: string) => void
}

function BarraBusqueda({ busqueda, onBusquedaChange }: BarraBusquedaProps) {
  return (
    <div className="search-wrapper">
      <input
        className="search-input"
        type="search"
        placeholder="Encuentra un cerro..."
        value={busqueda}
        onChange={(event) => onBusquedaChange(event.target.value)}
        aria-label="Buscar cerro por nombre"
      />
    </div>
  )
}

export default BarraBusqueda
