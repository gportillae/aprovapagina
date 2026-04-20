import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import './PagoExitoso.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function PagoExitoso() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sessionId = searchParams.get('session_id')
  const modalidad = searchParams.get('modalidad')

  const [verificando, setVerificando] = useState(true)
  const [pagoVerificado, setPagoVerificado] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const verificarPago = async () => {
      if (!sessionId) {
        setError('No se encontró información del pago')
        setVerificando(false)
        return
      }

      try {
        const response = await fetch(
          `${API_URL}/api/verificar-pago/${sessionId}?modalidad=${modalidad}`
        )
        const data = await response.json()

        if (data.pagado) {
          setPagoVerificado(true)
          setEmail(data.email)
          // Usar nombre desde Stripe metadata (más confiable que localStorage)
          const nombreFinal = data.nombre || localStorage.getItem('aprova_temp_nombre') || ''
          // Si es un usuario diferente, limpiar datos de tests anteriores
          const accesoAnterior = localStorage.getItem('aprova_acceso')
          if (accesoAnterior) {
            try {
              const anterior = JSON.parse(accesoAnterior)
              if (anterior.email && anterior.email !== data.email) {
                localStorage.removeItem('aprova_tests_completados')
                localStorage.removeItem('aprova_top3_aptitudes')
                localStorage.removeItem('aprova_top3_intereses')
                localStorage.removeItem('aprova_razonamiento_progreso')
                localStorage.removeItem('aprova_mbti_progreso')
              }
            } catch (e) { /* ignorar JSON inválido */ }
          }
          // Guardar en localStorage para acceso a tests
          localStorage.setItem('aprova_acceso', JSON.stringify({
            email: data.email,
            nombre: nombreFinal,
            modalidad: data.modalidad || modalidad,
            sessionId,
            fecha: new Date().toISOString()
          }))
          // Limpiar nombre temporal
          localStorage.removeItem('aprova_temp_nombre')
        } else {
          setError('El pago no pudo ser verificado')
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Error al verificar el pago')
      } finally {
        setVerificando(false)
      }
    }

    verificarPago()
  }, [sessionId, modalidad])

  if (verificando) {
    return (
      <div className="pago-exitoso-page">
        <div className="verificando">
          <div className="spinner"></div>
          <h2>Verificando tu pago...</h2>
          <p>Por favor espera un momento</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pago-exitoso-page">
        <div className="pago-error">
          <div className="error-icon">!</div>
          <h2>Hubo un problema</h2>
          <p>{error}</p>
          <Link to="/servicios" className="btn btn-primary">
            Volver a servicios
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pago-exitoso-page">
      <div className="pago-exitoso-container">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>

        <h1>¡Pago exitoso!</h1>
        <p className="success-subtitle">
          Gracias por confiar en APROVA. Tu compra ha sido procesada correctamente.
        </p>

        <div className="confirmacion-card">
          <h3>Confirmación enviada a:</h3>
          <p className="email-confirmado">{email}</p>
          <p className="modalidad-info">
            {modalidad === 'modalidad2'
              ? 'Modalidad 2 - Tests + Asesoría Virtual'
              : 'Modalidad 1 - Solo Tests'
            }
          </p>
        </div>

        <div className="siguiente-paso">
          <h3>¿Qué sigue?</h3>
          <p>Ya tienes acceso a los tests psicométricos. Puedes comenzar ahora mismo.</p>

          <Link to="/tests" className="btn-comenzar">
            Comenzar tests
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>

        <p className="nota-adicional">
          También puedes acceder a los tests más tarde desde el menú de navegación.
          Tu acceso está vinculado a tu correo electrónico.
        </p>
      </div>
    </div>
  )
}

export default PagoExitoso
