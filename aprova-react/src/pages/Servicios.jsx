import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Servicios.css'

// Icono de check para las features
const CheckIcon = ({ highlighted }) => (
  <svg viewBox="0 0 10 10" fill="none" stroke={highlighted ? "#3C3489" : "#534AB7"} strokeWidth="1.5">
    <polyline points="2,5 4,7 8,3" />
  </svg>
)

// Icono de WhatsApp
const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fill="none" stroke="white" strokeWidth="1.5"/>
  </svg>
)

function Servicios() {
  const [openFaq, setOpenFaq] = useState(null)
  const navigate = useNavigate()

  const whatsappNumber = "524499119192" // Número de WhatsApp de APROVA

  // Ir a página de pago
  const irAPago = (modalidad) => {
    navigate(`/pago?modalidad=${modalidad}`)
  }

  const faqs = [
    {
      question: "¿Los resultados de los tests son confidenciales?",
      answer: "Sí. Solo tú y tu especialista APROVA tienen acceso a los resultados. Nunca se comparten con terceros ni con instituciones educativas."
    },
    {
      question: "¿Qué tests psicométricos incluye el servicio?",
      answer: "Incluye 6 evaluaciones: Test de Inteligencia (Terman), Áreas Vocacionales, Razonamiento (DAT-5), Aptitudes, Intereses Ocupacionales y Test de Personalidad. Cada uno evalúa una dimensión diferente de tu perfil."
    },
    {
      question: "¿Qué incluye la sesión con padres de familia?",
      answer: "En la Modalidad 2, la última sesión es un coaching para padres donde compartimos el resumen del proceso, entregamos el reporte escrito del perfil vocacional y resolvemos todas las inquietudes para que puedan apoyar la decisión en familia."
    },
    {
      question: "¿Las sesiones virtuales son en vivo o grabadas?",
      answer: "Son sesiones en vivo por videoconferencia con tu especialista asignado. Se agendan en horarios convenientes para ti."
    },
    {
      question: "¿Tienen servicio en Guadalajara y Ciudad de México?",
      answer: "Sí. Tenemos especialistas en Aguascalientes, Guadalajara y CDMX. La modalidad virtual está disponible desde cualquier lugar de México."
    },
    {
      question: "¿A qué edad es recomendable hacer la orientación?",
      answer: "Idealmente en los últimos años de preparatoria, aunque también trabajamos con jóvenes que ya están en universidad y desean reorientar su carrera. Nunca es tarde para tomar una mejor decisión."
    },
    {
      question: "¿Cuánto tiempo toma el proceso completo?",
      answer: "La Modalidad 1 (solo tests) se completa en 1-2 días. La Modalidad 2 es un proceso de aproximadamente 12 horas divididas en sesiones de 2 horas, distribuidas a lo largo de varias semanas según tu disponibilidad."
    },
    {
      question: "¿Puedo hacer reembolso si no estoy satisfecho?",
      answer: "Puedes solicitar reembolso completo dentro de las primeras 48 horas después del pago, siempre que no hayas iniciado ningún test. Consulta nuestros Términos y Condiciones para más detalles."
    }
  ]

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const scrollToForm = () => {
    document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const openWhatsApp = (modalidad) => {
    const mensaje = encodeURIComponent(`Hola, me interesa la ${modalidad} de orientación vocacional de APROVA. ¿Me pueden dar más información?`)
    window.open(`https://wa.me/${whatsappNumber}?text=${mensaje}`, '_blank')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí se integrará Nylas para enviar el correo
    alert('Formulario enviado. Te contactaremos pronto.')
  }

  return (
    <div className="servicios-page">
      {/* Hero Section */}
      <section className="hero-servicios">
        <img
          src="https://www.aprovamx.com/uploads/4/6/5/8/46584589/4332272.png"
          alt=""
          className="hero-watermark"
          aria-hidden="true"
        />
        <span className="badge">Nuestros servicios</span>
        <h1>Dos caminos, un mismo destino</h1>
        <p>Elige la modalidad que mejor se adapte a ti. Ambas incluyen tests psicométricos diseñados por nuestros especialistas.</p>
      </section>

      {/* Modalidades Section */}
      <section className="section modalidades-section">
        <span className="section-label">Modalidades</span>
        <h2>¿Cuál es para ti?</h2>
        <p className="sub">Compara las opciones y contáctanos para recibir más información o agendar tu proceso.</p>

        <div className="modalidades-grid">
          {/* Modalidad 1 */}
          <div className="mod-card">
            <div className="mod-header">
              <span className="mod-num">Modalidad 1</span>
              <h3 className="mod-title">Solo tests</h3>
              <p className="mod-desc">Ideal si buscas una primera exploración de tu perfil vocacional desde casa.</p>
            </div>
            <div className="mod-body">
              <h4>Incluye</h4>
              <div className="feature">
                <div className="feature-dot">
                  <CheckIcon />
                </div>
                <p>
                  Tests psicométricos en línea
                  <span>Diseñados por especialistas APROVA</span>
                </p>
              </div>
              <div className="feature">
                <div className="feature-dot">
                  <CheckIcon />
                </div>
                <p>
                  Perfil vocacional por correo
                  <span>Análisis de personalidad, habilidades e intereses</span>
                </p>
              </div>
              <div className="feature">
                <div className="feature-dot">
                  <CheckIcon />
                </div>
                <p>
                  Resultados confidenciales
                  <span>Solo tú y el especialista los ven</span>
                </p>
              </div>
              <div className="mod-cta">
                <button className="btn-comprar" onClick={() => irAPago('modalidad1')}>
                  Comprar ahora
                </button>
                <button className="btn-wa" onClick={() => openWhatsApp('Modalidad 1 (Solo tests)')}>
                  <WhatsAppIcon />
                  Consultar por WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Modalidad 2 - Destacada */}
          <div className="mod-card destacada">
            <div className="mod-header destacada">
              <span className="mod-num highlighted">Modalidad 2</span>
              <h3 className="mod-title">Tests + asesoría virtual</h3>
              <p className="mod-desc">El proceso completo con acompañamiento personalizado de principio a fin.</p>
              <span className="mod-badge">Más completo</span>
            </div>
            <div className="mod-body">
              <h4>Incluye</h4>
              <div className="feature">
                <div className="feature-dot highlighted">
                  <CheckIcon highlighted />
                </div>
                <p>
                  Todo lo de la Modalidad 1
                  <span>Tests + perfil vocacional por correo</span>
                </p>
              </div>
              <div className="feature">
                <div className="feature-dot highlighted">
                  <CheckIcon highlighted />
                </div>
                <p>
                  Múltiples sesiones virtuales
                  <span>Videoconferencia con tu especialista APROVA</span>
                </p>
              </div>
              <div className="feature">
                <div className="feature-dot highlighted">
                  <CheckIcon highlighted />
                </div>
                <p>
                  Coaching personalizado
                  <span>Proceso de ~12 horas dividido en sesiones</span>
                </p>
              </div>
              <div className="feature">
                <div className="feature-dot highlighted">
                  <CheckIcon highlighted />
                </div>
                <p>
                  Seguimiento continuo
                  <span>Acompañamiento hasta la decisión final</span>
                </p>
              </div>
              <div className="mod-cta">
                <button className="btn-comprar" onClick={() => irAPago('modalidad2')}>
                  Comprar ahora
                </button>
                <button className="btn-wa" onClick={() => openWhatsApp('Modalidad 2 (Tests + asesoría virtual)')}>
                  <WhatsAppIcon />
                  Consultar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Qué evaluamos */}
      <section className="section autoconocimiento-section">
        <span className="section-label">Autoconocimiento</span>
        <h2>¿Qué evaluamos de ti?</h2>
        <p className="sub">
          Para ser feliz y exitoso en una carrera, necesitas elegir algo que se adapte a quien realmente eres.
          Nuestros tests y asesoría exploran 4 dimensiones clave de tu perfil.
        </p>

        <div className="autoconocimiento-grid">
          <div className="ac-card">
            <div className="ac-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h3>Habilidades y aptitudes</h3>
            <p className="ac-question">¿Qué sabes hacer bien? ¿En qué destacas? ¿Qué materias se te dan mejor?</p>
            <p>Identificamos tus capacidades naturales y las áreas donde tienes mayor potencial de desarrollo profesional.</p>
          </div>
          <div className="ac-card">
            <div className="ac-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </div>
            <h3>Personalidad</h3>
            <p className="ac-question">¿Cómo eres? ¿Cómo te comportas? ¿Qué te diferencia de los demás?</p>
            <p>Evaluamos tus rasgos de personalidad para encontrar carreras y ambientes laborales donde puedas ser tú mismo.</p>
          </div>
          <div className="ac-card">
            <div className="ac-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <h3>Valores</h3>
            <p className="ac-question">¿Qué es importante para ti? ¿Cuáles son las razones detrás de tus decisiones?</p>
            <p>Tus valores determinan qué tipo de trabajo te dará satisfacción a largo plazo, no solo al inicio de tu carrera.</p>
          </div>
          <div className="ac-card">
            <div className="ac-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <h3>Intereses profesionales</h3>
            <p className="ac-question">¿Qué te gusta hacer? ¿Cuáles son tus preferencias? ¿Qué haces en tu tiempo libre?</p>
            <p>Exploramos tus intereses genuinos para conectarlos con campos profesionales donde disfrutarás lo que hagas.</p>
          </div>
        </div>
      </section>

      {/* Proceso Section */}
      <section className="proceso">
        <span className="section-label">El camino</span>
        <h2>¿Cómo es el proceso?</h2>
        <div className="steps">
          <div className="step">
            <div className="step-left">
              <div className="step-num">1</div>
              <div className="step-line"></div>
            </div>
            <div className="step-text">
              <h4>Contáctanos y elige tu modalidad</h4>
              <p>Por WhatsApp o formulario. Te respondemos en menos de 24 horas.</p>
              <span className="step-tag">Ambas modalidades</span>
            </div>
          </div>
          <div className="step">
            <div className="step-left">
              <div className="step-num">2</div>
              <div className="step-line"></div>
            </div>
            <div className="step-text">
              <h4>Accedes a los tests psicométricos</h4>
              <p>Respondes en línea a tu ritmo. Evaluamos tu inteligencia, personalidad, aptitudes, intereses y razonamiento con 6 tests especializados.</p>
              <span className="step-tag">Ambas modalidades</span>
            </div>
          </div>
          <div className="step">
            <div className="step-left">
              <div className="step-num">3</div>
              <div className="step-line"></div>
            </div>
            <div className="step-text">
              <h4>Recibes tu perfil vocacional</h4>
              <p>Un reporte escrito con el análisis detallado de tu personalidad, habilidades, valores e intereses, junto con las carreras más afines a tu perfil.</p>
              <span className="step-tag">Ambas modalidades</span>
            </div>
          </div>
          <div className="step">
            <div className="step-left">
              <div className="step-num">4</div>
              <div className="step-line"></div>
            </div>
            <div className="step-text">
              <h4>Coaching personalizado</h4>
              <p>Proceso de ~12 horas en sesiones de 2 horas. Te ayudamos a descubrir tu potencial, detectar tus fortalezas y debilidades, y encontrar áreas de oportunidad.</p>
              <span className="step-tag mod2">Solo Modalidad 2</span>
            </div>
          </div>
          <div className="step">
            <div className="step-left">
              <div className="step-num">5</div>
            </div>
            <div className="step-text">
              <h4>Sesión con padres de familia</h4>
              <p>Una sesión final donde compartimos un resumen del acompañamiento, entregamos el reporte escrito y resolvemos las inquietudes de los padres para apoyar la toma de decisión en familia.</p>
              <span className="step-tag mod2">Solo Modalidad 2</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section faq-section">
        <span className="section-label">Preguntas frecuentes</span>
        <h2>Lo que más nos preguntan</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${openFaq === index ? 'open' : ''}`}
              onClick={() => toggleFaq(index)}
            >
              <div className="faq-q">
                <p>{faq.question}</p>
                <span>{openFaq === index ? '−' : '+'}</span>
              </div>
              {openFaq === index && (
                <div className="faq-a">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contacto Section */}
      <section className="contacto-strip" id="form-section">
        <span className="section-label">Contáctanos</span>
        <h2>¿Tienes dudas? Escríbenos</h2>
        <p>Te respondemos en menos de 24 horas. Sin compromiso.</p>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input type="text" id="nombre" placeholder="Tu nombre completo" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input type="email" id="email" placeholder="tucorreo@ejemplo.com" required />
          </div>
          <div className="form-group">
            <label htmlFor="ciudad">Ciudad</label>
            <select id="ciudad" required>
              <option value="">Selecciona tu ciudad</option>
              <option value="aguascalientes">Aguascalientes</option>
              <option value="guadalajara">Guadalajara</option>
              <option value="cdmx">Ciudad de México</option>
              <option value="otra">Otra ciudad</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="modalidad">Modalidad de interés</label>
            <select id="modalidad" required>
              <option value="">¿Cuál te interesa?</option>
              <option value="modalidad1">Modalidad 1 — Solo tests</option>
              <option value="modalidad2">Modalidad 2 — Tests + asesoría virtual</option>
              <option value="info">No sé aún, quiero más información</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="mensaje">Mensaje (opcional)</label>
            <textarea id="mensaje" placeholder="¿Tienes alguna pregunta en particular?"></textarea>
          </div>
          <button type="submit" className="btn-submit">Enviar mensaje</button>
        </form>
      </section>
    </div>
  )
}

export default Servicios
