import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import DirectorioCerros from './components/DirectoriosCerro'
import DetalleCerro from './pages/Cerro'
import CreateCerroForm from './pages/CreateCerroForm'

function App() {
  return (
    <>
      <Header />

      <Routes>
        {/* Las rutas fijas van antes que la del parametro. */}
        <Route path="/" element={<DirectorioCerros />} />
        <Route path="/form" element={<CreateCerroForm />} />
        <Route path="/:id" element={<DetalleCerro />} />
      </Routes>
    </>
  )
}

export default App
