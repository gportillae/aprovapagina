import { useState, useEffect, useRef, useCallback } from 'react'
import itemsTerman from '../data/items_terman.json'
import './TestTerman.css'

const API_URL = import.meta.env.VITE_API_URL ?? ''

const SERIES_ORDER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

function TestTerman({ acceso, onVolver, onCompletado }) {
  const [serieActual, setSerieActual] = useState(0)
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuestas, setRespuestas] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [tiempoRestante, setTiempoRestante] = useState(null)
  const [serieIniciada, setSerieIniciada] = useState(false)
  const [seriesBloqueadas, setSeriesBloqueadas] = useState({})
  const timerRef = useRef(null)

  const serieKeyActual = SERIES_ORDER[serieActual]
  const tiempoSerie = itemsTerman.series[serieKeyActual]?.tiempoMinutos || 2

  const iniciarSerie = useCallback(() => {
    setSerieIniciada(true)
    setTiempoRestante(tiempoSerie * 60)
  }, [tiempoSerie])

  // Cronómetro regresivo
  useEffect(() => {
    if (!serieIniciada || tiempoRestante === null || tiempoRestante <= 0) {
      if (tiempoRestante === 0 && serieIniciada) {
        // Tiempo agotado: bloquear serie y avanzar a siguiente
        setSeriesBloqueadas(prev => ({ ...prev, [serieKeyActual]: true }))
        if (serieActual < SERIES_ORDER.length - 1) {
          setSerieActual(prev => prev + 1)
          setPreguntaActual(0)
          setSerieIniciada(false)
          setTiempoRestante(null)
        }
      }
      return
    }

    timerRef.current = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [serieIniciada, tiempoRestante, serieActual])

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  const formatTiempo = (segundos) => {
    if (segundos === null) return '--:--'
    const min = Math.floor(segundos / 60)
    const seg = segundos % 60
    return `${min}:${seg.toString().padStart(2, '0')}`
  }

  const serieKey = SERIES_ORDER[serieActual]
  const serie = itemsTerman.series[serieKey]
  const preguntas = serie.preguntas
  const pregunta = preguntas[preguntaActual]

  const totalSeries = SERIES_ORDER.length
  const totalPreguntasSerie = preguntas.length

  // Contar respuestas de la serie actual
  const respuestasSerie = Object.keys(respuestas).filter(k => k.startsWith(`${serieKey}_`)).length

  const handleRespuesta = (valor, autoAvanzar = true) => {
    const key = `${serieKey}_${pregunta.id}`
    setRespuestas(prev => ({ ...prev, [key]: valor }))

    // Avanzar automáticamente solo en tipos de selección (no en inputs de texto)
    if (autoAvanzar && preguntaActual < totalPreguntasSerie - 1) {
      setTimeout(() => setPreguntaActual(prev => prev + 1), 200)
    }
  }

  const handleRespuestaDoble = (letra) => {
    const key = `${serieKey}_${pregunta.id}`
    const actual = respuestas[key] || []

    if (actual.includes(letra)) {
      setRespuestas(prev => ({ ...prev, [key]: actual.filter(l => l !== letra) }))
    } else if (actual.length < 2) {
      setRespuestas(prev => ({ ...prev, [key]: [...actual, letra] }))
    }
  }

  const handleRespuestaSerie = (index, valor) => {
    const key = `${serieKey}_${pregunta.id}`
    const actual = respuestas[key] || ['', '']
    const nuevo = [...actual]
    nuevo[index] = valor
    setRespuestas(prev => ({ ...prev, [key]: nuevo }))
  }

  const navegarPregunta = (direccion) => {
    if (direccion === 'anterior' && preguntaActual > 0) {
      setPreguntaActual(prev => prev - 1)
    } else if (direccion === 'siguiente' && preguntaActual < totalPreguntasSerie - 1) {
      setPreguntaActual(prev => prev + 1)
    }
  }

  const navegarSerie = (direccion) => {
    clearInterval(timerRef.current)
    if (direccion === 'siguiente' && serieActual < totalSeries - 1) {
      // Bloquear la serie actual al avanzar
      setSeriesBloqueadas(prev => ({ ...prev, [SERIES_ORDER[serieActual]]: true }))
      setSerieActual(prev => prev + 1)
      setPreguntaActual(0)
      setSerieIniciada(false)
      setTiempoRestante(null)
    }
  }

  const calcularResultados = () => {
    const resultados = {}

    SERIES_ORDER.forEach(serieKey => {
      const serie = itemsTerman.series[serieKey]
      let aciertos = 0
      let errores = 0

      serie.preguntas.forEach(pregunta => {
        const respuesta = respuestas[`${serieKey}_${pregunta.id}`]
        if (!respuesta) return

        let esCorrecta = false

        switch (serie.tipo) {
          case 'opcion_multiple':
          case 'si_no':
          case 'verdadero_falso':
          case 'seleccion_diferente':
            esCorrecta = respuesta.toLowerCase() === pregunta.correcta.toLowerCase()
            break
          case 'igual_opuesto':
            esCorrecta = respuesta.toLowerCase() === pregunta.correcta.toLowerCase()
            break
          case 'seleccion_doble':
            if (Array.isArray(respuesta) && respuesta.length === 2) {
              const correctas = pregunta.correctas.map(c => c.toLowerCase()).sort()
              const resp = respuesta.map(r => r.toLowerCase()).sort()
              esCorrecta = JSON.stringify(correctas) === JSON.stringify(resp)
            }
            break
          case 'respuesta_numerica':
            esCorrecta = respuesta.toString().replace(/[,\s]/g, '') === pregunta.correcta.toString()
            break
          case 'series_numericas':
            if (Array.isArray(respuesta) && respuesta.length === 2) {
              const c1 = pregunta.correcta[0].toString()
              const c2 = pregunta.correcta[1].toString()
              esCorrecta = respuesta[0] === c1 && respuesta[1] === c2
            }
            break
        }

        if (esCorrecta) aciertos++
        else if (respuesta) errores++
      })

      // Aplicar fórmula de calificación según la serie
      let puntuacion = aciertos
      if (serie.calificacion === 'aciertos_x2') {
        puntuacion = aciertos * 2
      } else if (serie.calificacion === 'aciertos_menos_errores') {
        puntuacion = aciertos - errores
      }

      resultados[serieKey] = {
        nombre: serie.nombre,
        aciertos,
        errores,
        puntuacion,
        total: serie.preguntas.length
      }
    })

    // Calcular sumatoria y CI
    const sumatoria = Object.values(resultados).reduce((sum, r) => sum + r.puntuacion, 0)

    // Buscar edad mental aproximada
    let edadMental = 132
    const tablaEM = itemsTerman.tablaEdadesMentales
    const claves = Object.keys(tablaEM).map(Number).sort((a, b) => a - b)
    for (const clave of claves) {
      if (sumatoria >= clave) {
        edadMental = tablaEM[clave.toString()]
      }
    }

    const ci = Math.round((edadMental / 192) * 100)

    // Determinar rango
    let rango = 'Normal'
    if (ci >= 140) rango = 'Sobresaliente'
    else if (ci >= 120) rango = 'Superior'
    else if (ci >= 110) rango = 'Término Medio Alto'
    else if (ci >= 90) rango = 'Normal'
    else if (ci >= 80) rango = 'Término Medio Bajo'
    else if (ci >= 70) rango = 'Inferior'
    else rango = 'Deficiente'

    return {
      series: resultados,
      sumatoria,
      edadMental,
      ci,
      rango
    }
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
          testNombre: 'Test de Inteligencia TERMAN',
          respuestas: resultados,
          modalidad: acceso.modalidad,
          tipoResultado: 'terman'
        })
      })

      const data = await response.json()
      if (data.success) {
        localStorage.setItem('aprova_resultado_terman', JSON.stringify(resultados))
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

  // Renderizar tipo de pregunta según la serie
  const renderPregunta = () => {
    const key = `${serieKey}_${pregunta.id}`
    const respuestaActual = respuestas[key]

    switch (serie.tipo) {
      case 'opcion_multiple':
        return (
          <div className="pregunta-contenido">
            <p className="pregunta-texto">{pregunta.texto}</p>
            <div className="opciones-grid">
              {pregunta.opciones.map((opcion, idx) => {
                const letra = String.fromCharCode(97 + idx)
                return (
                  <button
                    key={idx}
                    className={`opcion-btn ${respuestaActual === letra ? 'seleccionada' : ''}`}
                    onClick={() => handleRespuesta(letra)}
                  >
                    <span className="letra">{letra})</span> {opcion}
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 'igual_opuesto':
        return (
          <div className="pregunta-contenido">
            <div className="palabras-container">
              <span className="palabra">{pregunta.palabra1}</span>
              <span className="separador">—</span>
              <span className="palabra">{pregunta.palabra2}</span>
            </div>
            <div className="opciones-binarias">
              <button
                className={`opcion-btn grande ${respuestaActual === 'i' ? 'seleccionada igual' : ''}`}
                onClick={() => handleRespuesta('i')}
              >
                IGUAL
              </button>
              <button
                className={`opcion-btn grande ${respuestaActual === 'o' ? 'seleccionada opuesto' : ''}`}
                onClick={() => handleRespuesta('o')}
              >
                OPUESTO
              </button>
            </div>
          </div>
        )

      case 'seleccion_doble':
        return (
          <div className="pregunta-contenido">
            <p className="pregunta-texto">{pregunta.texto}</p>
            <p className="instruccion-mini">Selecciona exactamente 2 opciones</p>
            <div className="opciones-grid">
              {pregunta.opciones.map((opcion, idx) => {
                const letra = String.fromCharCode(97 + idx)
                const seleccionada = (respuestaActual || []).includes(letra)
                return (
                  <button
                    key={idx}
                    className={`opcion-btn ${seleccionada ? 'seleccionada' : ''}`}
                    onClick={() => handleRespuestaDoble(letra)}
                  >
                    <span className="letra">{letra})</span> {opcion}
                  </button>
                )
              })}
            </div>
            <p className="seleccion-count">
              {(respuestaActual || []).length}/2 seleccionadas
            </p>
          </div>
        )

      case 'respuesta_numerica':
        return (
          <div className="pregunta-contenido">
            <p className="pregunta-texto">{pregunta.texto}</p>
            <input
              type="text"
              className="input-numerico"
              placeholder="Tu respuesta..."
              value={respuestaActual || ''}
              onChange={(e) => handleRespuesta(e.target.value, false)}
            />
          </div>
        )

      case 'si_no':
        return (
          <div className="pregunta-contenido">
            <p className="pregunta-texto">{pregunta.texto}</p>
            <div className="opciones-binarias">
              <button
                className={`opcion-btn grande ${respuestaActual === 'si' ? 'seleccionada si' : ''}`}
                onClick={() => handleRespuesta('si')}
              >
                SÍ
              </button>
              <button
                className={`opcion-btn grande ${respuestaActual === 'no' ? 'seleccionada no' : ''}`}
                onClick={() => handleRespuesta('no')}
              >
                NO
              </button>
            </div>
          </div>
        )

      case 'verdadero_falso':
        return (
          <div className="pregunta-contenido">
            <p className="pregunta-texto oracion-desordenada">{pregunta.texto}</p>
            <p className="instruccion-mini">Ordena mentalmente y responde si es verdadero o falso</p>
            <div className="opciones-binarias">
              <button
                className={`opcion-btn grande ${respuestaActual === 'v' ? 'seleccionada verdadero' : ''}`}
                onClick={() => handleRespuesta('v')}
              >
                VERDADERO
              </button>
              <button
                className={`opcion-btn grande ${respuestaActual === 'f' ? 'seleccionada falso' : ''}`}
                onClick={() => handleRespuesta('f')}
              >
                FALSO
              </button>
            </div>
          </div>
        )

      case 'seleccion_diferente':
        return (
          <div className="pregunta-contenido">
            <p className="instruccion-mini">Selecciona la palabra que NO corresponde con las demás</p>
            <div className="opciones-grid horizontal">
              {pregunta.opciones.map((opcion, idx) => {
                const letra = String.fromCharCode(97 + idx)
                return (
                  <button
                    key={idx}
                    className={`opcion-btn ${respuestaActual === letra ? 'seleccionada diferente' : ''}`}
                    onClick={() => handleRespuesta(letra)}
                  >
                    {opcion}
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 'series_numericas':
        return (
          <div className="pregunta-contenido">
            <div className="serie-numeros">
              {pregunta.serie.map((num, idx) => (
                <span key={idx} className="numero">{num}</span>
              ))}
              <input
                type="text"
                className="input-serie"
                placeholder="?"
                value={(respuestaActual || [])[0] || ''}
                onChange={(e) => handleRespuestaSerie(0, e.target.value)}
              />
              <input
                type="text"
                className="input-serie"
                placeholder="?"
                value={(respuestaActual || [])[1] || ''}
                onChange={(e) => handleRespuestaSerie(1, e.target.value)}
              />
            </div>
          </div>
        )

      default:
        return <p>Tipo de pregunta no soportado</p>
    }
  }

  const testCompleto = SERIES_ORDER.every(key => {
    const serie = itemsTerman.series[key]
    const respuestasSerie = Object.keys(respuestas).filter(k => k.startsWith(`${key}_`)).length
    return respuestasSerie >= serie.preguntas.length
  })

  return (
    <div className="test-terman">
      <div className="terman-header">
        <button className="btn-volver-test" onClick={onVolver}>←</button>
        <div className="series-tabs">
          {SERIES_ORDER.map((key, idx) => {
            const s = itemsTerman.series[key]
            const resp = Object.keys(respuestas).filter(k => k.startsWith(`${key}_`)).length
            const completa = resp >= s.preguntas.length
            const bloqueada = seriesBloqueadas[key]
            return (
              <button
                key={key}
                className={`serie-tab ${idx === serieActual ? 'activa' : ''} ${completa ? 'completa' : ''} ${bloqueada ? 'bloqueada' : ''}`}
                onClick={() => {
                  if (bloqueada) return
                  clearInterval(timerRef.current)
                  setSerieActual(idx)
                  setPreguntaActual(0)
                  setSerieIniciada(false)
                  setTiempoRestante(null)
                }}
                disabled={bloqueada}
              >
                {key}
              </button>
            )
          })}
        </div>
        {serieIniciada && (
          <div className={`cronometro ${tiempoRestante !== null && tiempoRestante <= 30 ? 'urgente' : ''}`}>
            <span>{formatTiempo(tiempoRestante)}</span>
          </div>
        )}
      </div>

      {!serieIniciada ? (
        <div className="serie-inicio">
          <div className="serie-inicio-card">
            <h3>Serie {serieKey}: {serie.nombre}</h3>
            <p className="serie-inicio-descripcion">{serie.descripcion}</p>
            <div className="serie-inicio-instrucciones">
              <strong>Instrucciones:</strong>
              <p>{serie.instrucciones}</p>
            </div>
            <div className="serie-inicio-meta">
              <div className="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span><strong>{tiempoSerie}</strong> {tiempoSerie === 1 ? 'minuto' : 'minutos'}</span>
              </div>
              <div className="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
                <span><strong>{preguntas.length}</strong> preguntas</span>
              </div>
            </div>
            <button className="btn-iniciar-serie" onClick={iniciarSerie}>
              Iniciar Serie {serieKey}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="preguntas-mapa">
            {preguntas.map((p, idx) => {
              const contestada = !!respuestas[`${serieKey}_${p.id}`]
              const activa = idx === preguntaActual
              return (
                <button
                  key={p.id}
                  className={`mapa-dot ${contestada ? 'contestada' : 'sin-contestar'} ${activa ? 'activa' : ''}`}
                  onClick={() => setPreguntaActual(idx)}
                  title={`Pregunta ${idx + 1}`}
                />
              )
            })}
          </div>

          <div className="pregunta-container">
            <div className="pregunta-header">
              <span className="pregunta-numero">Pregunta {preguntaActual + 1} de {totalPreguntasSerie}</span>
            </div>
            {renderPregunta()}
          </div>

          <div className="navegacion-container">
            <button className="nav-btn" onClick={() => navegarPregunta('anterior')} disabled={preguntaActual === 0}>
              ← Anterior
            </button>

            <button className="nav-btn" onClick={() => navegarPregunta('siguiente')} disabled={preguntaActual === totalPreguntasSerie - 1}>
              Siguiente →
            </button>
          </div>

          {respuestasSerie >= totalPreguntasSerie && (
            <div className="serie-completa-container">
              <p className="serie-completa-msg">Serie {serieKey} completada</p>
              {serieActual < totalSeries - 1 ? (
                <button className="btn-siguiente-serie" onClick={() => navegarSerie('siguiente')}>
                  Serie siguiente →
                </button>
              ) : (
                <button className="btn-enviar" onClick={handleEnviar} disabled={enviando}>
                  {enviando ? 'Enviando...' : 'Finalizar y enviar'}
                </button>
              )}
            </div>
          )}
        </>
      )}

      {error && <p className="error-mensaje">{error}</p>}
    </div>
  )
}

export default TestTerman
