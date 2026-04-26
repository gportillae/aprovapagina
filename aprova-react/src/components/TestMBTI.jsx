import { useState, useEffect, useRef } from 'react'
import dataMBTI from '../data/items_mbti.json'
import './TestMBTI.css'

const API_URL = import.meta.env.VITE_API_URL ?? ''
const ITEMS_PER_PAGE = 9
const STORAGE_KEY = 'aprova_mbti_progreso'

function cargarProgreso() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch { return null }
}

function guardarProgreso(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function borrarProgreso() {
  localStorage.removeItem(STORAGE_KEY)
}

function TestMBTI({ acceso, onVolver, onCompletado }) {
  const progreso = cargarProgreso()

  const [respuestas, setRespuestas] = useState(progreso?.respuestas || {})
  const [paginaActual, setPaginaActual] = useState(progreso?.paginaActual || 0)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [mostrarResultado, setMostrarResultado] = useState(false)
  const [resultado, setResultado] = useState(null)
  const topRef = useRef(null)

  const totalPaginas = Math.ceil(dataMBTI.items.length / ITEMS_PER_PAGE)
  const itemsPagina = dataMBTI.items.slice(paginaActual * ITEMS_PER_PAGE, (paginaActual + 1) * ITEMS_PER_PAGE)
  const totalRespondidas = Object.keys(respuestas).length

  // Guardar progreso cada vez que cambian las respuestas o la página
  useEffect(() => {
    guardarProgreso({ respuestas, paginaActual })
  }, [respuestas, paginaActual])

  const handleRespuesta = (id) => {
    setRespuestas(prev => {
      const nuevo = { ...prev }
      if (nuevo[id]) {
        delete nuevo[id]
      } else {
        nuevo[id] = true
      }
      return nuevo
    })
  }

  const navegarPagina = (dir) => {
    if (dir === 'siguiente' && paginaActual < totalPaginas - 1) {
      setPaginaActual(prev => prev + 1)
    } else if (dir === 'anterior' && paginaActual > 0) {
      setPaginaActual(prev => prev - 1)
    }
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const calcularResultados = () => {
    const puntajes = {}
    Object.entries(dataMBTI.scoring).forEach(([letra, preguntas]) => {
      puntajes[letra] = preguntas.filter(id => respuestas[id]).length
    })

    // Determinar tipo
    const dims = dataMBTI.dimensiones
    const tipo = [
      puntajes.E >= puntajes.I ? 'E' : 'I',
      puntajes.S >= puntajes.N ? 'S' : 'N',
      puntajes.T >= puntajes.F ? 'T' : 'F',
      puntajes.J >= puntajes.P ? 'J' : 'P'
    ].join('')

    return {
      puntajes,
      tipo,
      descripcion: dataMBTI.tipos[tipo] || '',
      dimensiones: {
        EI: { E: puntajes.E, I: puntajes.I, dominante: puntajes.E >= puntajes.I ? 'E' : 'I' },
        SN: { S: puntajes.S, N: puntajes.N, dominante: puntajes.S >= puntajes.N ? 'S' : 'N' },
        TF: { T: puntajes.T, F: puntajes.F, dominante: puntajes.T >= puntajes.F ? 'T' : 'F' },
        JP: { J: puntajes.J, P: puntajes.P, dominante: puntajes.J >= puntajes.P ? 'J' : 'P' }
      }
    }
  }

  const handleEnviar = async () => {
    setEnviando(true)
    setError('')
    const resultados = calcularResultados()
    setResultado(resultados)

    try {
      const response = await fetch(`${API_URL}/api/enviar-resultados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: acceso.email,
          nombre: acceso.nombre || acceso.email,
          testNombre: 'Test de Personalidad MBTI',
          respuestas: resultados,
          modalidad: acceso.modalidad,
          tipoResultado: 'mbti'
        })
      })

      const data = await response.json()
      if (data.success) {
        localStorage.setItem('aprova_resultado_mbti', JSON.stringify(resultados))
        borrarProgreso()
        setMostrarResultado(true)
      } else {
        setError('Error al enviar. Intenta de nuevo.')
      }
    } catch (err) {
      setError('Error de conexión.')
    } finally {
      setEnviando(false)
    }
  }

  // Vista de resultado
  if (mostrarResultado && resultado) {
    const dims = dataMBTI.dimensiones
    return (
      <div className="test-mbti" ref={topRef}>
        <div className="mbti-resultado">
          <h2>Tu tipo de personalidad</h2>
          <div className="mbti-tipo-grande">{resultado.tipo}</div>
          <p className="mbti-tipo-desc">{resultado.descripcion}</p>

          <div className="mbti-dimensiones-resultado">
            {Object.entries(resultado.dimensiones).map(([dimKey, dim]) => {
              const dimInfo = dims[dimKey]
              const total = dim[dimInfo.polo1] + dim[dimInfo.polo2]
              const pct1 = total > 0 ? Math.round((dim[dimInfo.polo1] / total) * 100) : 50
              const pct2 = 100 - pct1
              return (
                <div key={dimKey} className="mbti-dim-barra">
                  <div className="mbti-dim-labels">
                    <span className={dim.dominante === dimInfo.polo1 ? 'dominante' : ''}>{dimInfo.nombre1} ({dim[dimInfo.polo1]})</span>
                    <span className={dim.dominante === dimInfo.polo2 ? 'dominante' : ''}>{dimInfo.nombre2} ({dim[dimInfo.polo2]})</span>
                  </div>
                  <div className="mbti-barra-container">
                    <div className="mbti-barra-lado izq" style={{ width: pct1 + '%' }}>
                      <span>{pct1}%</span>
                    </div>
                    <div className="mbti-barra-lado der" style={{ width: pct2 + '%' }}>
                      <span>{pct2}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <button className="btn-mbti-continuar" onClick={onCompletado}>
            Continuar →
          </button>
        </div>
      </div>
    )
  }

  // Vista del test
  return (
    <div className="test-mbti" ref={topRef}>
      <div className="mbti-header">
        <button className="btn-volver-test" onClick={onVolver}>←</button>
        <div className="test-info">
          <span className="mbti-titulo">Test de Personalidad MBTI</span>
          <span className="mbti-progreso">{totalRespondidas}/{dataMBTI.totalPreguntas} marcadas</span>
        </div>
      </div>

      <div className="mbti-instrucciones">
        <p>{dataMBTI.instrucciones}</p>
      </div>

      <div className="progreso-seccion">
        <span>Página {paginaActual + 1}/{totalPaginas}</span>
        <div className="progreso-bar">
          <div className="progreso-fill" style={{ width: `${(totalRespondidas / dataMBTI.totalPreguntas) * 100}%` }} />
        </div>
        <span>{totalRespondidas}/{dataMBTI.totalPreguntas}</span>
      </div>

      <div className="mbti-items">
        {itemsPagina.map(item => {
          const marcada = !!respuestas[item.id]
          return (
            <div key={item.id} className={`mbti-item ${marcada ? 'marcada' : ''}`} onClick={() => handleRespuesta(item.id)}>
              <div className="mbti-checkbox">
                {marcada && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div className="mbti-item-contenido">
                <span className="mbti-item-num">{item.id}.</span>
                <span className="mbti-item-texto">{item.texto}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="navegacion-container">
        <button className="nav-btn" onClick={() => navegarPagina('anterior')} disabled={paginaActual === 0}>← Anterior</button>
        <span className="nav-info">Página {paginaActual + 1} de {totalPaginas}</span>
        {paginaActual < totalPaginas - 1 ? (
          <button className="nav-btn" onClick={() => navegarPagina('siguiente')}>Siguiente →</button>
        ) : (
          <div />
        )}
      </div>

      {paginaActual === totalPaginas - 1 && (
        <div className="mbti-enviar-container">
          <button className="btn-enviar-mbti" onClick={handleEnviar} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Finalizar test'}
          </button>
        </div>
      )}

      {error && <p className="error-mensaje">{error}</p>}
    </div>
  )
}

export default TestMBTI
