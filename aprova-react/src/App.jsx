import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppFloat from './components/WhatsAppFloat'
import Inicio from './pages/Inicio'
import Servicios from './pages/Servicios'
import Pago from './pages/Pago'
import PagoExitoso from './pages/PagoExitoso'
import Tests from './pages/Tests'
import Acceso from './pages/Acceso'
import Contacto from './pages/Contacto'
import Testimonios from './pages/Testimonios'
import Privacidad from './pages/Privacidad'
import Terminos from './pages/Terminos'
import Contenido from './pages/Contenido'
import Seo from './seo/Seo'
import Analytics from './seo/Analytics'
import './App.css'

// El router lo aporta quien monta la app: BrowserRouter en main.jsx y
// StaticRouter en entry-server.jsx, que es lo que permite prerenderizar
// cada ruta a HTML durante el build.
function App() {
  return (
    <div className="app">
      <Seo />
      {/* Después de <Seo> a propósito: su efecto ya fijó el título de la ruta,
          que es el que se manda como page_title. */}
      <Analytics />
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/pago" element={<Pago />} />
          <Route path="/pago-exitoso" element={<PagoExitoso />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/acceso" element={<Acceso />} />
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
