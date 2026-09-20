import { Routes } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import DirectorioCerros from './components/DirectoriosCerro'

function App() {
  return (
    <>
      <Header />

      <Routes>
        //rutas 
      </Routes>
      <div className="ticks"></div>
      <section id="spacer"></section>

      <DirectorioCerros />
    </>
  )
}

export default App
