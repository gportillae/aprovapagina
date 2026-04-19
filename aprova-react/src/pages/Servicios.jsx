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
      answer: "Sí. Solo tú y tu especialista APROVA tienen acceso a los resultados. Nunca se comparten con terceros."
    },
    {
      question: "¿Las sesiones virtuales son en vivo o grabadas?",
      answer: "Son sesiones en vivo por videoconferencia con tu especialista asignado. Se agendan en horarios convenientes para ti."
    },
    {
      question: "¿Tienen servicio en Guadalajara y Ciudad de México?",
      answer: "Sí. Tenemos especialistas en Aguascalientes, Guadalajara y CDMX. La modalidad virtual está disponible desde cualquier lugar."
    },
    {
      question: "¿A qué edad es recomendable hacer la orientación?",
      answer: "Idealmente en los últimos años de preparatoria, aunque también trabajamos con jóvenes que ya están en universidad y desean reorientar su carrera."
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
              <p>Los respondes en línea a tu ritmo. Tus resultados son confidenciales.</p>
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
              <p>Análisis detallado de tu personalidad, habilidades, valores e intereses profesionales.</p>
              <span className="step-tag">Ambas modalidades</span>
            </div>
          </div>
          <div className="step">
            <div className="step-left">
              <div className="step-num">4</div>
            </div>
            <div className="step-text">
              <h4>Sesiones de coaching virtual</h4>
              <p>Proceso de ~12 horas dividido en sesiones de 2 horas. Acompañamiento hasta tu decisión.</p>
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
