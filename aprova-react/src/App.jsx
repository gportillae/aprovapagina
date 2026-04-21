import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppFloat from './components/WhatsAppFloat'
import Inicio from './pages/Inicio'
import Servicios from './pages/Servicios'
import Pago from './pages/Pago'
import PagoExitoso from './pages/PagoExitoso'
import Tests from './pages/Tests'
import Contacto from './pages/Contacto'
import Testimonios from './pages/Testimonios'
import Privacidad from './pages/Privacidad'
import Terminos from './pages/Terminos'
import Contenido from './pages/Contenido'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/pago" element={<Pago />} />
            <Route path="/pago-exitoso" element={<PagoExitoso />} />
            <Route path="/tests" element={<Tests />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/testimonios" element={<Testimonios />} />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="/terminos" element={<Terminos />} />
            <Route path="/contenido" element={<Contenido />} />
          </Routes>
        </main>
        <Footer />
        <WhatsAppFloat />
      </div>
    </Router>
  )
}

// Componente temporal para páginas en construcción
function PaginaEnConstruccion({ titulo }) {
  return (
    <div style={{
      padding: '80px 24px',
      textAlign: 'center',
      minHeight: '50vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ color: '#26215C', marginBottom: '16px' }}>{titulo}</h1>
      <p style={{ color: '#6B6B6B' }}>Esta página estará disponible pronto.</p>
    </div>
  )
}

export default App
