import { useState } from 'react'
import './Contacto.css'

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
)

function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    ciudad: '',
    modalidad: '',
    mensaje: ''
  })
  const [enviado, setEnviado] = useState(false)

  const whatsappNumber = "524499119192"

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: integrar con backend para enviar correo
    setEnviado(true)
    setTimeout(() => setEnviado(false), 5000)
  }

  const openWhatsApp = () => {
    const mensaje = encodeURIComponent('Hola, me interesa conocer más sobre los servicios de orientación vocacional de APROVA.')
    window.open(`https://wa.me/${whatsappNumber}?text=${mensaje}`, '_blank')
  }

  return (
    <div className="contacto-page">
      {/* Hero */}
      <section className="contacto-hero">
        <img
          src="https://www.aprovamx.com/uploads/4/6/5/8/46584589/4332272.png"
          alt=""
          className="hero-watermark"
          aria-hidden="true"
        />
        <span className="badge">Contacto</span>
        <h1>Estamos para ayudarte</h1>
        <p>¿Tienes dudas sobre nuestros servicios? Escríbenos y te respondemos en menos de 24 horas.</p>
      </section>

      {/* Contenido principal */}
      <section className="section contacto-main">
        <div className="contacto-grid">
          {/* Formulario */}
          <div className="contacto-form-wrapper">
            <h2>Envíanos un mensaje</h2>
            <p className="form-sub">Llena el formulario y te contactaremos lo antes posible.</p>

            {enviado ? (
              <div className="form-exito">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                <h3>Mensaje enviado</h3>
                <p>Te contactaremos en menos de 24 horas. Revisa tu correo electrónico.</p>
              </div>
            ) : (
              <form className="contacto-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre completo</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      placeholder="Tu nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Correo electrónico</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="tucorreo@ejemplo.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="telefono">Teléfono (opcional)</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      placeholder="(449) 123 4567"
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ciudad">Ciudad</label>
                    <select
                      id="ciudad"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecciona tu ciudad</option>
                      <option value="aguascalientes">Aguascalientes</option>
                      <option value="guadalajara">Guadalajara</option>
                      <option value="cdmx">Ciudad de México</option>
                      <option value="otra">Otra ciudad</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="modalidad">¿Qué modalidad te interesa?</label>
                  <select
                    id="modalidad"
                    name="modalidad"
                    value={formData.modalidad}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="modalidad1">Modalidad 1 — Solo tests</option>
                    <option value="modalidad2">Modalidad 2 — Tests + asesoría virtual</option>
                    <option value="info">No sé aún, quiero más información</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="mensaje">Mensaje</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    placeholder="¿Tienes alguna pregunta en particular?"
                    rows="4"
                    value={formData.mensaje}
                    onChange={handleChange}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-submit">
                  Enviar mensaje
                </button>
              </form>
            )}
          </div>

          {/* Info de contacto */}
          <div className="contacto-info">
            <div className="info-card">
              <h3>Escríbenos por WhatsApp</h3>
              <p>La forma más rápida de contactarnos. Respondemos al momento.</p>
              <button className="btn btn-whatsapp" onClick={openWhatsApp}>
                <WhatsAppIcon />
                Abrir WhatsApp
              </button>
            </div>

            <div className="info-card">
              <h3>Llámanos</h3>
              <p>Lunes a viernes de 9:00 a 18:00 hrs.</p>
              <a href="tel:+524499119192" className="info-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                (449) 911 9192
              </a>
            </div>

            <div className="info-card">
              <h3>Correo electrónico</h3>
              <p>Para consultas formales o envío de documentos.</p>
              <a href="mailto:contacto@aprovamx.com" className="info-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                contacto@aprovamx.com
              </a>
            </div>

            <div className="info-card sedes-info">
              <h3>Nuestras sedes</h3>
              <div className="sede-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <div>
                  <strong>Aguascalientes</strong>
                  <span>Sede principal</span>
                </div>
              </div>
              <div className="sede-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <div>
                  <strong>Guadalajara</strong>
                  <span>Zona Metropolitana</span>
                </div>
              </div>
              <div className="sede-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <div>
                  <strong>Ciudad de México</strong>
                  <span>CDMX y área metropolitana</span>
                </div>
              </div>
              <p className="virtual-note">Servicio virtual disponible desde cualquier lugar de México.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contacto
