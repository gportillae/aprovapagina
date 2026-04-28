import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import './Pago.css'

// Tu Publishable Key de Stripe (desde .env)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_AQUI_VA_TU_PUBLISHABLE_KEY')

const API_URL = import.meta.env.VITE_API_URL ?? ''

const MODALIDADES = {
  modalidad1: {
    nombre: 'Modalidad 1 - Solo Tests',
    descripcion: 'Tests psicométricos en línea + Perfil vocacional por correo',
    incluye: [
      'Tests psicométricos diseñados por especialistas',
      'Perfil vocacional detallado',
      'Resultados confidenciales por correo'
    ]
  },
  modalidad2: {
    nombre: 'Modalidad 2 - Tests + Asesoría Virtual',
    descripcion: 'El proceso completo con acompañamiento personalizado',
    incluye: [
      'Todo lo de la Modalidad 1',
      'Múltiples sesiones virtuales',
      'Coaching personalizado (~12 horas)',
      'Seguimiento hasta tu decisión final'
    ]
  }
}

function Pago() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const modalidad = searchParams.get('modalidad') || 'modalidad1'

  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [cupon, setCupon] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const producto = MODALIDADES[modalidad]

  if (!producto) {
    navigate('/servicios')
    return null
  }

  const handlePago = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/crear-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          modalidad,
          email,
          nombre,
          cupon: cupon.trim() || undefined
        })
      })

      const data = await response.json()

      if (data.url) {
        // Guardar nombre temporalmente antes de ir a Stripe
        localStorage.setItem('aprova_temp_nombre', nombre)
        // Redirigir a Stripe Checkout
        window.location.href = data.url
      } else {
        setError(data.error || 'Error al procesar el pago. Intenta de nuevo.')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error de conexión. Verifica que el servidor esté corriendo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pago-page">
      <div className="pago-container">
        <div className="pago-info">
          <span className="pago-badge">Checkout seguro</span>
          <h1>Completa tu compra</h1>
          <p>Estás a un paso de comenzar tu proceso de orientación vocacional.</p>

          <div className="producto-card">
            <h3>{producto.nombre}</h3>
            <p>{producto.descripcion}</p>
            <ul>
              {producto.incluye.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="seguridad-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <span>Pago seguro procesado por Stripe</span>
          </div>
        </div>

        <div className="pago-form-container">
          <form onSubmit={handlePago} className="pago-form">
            <h2>Tus datos</h2>

            <div className="form-group">
              <label htmlFor="nombre">Nombre completo</label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre completo"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                required
              />
              <span className="form-hint">Aquí recibirás acceso a los tests y tus resultados</span>
            </div>

            <div className="form-group">
              <label htmlFor="cupon">Código de descuento (opcional)</label>
              <input
                type="text"
                id="cupon"
                value={cupon}
                onChange={(e) => setCupon(e.target.value)}
                placeholder="Ingresa tu código"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="btn-pagar"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Continuar al pago'}
            </button>

            <p className="pago-nota">
              Al continuar, serás redirigido a la página segura de Stripe para completar tu pago.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Pago
