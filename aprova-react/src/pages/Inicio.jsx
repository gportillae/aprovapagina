import { Link } from 'react-router-dom'
import './Inicio.css'

function Inicio() {
  const whatsappNumber = "524499119192"

  const openWhatsApp = () => {
    const mensaje = encodeURIComponent('Hola, me interesa conocer más sobre los servicios de orientación vocacional de APROVA.')
    window.open(`https://wa.me/${whatsappNumber}?text=${mensaje}`, '_blank')
  }

  return (
    <div className="inicio-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">Orientación Vocacional Profesional</span>
          <h1>Descubre tu vocación con claridad y confianza</h1>
          <p>
            En APROVA te ayudamos a conocerte mejor para que tomes la mejor decisión
            sobre tu futuro profesional. Tests psicométricos y asesoría personalizada
            en Aguascalientes, Guadalajara y CDMX.
          </p>
          <div className="hero-cta">
            <Link to="/servicios" className="btn btn-primary">
              Ver servicios
            </Link>
            <button className="btn btn-secondary" onClick={openWhatsApp}>
              Contáctanos
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-shape"></div>
        </div>
      </section>

      {/* Qué hacemos */}
      <section className="section que-hacemos">
        <span className="section-label">¿Qué hacemos?</span>
        <h2>Te acompañamos en tu decisión más importante</h2>
        <p className="sub">
          Elegir carrera no tiene que ser un proceso confuso. Con nuestro método
          probado, descubrirás quién eres y qué camino es el correcto para ti.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.39 0 4.56.93 6.18 2.44"/>
              </svg>
            </div>
            <h3>Tests psicométricos</h3>
            <p>Evaluaciones diseñadas por especialistas para conocer tu personalidad, habilidades e intereses.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3>Asesoría personalizada</h3>
            <p>Sesiones uno a uno con tu especialista APROVA para explorar tus opciones y tomar la mejor decisión.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3>Proceso flexible</h3>
            <p>Modalidades presencial y virtual disponibles. Tú decides cómo y cuándo avanzar en tu proceso.</p>
          </div>
        </div>
      </section>

      {/* Modalidades preview */}
      <section className="section modalidades-preview">
        <span className="section-label">Nuestros servicios</span>
        <h2>Dos modalidades, un mismo objetivo</h2>
        <p className="sub">Elige la opción que mejor se adapte a tus necesidades.</p>

        <div className="modalidades-cards">
          <div className="modalidad-preview-card">
            <span className="modalidad-tag">Modalidad 1</span>
            <h3>Solo tests</h3>
            <p>Ideal para una primera exploración de tu perfil vocacional desde casa.</p>
            <ul>
              <li>Tests psicométricos en línea</li>
              <li>Perfil vocacional por correo</li>
              <li>Resultados confidenciales</li>
            </ul>
          </div>
          <div className="modalidad-preview-card destacada">
            <span className="modalidad-badge">Más completo</span>
            <span className="modalidad-tag">Modalidad 2</span>
            <h3>Tests + asesoría virtual</h3>
            <p>El proceso completo con acompañamiento personalizado.</p>
            <ul>
              <li>Todo lo de la Modalidad 1</li>
              <li>Múltiples sesiones virtuales</li>
              <li>Coaching personalizado</li>
              <li>Seguimiento continuo</li>
            </ul>
          </div>
        </div>

        <div className="section-cta">
          <Link to="/servicios" className="btn btn-primary">
            Ver detalles completos
          </Link>
        </div>
      </section>

      {/* Sedes */}
      <section className="section sedes">
        <span className="section-label">Dónde estamos</span>
        <h2>Presencia en 3 ciudades</h2>
        <p className="sub">Servicio virtual disponible desde cualquier lugar de México.</p>

        <div className="sedes-grid">
          <div className="sede-card">
            <h3>Aguascalientes</h3>
            <p>Sede principal</p>
          </div>
          <div className="sede-card">
            <h3>Guadalajara</h3>
            <p>Zona Metropolitana</p>
          </div>
          <div className="sede-card">
            <h3>Ciudad de México</h3>
            <p>CDMX y área metropolitana</p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="cta-final">
        <h2>¿Listo para descubrir tu vocación?</h2>
        <p>Contáctanos hoy y da el primer paso hacia tu futuro profesional.</p>
        <div className="cta-buttons">
          <Link to="/servicios" className="btn btn-primary">
            Ver servicios
          </Link>
          <button className="btn btn-whatsapp" onClick={openWhatsApp}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fill="none" stroke="white" strokeWidth="1.5"/>
            </svg>
            WhatsApp
          </button>
        </div>
      </section>
    </div>
  )
}

export default Inicio
