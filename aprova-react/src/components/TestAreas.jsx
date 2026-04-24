import { useState, useRef } from 'react'
import datosAreas from '../data/items_areas.json'
import './TestAptitudes.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const TIEMPOS = { FM: '15-20 minutos', B: '15-20 minutos', Q: '15-20 minutos', A: '20-25 minutos', S: '10-15 minutos', H: '20-30 minutos' }

function TestAreas({ acceso, onVolver, onCompletado, areasRecomendadas }) {
  const [respuestas, setRespuestas] = useState({})
  const [seccionActual, setSeccionActual] = useState(0)
  const [grupoActual, setGrupoActual] = useState(0)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [iniciado, setIniciado] = useState(false)
  const topRef = useRef(null)

  // Filtrar secciones según diagnóstico diferencial
  const secciones = areasRecomendadas
    ? datosAreas.secciones.filter(s => areasRecomendadas.includes(s.key))
    : datosAreas.secciones
  const seccion = secciones[seccionActual]

  // Items de la sección actual, agrupados
  const itemsSeccion = datosAreas.items.filter(item => item.area === seccion.key)
  const groupSize = seccion.subareas ? seccion.subareas.length : 6
  const totalGrupos = 10 // Todas las secciones tienen 10 grupos
  const grupoItems = itemsSeccion.filter(item => item.grupo === grupoActual + 1)

  // Conteo global
  const seccionKeys = secciones.map(s => s.key)
  const totalItems = datosAreas.items.filter(item => seccionKeys.includes(item.area)).length
  const respondidas = Object.keys(respuestas).length
  const respondidasSeccion = itemsSeccion.filter(item => respuestas[item.id]).length
  const respondidasGrupo = grupoItems.filter(item => respuestas[item.id]).length
  const grupoCompleto = respondidasGrupo === grupoItems.length

  // Verificar que no haya valores repetidos en el grupo actual
  const valoresUsados = grupoItems
    .map(item => respuestas[item.id])
    .filter(v => v !== undefined)

  const hayRepetidos = valoresUsados.length !== new Set(valoresUsados).size

  const handleRespuesta = (itemId, valor) => {
    setRespuestas(prev => ({ ...prev, [itemId]: valor }))
  }

  const cambiarSeccion = (idx) => {
    setSeccionActual(idx)
    setGrupoActual(0)
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const calcularResultados = () => {
    const resultados = {}

    secciones.forEach(sec => {
      const items = datosAreas.items.filter(i => i.area === sec.key)
      const maxValor = sec.subareas ? sec.subareas.length : 6
      let puntaje = 0
      let count = 0
      items.forEach(item => {
        const resp = respuestas[item.id]
        if (resp) {
          puntaje += resp
          count++
        }
      })
      const maxPosible = count * maxValor
      resultados[sec.nombre] = {
        puntaje,
        porcentaje: maxPosible > 0 ? Math.round((puntaje / maxPosible) * 100) : 0,
        preguntas: count
      }

      if (sec.subareas) {
        const subareaResults = {}
        sec.subareas.forEach(sub => {
          const subItems = items.filter(i => i.subarea === sub)
          let subPuntaje = 0
          let subCount = 0
          subItems.forEach(item => {
            const resp = respuestas[item.id]
            if (resp) {
              subPuntaje += resp
              subCount++
            }
          })
          const subMax = subCount * maxValor
          subareaResults[sub] = {
            puntaje: subPuntaje,
            porcentaje: subMax > 0 ? Math.round((subPuntaje / subMax) * 100) : 0,
            preguntas: subCount
          }
        })
        resultados[sec.nombre].subareas = subareaResults
      }
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
          testNombre: `Subtipo: ${seccion.nombre} (APROVA AREAS)`,
          respuestas: resultados,
          modalidad: acceso.modalidad,
          tipoResultado: 'areas'
        })
      })

      const data = await response.json()
      if (data.success) {
        // Guardar/acumular resultados de áreas para el reporte
        const prevAreas = JSON.parse(localStorage.getItem('aprova_resultado_areas') || '{}')
        const merged = { ...prevAreas, ...resultados }
        localStorage.setItem('aprova_resultado_areas', JSON.stringify(merged))
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

  const esUltimoGrupo = seccionActual === secciones.length - 1 && grupoActual === totalGrupos - 1

  // Pantalla de advertencia antes de iniciar
  if (!iniciado) {
    const tiempo = TIEMPOS[seccion.key] || '15-20 minutos'
    return (
      <div className="test-aptitudes" ref={topRef}>
        <div style={{
          maxWidth: '520px', margin: '40px auto', padding: '32px',
          background: '#fff', borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={seccion.color} strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h2 style={{ color: '#26215C', margin: '0 0 8px' }}>Subtipo: {seccion.nombre}</h2>
          <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.6', margin: '0 0 20px' }}>
            Este test contiene <strong>{totalItems} actividades</strong> organizadas en <strong>10 grupos</strong> y tiene una duración aproximada de <strong>{tiempo}</strong>.
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
            <button
              onClick={onVolver}
              style={{
                padding: '10px 24px', borderRadius: '8px', border: '1px solid #d1d5db',
                background: '#fff', color: '#374151', fontSize: '14px', cursor: 'pointer'
              }}
            >
              Volver
            </button>
            <button
              onClick={() => setIniciado(true)}
              style={{
                padding: '10px 28px', borderRadius: '8px', border: 'none',
                background: seccion.color, color: '#fff', fontSize: '14px',
                fontWeight: '600', cursor: 'pointer'
              }}
            >
              Comenzar test
            </button>
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
          <span className="aptitudes-titulo">Áreas</span>
          <span className="aptitudes-progreso">{respondidas}/{totalItems}</span>
        </div>
        <div className="aptitudes-paginacion-mini">
          Grupo {grupoActual + 1}/10
        </div>
      </div>

      {/* Barra de progreso global */}
      <div className="aptitudes-progress-bar">
        <div className="aptitudes-progress-fill" style={{ width: `${(respondidas / totalItems) * 100}%` }} />
      </div>

      {/* Tabs de secciones */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
        {secciones.map((sec, idx) => {
          const secItems = datosAreas.items.filter(i => i.area === sec.key)
          const secResp = secItems.filter(i => respuestas[i.id]).length
          const completa = secResp === secItems.length
          return (
            <button
              key={sec.key}
              onClick={() => cambiarSeccion(idx)}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                borderRadius: '6px',
                border: idx === seccionActual ? `2px solid ${sec.color}` : '1px solid #e5e7eb',
                background: idx === seccionActual ? sec.color + '15' : completa ? '#f0fdf4' : '#fff',
                color: idx === seccionActual ? sec.color : '#6b7280',
                fontWeight: idx === seccionActual ? '700' : '500',
                cursor: 'pointer'
              }}
            >
              {sec.key} {completa ? '✓' : `${secResp}/${secItems.length}`}
            </button>
          )
        })}
      </div>

      {/* Instrucciones */}
      <div className="aptitudes-instrucciones">
        <p>
          <strong style={{ color: seccion.color }}>{seccion.nombre}</strong> — Jerarquiza cada grupo de actividades: asigna <strong>{groupSize}</strong> a la de mayor preferencia, <strong>{groupSize - 1}</strong> a la siguiente, y así hasta <strong>1</strong> (menor preferencia). <em>No repitas números dentro del grupo.</em>
        </p>
      </div>

      {/* Grupo actual de items */}
      <div className="aptitudes-items">
        <div style={{
          background: seccion.color + '10',
          border: `2px solid ${seccion.color}30`,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '8px'
        }}>
          <p style={{ fontWeight: '700', fontSize: '14px', color: seccion.color, margin: '0 0 12px' }}>
            Grupo {grupoActual + 1} de 10
          </p>
          {grupoItems.map((item) => {
            const seleccionada = respuestas[item.id]
            // Valores ya usados por otros items en este grupo (no el actual)
            const otrosUsados = grupoItems
              .filter(i => i.id !== item.id && respuestas[i.id] !== undefined)
              .map(i => respuestas[i.id])

            return (
              <div key={item.id} className={`aptitudes-item ${seleccionada ? 'respondida' : ''}`}
                style={{ marginBottom: '6px' }}>
                <p className="item-texto">
                  <span className="item-num">{item.num}.</span> {item.texto}
                </p>
                <div className="item-opciones">
                  {Array.from({ length: groupSize }, (_, i) => i + 1).map((valor) => {
                    const usadoPorOtro = otrosUsados.includes(valor)
                    return (
                      <button
                        key={valor}
                        className={`opcion-valor ${seleccionada === valor ? 'seleccionada' : ''} ${usadoPorOtro && seleccionada !== valor ? 'usado' : ''}`}
                        onClick={() => !usadoPorOtro && handleRespuesta(item.id, valor)}
                        disabled={usadoPorOtro && seleccionada !== valor}
                        title={valor === groupSize ? 'Mayor preferencia' : valor === 1 ? 'Menor preferencia' : ''}
                        style={usadoPorOtro && seleccionada !== valor ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
                      >
                        {valor}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {hayRepetidos && (
            <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '8px' }}>
              Hay valores repetidos en este grupo. Cada número debe usarse una sola vez.
            </p>
          )}
        </div>
      </div>

      {/* Navegación */}
      <div className="aptitudes-nav">
        <button
          className="nav-btn"
          onClick={() => {
            if (grupoActual > 0) {
              setGrupoActual(prev => prev - 1)
              topRef.current?.scrollIntoView({ behavior: 'smooth' })
            } else if (seccionActual > 0) {
              setSeccionActual(prev => prev - 1)
              setGrupoActual(9) // último grupo de sección anterior
              topRef.current?.scrollIntoView({ behavior: 'smooth' })
            }
          }}
          disabled={seccionActual === 0 && grupoActual === 0}
        >
          ← Anterior
        </button>

        <span className="nav-info">{respondidasGrupo}/{grupoItems.length} en este grupo</span>

        {esUltimoGrupo ? (
          <button
            className="btn-enviar"
            onClick={handleEnviar}
            disabled={respondidas < totalItems || enviando}
          >
            {enviando ? 'Enviando...' : respondidas < totalItems ? `Faltan ${totalItems - respondidas}` : 'Finalizar y enviar'}
          </button>
        ) : (
          <button
            className="nav-btn"
            onClick={() => {
              if (grupoActual < totalGrupos - 1) {
                setGrupoActual(prev => prev + 1)
                topRef.current?.scrollIntoView({ behavior: 'smooth' })
              } else if (seccionActual < secciones.length - 1) {
                setSeccionActual(prev => prev + 1)
                setGrupoActual(0)
                topRef.current?.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >
            Siguiente →
          </button>
        )}
      </div>

      {error && <p className="error-mensaje">{error}</p>}
    </div>
  )
}

export default TestAreas
