import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Tests.css'

const API_URL = import.meta.env.VITE_API_URL ?? ''

function Acceso() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState('')
  const [noEncontrado, setNoEncontrado] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBuscando(true)
    setError('')
    setNoEncontrado(false)

    try {
      const response = await fetch(`${API_URL}/api/recuperar-acceso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'No se pudo verificar tu compra. Intenta de nuevo.')
        return
      }

      if (!data.encontrado) {
        setNoEncontrado(true)
        return
      }

      // Si el acceso recuperado es de otra persona, limpiar el progreso local
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
        } catch { /* ignorar JSON inválido */ }
      }

      localStorage.setItem('aprova_acceso', JSON.stringify({
        email: data.email,
        nombre: data.nombre,
        modalidad: data.modalidad,
        sessionId: data.sessionId,
        fecha: data.fecha
      }))

      navigate('/tests')
    } catch (err) {
      console.error('Error al recuperar acceso:', err)
      setError('Error de conexión. Revisa tu internet e intenta de nuevo.')
    } finally {
      setBuscando(false)
    }
  }

  return (
    <div className="tests-page">
      <div className="acceso-requerido">
        <div className="lock-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 019.9-1" />
          </svg>
        </div>
        <h1>Recuperar mi acceso</h1>
        <p>
          Escribe el correo con el que hiciste tu compra y recuperaremos tu acceso
          a los tests, junto con el progreso que ya llevas.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            required
            disabled={buscando}
            style={{
              width: '100%', padding: '14px 16px', fontSize: '16px',
              border: '2px solid #d1d5db', borderRadius: '10px',
              marginBottom: '16px', boxSizing: 'border-box'
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={buscando} style={{ width: '100%' }}>
            {buscando ? 'Verificando tu compra...' : 'Recuperar acceso'}
          </button>
        </form>

        {noEncontrado && (
          <div style={{
            background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '10px',
            padding: '16px', marginTop: '20px', textAlign: 'left'
          }}>
            <p style={{ margin: '0 0 8px', color: '#92400E', fontWeight: '600' }}>
              No encontramos una compra con ese correo
            </p>
            <p style={{ margin: 0, color: '#92400E', fontSize: '14px' }}>
              Verifica que sea el mismo correo que usaste al pagar. Si crees que es un
              error, escríbenos por WhatsApp al (449) 911 9192 y lo resolvemos.
            </p>
          </div>
        )}

        {error && (
          <p style={{ color: '#dc2626', marginTop: '16px', marginBottom: 0 }}>{error}</p>
        )}

        <p style={{ marginTop: '28px', fontSize: '14px' }}>
          ¿Todavía no compras un servicio? <Link to="/servicios">Ver servicios disponibles</Link>
        </p>
      </div>
    </div>
  )
}

export default Acceso
