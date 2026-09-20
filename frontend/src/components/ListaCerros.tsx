import type { Cerro } from '../types/cerro'
import CardCerro from './CardCerro'

interface ListaCerrosProps {
  cerros: Cerro[]
  onSelect: (cerro: Cerro) => void
}

function ListaCerros({ cerros, onSelect }: ListaCerrosProps) {
  return (
    <section className="cerros-grid" aria-label="Lista de cerros">
      {cerros.map((cerro) => (
        <CardCerro
          key={cerro.id}
          cerro={cerro}
          onSelect={() => onSelect(cerro)}
        />
      ))}
    </section>
  )
}

export default ListaCerros
