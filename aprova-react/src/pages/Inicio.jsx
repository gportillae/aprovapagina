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
        <img
          src="https://www.aprovamx.com/uploads/4/6/5/8/46584589/4332272.png"
          alt=""
          className="hero-watermark"
          aria-hidden="true"
        />
        <div className="hero-content">
          <span className="hero-badge">Orientación Vocacional Profesional</span>
          <h1>¿No sabes qué carrera elegir? No estás solo.</h1>
          <p>
            Más del 40% de los universitarios en México cambian de carrera o abandonan sus estudios.
            En APROVA te ayudamos a descubrir tu vocación con tests psicométricos y asesoría
            personalizada para que elijas con confianza.
          </p>
          <div className="hero-cta">
            <Link to="/servicios" className="btn btn-primary">
              Conoce nuestros servicios
            </Link>
            <button className="btn btn-secondary" onClick={openWhatsApp}>
              Escríbenos por WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* Estadísticas de impacto */}
      <section className="impacto-strip">
        <div className="impacto-grid">
          <div className="impacto-item">
            <span className="impacto-num">500+</span>
            <span className="impacto-label">Estudiantes orientados</span>
          </div>
          <div className="impacto-item">
            <span className="impacto-num">95%</span>
            <span className="impacto-label">Satisfacción</span>
          </div>
          <div className="impacto-item">
            <span className="impacto-num">10+</span>
            <span className="impacto-label">Años de experiencia</span>
          </div>
          <div className="impacto-item">
            <span className="impacto-num">6</span>
            <span className="impacto-label">Tests psicométricos</span>
          </div>
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
            <p>6 evaluaciones que miden tu personalidad, inteligencia, aptitudes, intereses y habilidades de razonamiento.</p>
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

      {/* Proceso paso a paso */}
      <section className="section proceso-inicio">
        <span className="section-label">¿Cómo funciona?</span>
        <h2>Tu camino en 4 pasos</h2>
        <p className="sub">Un proceso claro y sencillo para descubrir tu vocación.</p>

        <div className="pasos-grid">
          <div className="paso-card">
            <div className="paso-num">1</div>
            <h3>Contáctanos</h3>
            <p>Escríbenos por WhatsApp o formulario y elige la modalidad que más te convenga.</p>
          </div>
          <div className="paso-card">
            <div className="paso-num">2</div>
            <h3>Realiza los tests</h3>
            <p>Responde los tests psicométricos en línea desde tu casa, a tu propio ritmo.</p>
          </div>
          <div className="paso-card">
            <div className="paso-num">3</div>
            <h3>Recibe tu perfil</h3>
            <p>Obtén un análisis detallado de tu personalidad, habilidades e intereses profesionales.</p>
          </div>
          <div className="paso-card">
            <div className="paso-num">4</div>
            <h3>Decide con confianza</h3>
            <p>Con tu perfil y la asesoría de nuestros especialistas, elige la carrera correcta para ti.</p>
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
            Ver detalles y precios
          </Link>
        </div>
      </section>

      {/* Testimonios preview */}
      <section className="section testimonios-preview">
        <span className="section-label">Testimonios</span>
        <h2>Lo que dicen nuestros estudiantes</h2>
        <p className="sub">Conoce las experiencias de quienes ya encontraron su vocación.</p>

        <div className="testimonios-preview-grid">
          <div className="testimonio-preview-card">
            <p>"El proceso con APROVA me ayudó a entender que mi perfil es mucho más afín a la psicología clínica. Hoy estoy en tercer semestre y me encanta lo que estudio."</p>
            <div className="testimonio-preview-autor">
              <div className="tp-avatar">S</div>
              <div>
                <strong>Sofía M.</strong>
                <span>Aguascalientes</span>
              </div>
            </div>
          </div>
          <div className="testimonio-preview-card">
            <p>"Los tests me dieron una claridad que no tenía. Descubrí aptitudes que no sabía que tenía y eso me ayudó a elegir ingeniería industrial con confianza."</p>
            <div className="testimonio-preview-autor">
              <div className="tp-avatar">C</div>
              <div>
                <strong>Carlos R.</strong>
                <span>Guadalajara</span>
              </div>
            </div>
          </div>
          <div className="testimonio-preview-card">
            <p>"Como papá, lo que más me gustó fue que incluyeron una sesión con nosotros. Entendimos mejor las fortalezas de nuestro hijo y pudimos apoyarlo."</p>
            <div className="testimonio-preview-autor">
              <div className="tp-avatar">R</div>
              <div>
                <strong>Roberto G.</strong>
                <span>Aguascalientes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="section-cta">
          <Link to="/testimonios" className="btn btn-secondary">
            Ver más testimonios
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
        <img
          src="https://www.aprovamx.com/uploads/4/6/5/8/46584589/4332272.png"
          alt=""
          className="cta-watermark"
          aria-hidden="true"
        />
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
