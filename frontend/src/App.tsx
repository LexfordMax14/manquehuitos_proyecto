import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Registro from './pages/Registro'
import { ProtectedRoute } from './auth/AuthContext'
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
        <Route path="/form" element={<ProtectedRoute><CreateCerroForm /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/:id" element={<DetalleCerro />} />
      </Routes>
    </>
  )
}

export default App
