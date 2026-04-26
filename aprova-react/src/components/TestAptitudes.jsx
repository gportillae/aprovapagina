import { useState, useRef } from 'react'
import itemsAptitudes from '../data/items_aptitudes.json'
import './TestAptitudes.css'

const API_URL = import.meta.env.VITE_API_URL ?? ''

const ITEMS_PER_PAGE = 10

function TestAptitudes({ acceso, onVolver, onCompletado }) {
  const [respuestas, setRespuestas] = useState({})
  const [pagina, setPagina] = useState(0)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [iniciado, setIniciado] = useState(false)
  const topRef = useRef(null)

  const totalItems = itemsAptitudes.items.length
  const totalPaginas = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const itemsPagina = itemsAptitudes.items.slice(pagina * ITEMS_PER_PAGE, (pagina + 1) * ITEMS_PER_PAGE)
  const respondidas = Object.keys(respuestas).length

  const handleRespuesta = (itemId, valor) => {
    setRespuestas(prev => ({ ...prev, [itemId]: valor }))
  }

  const navegarPagina = (dir) => {
    if (dir === 'siguiente' && pagina < totalPaginas - 1) {
      setPagina(prev => prev + 1)
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
    } else if (dir === 'anterior' && pagina > 0) {
      setPagina(prev => prev - 1)
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const calcularResultados = () => {
    const resultados = {}
    itemsAptitudes.aptitudes.forEach(apt => {
      resultados[apt] = { puntaje: 0, maximo: 50, items: 0 }
    })

    itemsAptitudes.items.forEach(item => {
      const resp = respuestas[item.id]
      if (resp && resultados[item.aptitud]) {
        resultados[item.aptitud].puntaje += resp
        resultados[item.aptitud].items++
      }
    })

    // Calcular porcentaje y nivel
    Object.keys(resultados).forEach(apt => {
      const r = resultados[apt]
      r.porcentaje = Math.round((r.puntaje / r.maximo) * 100)
      if (r.puntaje >= 40) r.nivel = 'Muy Alto'
      else if (r.puntaje >= 30) r.nivel = 'Alto'
      else if (r.puntaje >= 20) r.nivel = 'Medio'
      else if (r.puntaje >= 10) r.nivel = 'Bajo'
      else r.nivel = 'Muy Bajo'
    })

    return resultados
  }

  const handleEnviar = async () => {
    setEnviando(true)
    setError('')

    const resultados = calcularResultados()

    try {
      const response = await fetch(`${API_URL}/api/enviar-resultados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: acceso.email,
          nombre: acceso.nombre || acceso.email,
          testNombre: 'BRP - Autoevaluación de Aptitudes',
          respuestas: resultados,
          modalidad: acceso.modalidad,
          tipoResultado: 'aptitudes'
        })
      })

      const data = await response.json()
      if (data.success) {
        // Guardar top 3 aptitudes en localStorage para diagnóstico diferencial
        const top3 = Object.entries(resultados)
          .sort((a, b) => b[1].puntaje - a[1].puntaje)
          .slice(0, 3)
          .map(([nombre]) => nombre)
        localStorage.setItem('aprova_top3_aptitudes', JSON.stringify(top3))
        localStorage.setItem('aprova_resultado_aptitudes', JSON.stringify(resultados))
        onCompletado()
      } else {
        setError('Error al enviar. Intenta de nuevo.')
      }
    } catch (err) {
      setError('Error de conexión.')
    } finally {
      setEnviando(false)
    }
  }

  // Contar respondidas en esta página
  const respondidasPagina = itemsPagina.filter(item => respuestas[item.id]).length

  if (!iniciado) {
    return (
      <div className="test-aptitudes" ref={topRef}>
        <div style={{
          maxWidth: '520px', margin: '40px auto', padding: '32px',
          background: '#fff', borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h2 style={{ color: '#26215C', margin: '0 0 8px' }}>Test de Aptitudes BRP</h2>
          <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.6', margin: '0 0 20px' }}>
            Este test contiene <strong>120 actividades</strong> y tiene una duración aproximada de <strong>30-45 minutos</strong>.
          </p>
          <div style={{
            background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '10px',
            padding: '14px 18px', textAlign: 'left', marginBottom: '24px'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#92400E', lineHeight: '1.5' }}>
              <strong>Importante:</strong> Asegurate de tener el tiempo necesario para contestar el test. Si no lo terminas, tendrás que volver a empezar desde el principio.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={onVolver} style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontSize: '14px', cursor: 'pointer' }}>Volver</button>
            <button onClick={() => setIniciado(true)} style={{ padding: '10px 28px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Comenzar test</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="test-aptitudes" ref={topRef}>
      <div className="aptitudes-header">
        <button className="btn-volver-test" onClick={onVolver}>←</button>
        <div className="aptitudes-info">
          <span className="aptitudes-titulo">Aptitudes</span>
          <span className="aptitudes-progreso">{respondidas}/{totalItems}</span>
        </div>
        <div className="aptitudes-paginacion-mini">
          {pagina + 1}/{totalPaginas}
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="aptitudes-progress-bar">
        <div className="aptitudes-progress-fill" style={{ width: `${(respondidas / totalItems) * 100}%` }} />
      </div>

      {/* Instrucciones - visibles en todas las páginas */}
      <div className="aptitudes-instrucciones">
        <p>Califica cada actividad según tu habilidad: <strong>5</strong> = Mucho muy hábil &nbsp; <strong>4</strong> = Muy hábil &nbsp; <strong>3</strong> = Hábil &nbsp; <strong>2</strong> = Poco hábil &nbsp; <strong>1</strong> = Nada hábil</p>
      </div>

      {/* Items */}
      <div className="aptitudes-items">
        {itemsPagina.map((item) => {
          const seleccionada = respuestas[item.id]
          return (
            <div key={item.id} className={`aptitudes-item ${seleccionada ? 'respondida' : ''}`}>
              <p className="item-texto">
                <span className="item-num">{item.id}.</span> {item.texto}
              </p>
              <div className="item-opciones">
                {itemsAptitudes.opciones.map((opcion) => (
                  <button
                    key={opcion.valor}
                    className={`opcion-valor ${seleccionada === opcion.valor ? 'seleccionada' : ''}`}
                    onClick={() => handleRespuesta(item.id, opcion.valor)}
                    title={opcion.texto}
                  >
                    {opcion.valor}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Navegación */}
      <div className="aptitudes-nav">
        <button className="nav-btn" onClick={() => navegarPagina('anterior')} disabled={pagina === 0}>
          ← Anterior
        </button>

        <span className="nav-info">{respondidasPagina}/{itemsPagina.length} en esta página</span>

        {pagina < totalPaginas - 1 ? (
          <button className="nav-btn" onClick={() => navegarPagina('siguiente')}>
            Siguiente →
          </button>
        ) : (
          <button
            className="btn-enviar"
            onClick={handleEnviar}
            disabled={respondidas < totalItems || enviando}
          >
            {enviando ? 'Enviando...' : respondidas < totalItems ? `Faltan ${totalItems - respondidas}` : 'Finalizar y enviar'}
          </button>
        )}
      </div>

      {error && <p className="error-mensaje">{error}</p>}
    </div>
  )
}

export default TestAptitudes
