import { Link } from 'react-router-dom'
import './Testimonios.css'

function Testimonios() {
  const whatsappNumber = "524499119192"

  const testimonios = [
    {
      nombre: "Sofía M.",
      ciudad: "Aguascalientes",
      modalidad: "Modalidad 2",
      texto: "Estaba entre estudiar medicina o psicología y no sabía cómo decidir. El proceso con APROVA me ayudó a entender que mi perfil es mucho más afín a la psicología clínica. Hoy estoy en tercer semestre y me encanta lo que estudio.",
      año: "2025"
    },
    {
      nombre: "Carlos R.",
      ciudad: "Guadalajara",
      modalidad: "Modalidad 1",
      texto: "Los tests me dieron una claridad que no tenía. Descubrí aptitudes que no sabía que tenía y eso me ayudó a elegir ingeniería industrial con confianza. Lo recomiendo mucho.",
      año: "2025"
    },
    {
      nombre: "María José L.",
      ciudad: "CDMX",
      modalidad: "Modalidad 2",
      texto: "Mi hija no quería hablar del tema de la carrera, le causaba mucha ansiedad. Las sesiones con la especialista de APROVA la ayudaron a descubrir sus intereses sin presión. Ahora está segura de su decisión.",
      año: "2024"
    },
    {
      nombre: "Diego A.",
      ciudad: "Aguascalientes",
      modalidad: "Modalidad 2",
      texto: "Ya estaba en segundo semestre de derecho y sentía que no era lo mío. Con APROVA reorienté mi carrera hacia comunicación y fue la mejor decisión. El coaching me dio mucha claridad.",
      año: "2024"
    },
    {
      nombre: "Ana Paula V.",
      ciudad: "Guadalajara",
      modalidad: "Modalidad 1",
      texto: "Tenía muchas opciones en la cabeza y no sabía por dónde empezar. Los resultados del perfil vocacional me ayudaron a filtrar y enfocarme. Muy profesional todo el proceso.",
      año: "2025"
    },
    {
      nombre: "Roberto G.",
      ciudad: "Aguascalientes",
      modalidad: "Modalidad 2",
      texto: "Como papá, lo que más me gustó fue que incluyeron una sesión con nosotros. Entendimos mejor las fortalezas de nuestro hijo y pudimos apoyarlo en su decisión sin imponer.",
      año: "2024"
    }
  ]

  const estadisticas = [
    { numero: "500+", label: "Estudiantes orientados" },
    { numero: "95%", label: "Satisfacción en encuestas" },
    { numero: "3", label: "Ciudades con presencia" },
    { numero: "10+", label: "Años de experiencia" }
  ]

  const openWhatsApp = () => {
    const mensaje = encodeURIComponent('Hola, vi los testimonios en su página y me interesa el servicio de orientación vocacional.')
    window.open(`https://wa.me/${whatsappNumber}?text=${mensaje}`, '_blank')
  }

  return (
    <div className="testimonios-page">
      {/* Hero */}
      <section className="testimonios-hero">
        <img
          src="https://www.aprovamx.com/uploads/4/6/5/8/46584589/4332272.png"
          alt=""
          className="hero-watermark"
          aria-hidden="true"
        />
        <span className="badge">Testimonios</span>
        <h1>Lo que dicen nuestros estudiantes</h1>
        <p>Conoce las experiencias de quienes ya pasaron por el proceso de orientación vocacional con APROVA.</p>
      </section>

      {/* Estadísticas */}
      <section className="section estadisticas">
        <div className="stats-grid">
          {estadisticas.map((stat, i) => (
            <div className="stat-card" key={i}>
              <span className="stat-num">{stat.numero}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonios grid */}
      <section className="section testimonios-section">
        <span className="section-label">Experiencias reales</span>
        <h2>Historias de decisión y confianza</h2>
        <p className="sub">Cada estudiante tiene una historia diferente, pero todos encontraron claridad.</p>

        <div className="testimonios-grid">
          {testimonios.map((t, i) => (
            <div className="testimonio-card" key={i}>
              <div className="testimonio-quote">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
                </svg>
              </div>
              <p className="testimonio-texto">{t.texto}</p>
              <div className="testimonio-autor">
                <div className="autor-avatar">
                  {t.nombre.charAt(0)}
                </div>
                <div className="autor-info">
                  <strong>{t.nombre}</strong>
                  <span>{t.ciudad} · {t.modalidad} · {t.año}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-testimonios">
        <img
          src="https://www.aprovamx.com/uploads/4/6/5/8/46584589/4332272.png"
          alt=""
          className="cta-watermark"
          aria-hidden="true"
        />
        <h2>¿Listo para escribir tu propia historia?</h2>
        <p>Únete a los cientos de estudiantes que encontraron su vocación con APROVA.</p>
        <div className="cta-buttons">
          <Link to="/servicios" className="btn btn-primary">
            Ver servicios
          </Link>
          <button className="btn btn-whatsapp" onClick={openWhatsApp}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fill="none" stroke="white" strokeWidth="1.5"/>
            </svg>
            Contáctanos por WhatsApp
          </button>
        </div>
      </section>
    </div>
  )
}

export default Testimonios
