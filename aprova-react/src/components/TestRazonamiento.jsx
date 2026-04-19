import { useState, useEffect, useRef } from 'react'
import itemsRazonamiento from '../data/items_razonamiento.json'
import baremosData from '../data/baremos_razonamiento.json'
import './TestRazonamiento.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const SECCIONES_ORDER = itemsRazonamiento.ordenSecciones
const ITEMS_PER_PAGE = 10
const STORAGE_KEY = 'aprova_razonamiento_progreso'

const NIVEL_BAREMO_MAP = {
  'secundaria': '4ESO',
  'preparatoria1': '1BACH',
  'preparatoria2': '2BACH'
}

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

function TestRazonamiento({ acceso, onVolver, onCompletado }) {
  // Parámetro ?reset=1 limpia el progreso guardado
  if (new URLSearchParams(window.location.search).get('reset')) {
    borrarProgreso()
    const url = new URL(window.location)
    url.searchParams.delete('reset')
    window.history.replaceState({}, '', url)
  }

  const progreso = cargarProgreso()

  const [datosPersonales, setDatosPersonales] = useState(progreso?.datosPersonales || { sexo: '', nivel: '' })
  const [datosCompletos, setDatosCompletos] = useState(!!progreso?.datosPersonales?.sexo)
  const [respuestas, setRespuestas] = useState(progreso?.respuestas || {})
  const [seccionesCompletadas, setSeccionesCompletadas] = useState(progreso?.seccionesCompletadas || [])

  // Estado de sección activa (cuando está resolviendo una)
  const [seccionActiva, setSeccionActiva] = useState(null)
  const [paginaActual, setPaginaActual] = useState(0)
  const [tiempoRestante, setTiempoRestante] = useState(null)
  const [tiempoIniciado, setTiempoIniciado] = useState(false)
  const [tiempoAgotado, setTiempoAgotado] = useState(false)

  // Perceptiva
  const [partePerceptiva, setPartePerceptiva] = useState(1)
  const [itemPerceptiva, setItemPerceptiva] = useState(0)
  const [perceptivaIniciada, setPerceptivaIniciada] = useState(false)

  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [zoomImagen, setZoomImagen] = useState(null)
  const topRef = useRef(null)

  const seccionKey = seccionActiva
  const seccion = seccionActiva ? itemsRazonamiento.secciones[seccionActiva] : null

  // Persistir progreso cuando cambian respuestas, secciones completadas o datos personales
  useEffect(() => {
    if (datosPersonales.sexo && datosPersonales.nivel) {
      guardarProgreso({ datosPersonales, respuestas, seccionesCompletadas })
    }
  }, [respuestas, seccionesCompletadas, datosPersonales])

  // Timer
  useEffect(() => {
    if (!tiempoIniciado || tiempoRestante === null || tiempoRestante <= 0) return
    const timer = setTimeout(() => {
      setTiempoRestante(prev => prev - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [tiempoRestante, tiempoIniciado])

  // Cuando se acaba el tiempo
  useEffect(() => {
    if (tiempoRestante === 0 && tiempoIniciado) {
      if (seccion?.tipo === 'perceptiva' && partePerceptiva === 1) {
        setPartePerceptiva(2)
        setItemPerceptiva(0)
        setTiempoRestante(null)
        setTiempoIniciado(false)
        setPerceptivaIniciada(false)
      } else {
        setTiempoAgotado(true)
        setTiempoIniciado(false)
      }
    }
  }, [tiempoRestante])

  const finalizarSeccion = () => {
    if (seccionActiva && !seccionesCompletadas.includes(seccionActiva)) {
      setSeccionesCompletadas(prev => [...prev, seccionActiva])
    }
    setSeccionActiva(null)
    setPaginaActual(0)
    setTiempoRestante(null)
    setTiempoIniciado(false)
    setTiempoAgotado(false)
    setPerceptivaIniciada(false)
    setPartePerceptiva(1)
    setItemPerceptiva(0)
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const iniciarSeccion = (key) => {
    setSeccionActiva(key)
    setPaginaActual(0)
    setTiempoRestante(null)
    setTiempoIniciado(false)
    setTiempoAgotado(false)
    setPerceptivaIniciada(false)
    setPartePerceptiva(1)
    setItemPerceptiva(0)
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const iniciarTiempo = () => {
    if (seccion.tipo === 'perceptiva') {
      setTiempoRestante(seccion.tiempoLimiteParte)
      setPerceptivaIniciada(true)
    } else if (seccion.tiempoLimite) {
      setTiempoRestante(seccion.tiempoLimite)
    }
    setTiempoIniciado(true)
  }

  const handleRespuesta = (preguntaNum, valor) => {
    const key = `${seccionKey}_${preguntaNum}`
    setRespuestas(prev => ({ ...prev, [key]: valor }))
  }

  // Generar enunciado de pregunta perceptiva: 5 parejas, una es el modelo (subrayada), 4 son distractores
  const generarEnunciadoPerceptiva = (item) => {
    // Seed determinista por id para que no cambie al re-render
    let seed = item.id * 997 + 31
    const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }

    const letras = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const modelo = item.modelo
    const usadas = new Set([modelo, ...item.opciones])

    // Generar 4 distractores similares al modelo (misma longitud, letras parecidas)
    const distractores = []
    while (distractores.length < 4) {
      let d = ''
      for (let i = 0; i < modelo.length; i++) {
        const charIdx = letras.indexOf(modelo[i].toLowerCase())
        const offset = Math.floor(rand() * 3) + 1
        const dir = rand() > 0.5 ? 1 : -1
        const newIdx = (charIdx + offset * dir + letras.length) % letras.length
        d += letras[newIdx]
      }
      if (!usadas.has(d) && !distractores.includes(d)) {
        distractores.push(d)
      }
    }

    // Mezclar modelo con distractores
    const enunciado = [...distractores]
    const posModelo = Math.floor(rand() * 5)
    enunciado.splice(posModelo, 0, modelo)

    return enunciado
  }

  const handlePerceptivaRespuesta = (itemId, opcionIdx) => {
    const key = `perceptiva_${itemId}`
    setRespuestas(prev => ({ ...prev, [key]: opcionIdx }))
    const itemsParteActual = getItemsPerceptivaParte()
    const idxEnParte = itemsParteActual.findIndex(it => it.id === itemId)
    if (idxEnParte < itemsParteActual.length - 1) {
      setItemPerceptiva(idxEnParte + 1)
    }
  }

  const getItemsPerceptivaParte = () => {
    if (!seccion?.items) return []
    const mitad = Math.ceil(seccion.items.length / 2)
    return partePerceptiva === 1
      ? seccion.items.slice(0, mitad)
      : seccion.items.slice(mitad)
  }

  const navegarPagina = (direccion) => {
    if (seccion.tipo === 'imagen') {
      const paginas = seccion.paginas
      if (direccion === 'anterior' && paginaActual > 0) setPaginaActual(prev => prev - 1)
      else if (direccion === 'siguiente' && paginaActual < paginas.length - 1) setPaginaActual(prev => prev + 1)
    } else {
      const items = seccion.items || []
      const totalPaginas = Math.ceil(items.length / ITEMS_PER_PAGE)
      if (direccion === 'anterior' && paginaActual > 0) setPaginaActual(prev => prev - 1)
      else if (direccion === 'siguiente' && paginaActual < totalPaginas - 1) setPaginaActual(prev => prev + 1)
    }
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const contarRespuestasSeccion = (key) => {
    return Object.keys(respuestas).filter(k => k.startsWith(`${key}_`)).length
  }

  const buscarCentil = (secKey, puntuacionDirecta) => {
    const baremoSeccion = baremosData[secKey]
    if (!baremoSeccion) return null
    const nivelBaremo = NIVEL_BAREMO_MAP[datosPersonales.nivel]
    const sexoBaremo = datosPersonales.sexo
    const claveBaremo = `${sexoBaremo}_${nivelBaremo}`
    const tabla = baremoSeccion[claveBaremo]
    if (!tabla) return null
    return tabla[String(puntuacionDirecta)] ?? 1
  }

  const calcularResultados = () => {
    const resultados = {}
    SECCIONES_ORDER.forEach(key => {
      const sec = itemsRazonamiento.secciones[key]
      let correctas = 0
      let respondidas = 0

      if (sec.respuestas) {
        sec.respuestas.forEach((respCorrecta, idx) => {
          const pregNum = idx + 1
          const respKey = `${key}_${pregNum}`
          if (respuestas[respKey]) {
            respondidas++
            if (respuestas[respKey] === respCorrecta) correctas++
          }
        })
      } else if (sec.tipo === 'perceptiva' && sec.items) {
        // Solo contar Parte 2 (la Parte 1 es de práctica)
        const mitad = Math.ceil(sec.items.length / 2)
        const itemsParte2 = sec.items.slice(mitad)
        itemsParte2.forEach(item => {
          const respKey = `perceptiva_${item.id}`
          if (respuestas[respKey]) {
            respondidas++
            if (respuestas[respKey] === item.correcta) correctas++
          }
        })

        resultados[key] = {
          nombre: sec.nombre,
          totalPreguntas: itemsParte2.length,
          respondidas,
          correctas,
          porcentaje: itemsParte2.length > 0 ? Math.round((correctas / itemsParte2.length) * 100) : 0,
          centil: buscarCentil(key, correctas)
        }
        return
      }

      resultados[key] = {
        nombre: sec.nombre,
        totalPreguntas: sec.totalPreguntas,
        respondidas,
        correctas,
        porcentaje: sec.totalPreguntas > 0 ? Math.round((correctas / sec.totalPreguntas) * 100) : 0,
        centil: buscarCentil(key, correctas)
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
          testNombre: 'Test de Razonamiento',
          respuestas: resultados,
          modalidad: acceso.modalidad,
          tipoResultado: 'razonamiento',
          datosPersonales: {
            sexo: datosPersonales.sexo === 'V' ? 'Masculino' : 'Femenino',
            nivel: datosPersonales.nivel === 'secundaria' ? 'Secundaria' :
                   datosPersonales.nivel === 'preparatoria1' ? '1° Preparatoria' : '2° Preparatoria'
          }
        })
      })

      const data = await response.json()
      if (data.success) {
        borrarProgreso()
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

  const formatTiempo = (segundos) => {
    if (segundos === null) return ''
    const mins = Math.floor(segundos / 60)
    const secs = segundos % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // ===== PANTALLA DATOS PERSONALES =====
  if (!datosCompletos) {
    return (
      <div className="test-razonamiento" ref={topRef}>
        <div className="razonamiento-inicio">
          <div className="inicio-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2>Datos personales</h2>
          <p className="inicio-desc">
            Antes de comenzar, necesitamos algunos datos para calcular tus resultados correctamente.
          </p>

          <div className="datos-personales-form">
            <div className="dato-grupo">
              <label className="dato-label">Sexo</label>
              <div className="dato-opciones">
                <button className={`dato-btn ${datosPersonales.sexo === 'V' ? 'seleccionado' : ''}`}
                  onClick={() => setDatosPersonales(prev => ({ ...prev, sexo: 'V' }))}>Masculino</button>
                <button className={`dato-btn ${datosPersonales.sexo === 'M' ? 'seleccionado' : ''}`}
                  onClick={() => setDatosPersonales(prev => ({ ...prev, sexo: 'M' }))}>Femenino</button>
              </div>
            </div>
            <div className="dato-grupo">
              <label className="dato-label">Nivel educativo</label>
              <div className="dato-opciones dato-opciones-col">
                <button className={`dato-btn ${datosPersonales.nivel === 'secundaria' ? 'seleccionado' : ''}`}
                  onClick={() => setDatosPersonales(prev => ({ ...prev, nivel: 'secundaria' }))}>Secundaria (3°)</button>
                <button className={`dato-btn ${datosPersonales.nivel === 'preparatoria1' ? 'seleccionado' : ''}`}
                  onClick={() => setDatosPersonales(prev => ({ ...prev, nivel: 'preparatoria1' }))}>1° Preparatoria</button>
                <button className={`dato-btn ${datosPersonales.nivel === 'preparatoria2' ? 'seleccionado' : ''}`}
                  onClick={() => setDatosPersonales(prev => ({ ...prev, nivel: 'preparatoria2' }))}>2° Preparatoria</button>
              </div>
            </div>
          </div>

          <div className="inicio-buttons">
            <button onClick={onVolver} className="btn-volver-inicio">Volver</button>
            <button onClick={() => setDatosCompletos(true)} className="btn-comenzar-inicio"
              disabled={!datosPersonales.sexo || !datosPersonales.nivel}>Continuar</button>
          </div>
        </div>
      </div>
    )
  }

  // ===== PANEL DE SECCIONES (vista principal) =====
  if (!seccionActiva) {
    const todasCompletadas = SECCIONES_ORDER.every(k => seccionesCompletadas.includes(k))

    return (
      <div className="test-razonamiento" ref={topRef}>
        <div className="razonamiento-header">
          <button className="btn-volver-test" onClick={onVolver}>←</button>
          <div className="test-info">
            <span className="aptitudes-titulo">Test de Razonamiento</span>
            <span className="aptitudes-progreso">{seccionesCompletadas.length}/{SECCIONES_ORDER.length} secciones</span>
          </div>
        </div>

        <div className="panel-secciones">
          <p className="panel-instruccion">
            Cada sección se aplica de forma individual con su propio tiempo límite.
            Una vez iniciada, debes completarla o esperar a que el tiempo termine.
            Tu progreso se guarda al finalizar cada sección, por lo que puedes continuar con las demás en otro momento.
          </p>

          <div className="secciones-lista">
            {SECCIONES_ORDER.map((key, idx) => {
              const sec = itemsRazonamiento.secciones[key]
              const completada = seccionesCompletadas.includes(key)
              const tiempo = sec.tiempoLimite || sec.tiempoLimiteParte
              const mins = Math.floor(tiempo / 60)
              const resp = contarRespuestasSeccion(key)

              return (
                <div key={key} className={`seccion-card ${completada ? 'completada' : ''}`}>
                  <div className="seccion-card-info">
                    <span className="seccion-card-num">{idx + 1}</span>
                    <div className="seccion-card-datos">
                      <span className="seccion-card-nombre">{sec.nombre}</span>
                      <span className="seccion-card-detalle">
                        {sec.totalPreguntas} preguntas · {mins} min
                        {completada && ` · ${resp} respondidas`}
                      </span>
                    </div>
                  </div>
                  {completada ? (
                    <span className="seccion-card-check">Completada ✓</span>
                  ) : (
                    <button className="btn-iniciar-seccion" onClick={() => iniciarSeccion(key)}>
                      Iniciar
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {todasCompletadas && (
          <div className="finalizar-container">
            <div className="test-completado-msg">
              <h3>Has completado todas las secciones</h3>
              <p>Haz clic en el botón para enviar tus resultados.</p>
            </div>
            <button className="btn-enviar" onClick={handleEnviar} disabled={enviando}>
              {enviando ? 'Enviando...' : 'Enviar resultados'}
            </button>
          </div>
        )}

        {error && <p className="error-mensaje">{error}</p>}
      </div>
    )
  }

  // ===== DENTRO DE UNA SECCIÓN =====

  // Pantalla de tiempo agotado
  if (tiempoAgotado) {
    return (
      <div className="test-razonamiento" ref={topRef}>
        <div className="seccion-presentacion">
          <div className="tiempo-agotado-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3 className="seccion-nombre-titulo">Se acabó el tiempo</h3>
          <p style={{ color: '#6b7280', margin: '12px 0 24px' }}>
            El tiempo para <strong>{seccion.nombre}</strong> ha terminado. Tus respuestas fueron guardadas.
          </p>
          <button className="btn-avanzar-seccion" onClick={finalizarSeccion}>
            Volver al panel de secciones
          </button>
        </div>
      </div>
    )
  }

  // Pantalla de presentación (antes de iniciar cronómetro)
  if (!tiempoIniciado && seccion.tipo !== 'perceptiva') {
    const tiempoMins = Math.floor(seccion.tiempoLimite / 60)
    return (
      <div className="test-razonamiento" ref={topRef}>
        <div className="seccion-presentacion">
          <div className="seccion-presentacion-header">
            <span className="seccion-numero">Sección {SECCIONES_ORDER.indexOf(seccionKey) + 1} de {SECCIONES_ORDER.length}</span>
            <h3 className="seccion-nombre-titulo">{seccion.nombre}</h3>
          </div>
          <div className="seccion-presentacion-info">
            <div className="seccion-dato">
              <span className="seccion-dato-label">Preguntas</span>
              <span className="seccion-dato-valor">{seccion.totalPreguntas}</span>
            </div>
            <div className="seccion-dato">
              <span className="seccion-dato-label">Tiempo</span>
              <span className="seccion-dato-valor">{tiempoMins} minutos</span>
            </div>
          </div>
          <div className="instrucciones-seccion">
            <p>{seccion.instrucciones}</p>
            {seccion.ejemplo && <p className="ejemplo-texto"><strong>Ejemplo:</strong> {seccion.ejemplo}</p>}
          </div>
          <div className="seccion-aviso-no-interrumpir">
            <strong>No se puede interrumpir.</strong> Una vez que inicies, el cronómetro comenzará y no podrás pausarlo.
            Asegúrate de tener {tiempoMins} minutos disponibles.
          </div>
          <button className="btn-iniciar-tiempo" onClick={iniciarTiempo}>
            Iniciar sección
          </button>
        </div>
      </div>
    )
  }

  // ===== RENDER SECCIÓN TEXTO =====
  const renderTexto = () => {
    const items = seccion.items || []
    const totalPaginas = Math.ceil(items.length / ITEMS_PER_PAGE)
    const itemsPagina = items.slice(paginaActual * ITEMS_PER_PAGE, (paginaActual + 1) * ITEMS_PER_PAGE)
    const letras = seccion.tipoRespuesta.split('')
    const respondidasPag = itemsPagina.filter(item => respuestas[`${seccionKey}_${item.id}`]).length

    return (
      <>
        <div className="progreso-seccion">
          <span>Página {paginaActual + 1}/{totalPaginas}</span>
          <div className="progreso-bar">
            <div className="progreso-fill" style={{ width: `${(contarRespuestasSeccion(seccionKey) / seccion.totalPreguntas) * 100}%` }} />
          </div>
          <span>{contarRespuestasSeccion(seccionKey)}/{seccion.totalPreguntas}</span>
        </div>

        <div className="texto-items">
          {itemsPagina.map(item => {
            const respKey = `${seccionKey}_${item.id}`
            const seleccionada = respuestas[respKey]
            return (
              <div key={item.id} className={`texto-item ${seleccionada ? 'respondida' : ''}`}>
                {seccionKey === 'ortografia' ? (
                  <>
                    <p className="item-texto"><span className="item-num">{item.id}.</span> Identifica la palabra con error ortográfico:</p>
                    <div className="ortografia-opciones">
                      {item.palabras.map((palabra, idx) => {
                        const letra = letras[idx]
                        return (
                          <button key={letra} className={`ortografia-opcion ${seleccionada === letra ? 'seleccionada' : ''}`}
                            onClick={() => handleRespuesta(item.id, letra)}>
                            <span className="opcion-letra">{letra}.</span> {palabra}
                          </button>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="item-texto">
                      <span className="item-num">{item.id}.</span>
                      <span className="item-pregunta">{item.texto}</span>
                    </p>
                    <div className="texto-opciones">
                      {item.opciones.map((opcion, idx) => {
                        const letra = letras[idx]
                        return (
                          <button key={letra} className={`texto-opcion ${seleccionada === letra ? 'seleccionada' : ''}`}
                            onClick={() => handleRespuesta(item.id, letra)}>{opcion}</button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div className="navegacion-container">
          <button className="nav-btn" onClick={() => navegarPagina('anterior')} disabled={paginaActual === 0}>← Anterior</button>
          <span className="nav-info">{respondidasPag}/{itemsPagina.length} en esta página</span>
          {paginaActual < totalPaginas - 1 && (
            <button className="nav-btn" onClick={() => navegarPagina('siguiente')}>Siguiente →</button>
          )}
        </div>

        {contarRespuestasSeccion(seccionKey) >= seccion.totalPreguntas && (
          <div className="avanzar-seccion-container">
            <button className="btn-avanzar-seccion" onClick={finalizarSeccion}>
              Finalizar sección →
            </button>
          </div>
        )}
      </>
    )
  }

  // ===== RENDER SECCIÓN IMAGEN =====
  const renderImagen = () => {
    const paginasOriginales = seccion.paginas
    const letras = seccion.tipoRespuesta.split('')

    // Dividir páginas con más de 6 preguntas en sub-páginas (mitad superior/inferior)
    const subPaginas = []
    paginasOriginales.forEach(pag => {
      if (pag.preguntas.length > 6) {
        const mitad = Math.ceil(pag.preguntas.length / 2)
        subPaginas.push({ imagen: pag.imagen, preguntas: pag.preguntas.slice(0, mitad), parte: 'top' })
        subPaginas.push({ imagen: pag.imagen, preguntas: pag.preguntas.slice(mitad), parte: 'bottom' })
      } else {
        subPaginas.push({ ...pag, parte: 'full' })
      }
    })

    const pagInfo = subPaginas[paginaActual]
    if (!pagInfo) return null
    const totalSubPaginas = subPaginas.length

    return (
      <>
        <div className="progreso-seccion">
          <span>Página {paginaActual + 1}/{totalSubPaginas}</span>
          <div className="progreso-bar">
            <div className="progreso-fill" style={{ width: `${(contarRespuestasSeccion(seccionKey) / seccion.totalPreguntas) * 100}%` }} />
          </div>
          <span>{contarRespuestasSeccion(seccionKey)}/{seccion.totalPreguntas}</span>
        </div>

        {zoomImagen && (
          <div className="zoom-overlay" onClick={() => setZoomImagen(null)}>
            <div className="zoom-modal" onClick={e => e.stopPropagation()}>
              <button className="zoom-cerrar" onClick={() => setZoomImagen(null)}>✕</button>
              <img src={zoomImagen} alt="Zoom" className="zoom-img" />
            </div>
          </div>
        )}

        <div className="imagen-respuestas-layout">
          <div className="imagen-container" onClick={() => setZoomImagen(`/dat5/${pagInfo.imagen}`)} style={{ cursor: 'zoom-in' }}>
            <div className={`imagen-clip imagen-clip-${pagInfo.parte}`}>
              <img src={`/dat5/${pagInfo.imagen}`} alt={`${seccion.nombre} - Página ${paginaActual + 1}`} className="imagen-test" />
            </div>
            <span className="zoom-hint">Toca la imagen para ampliar</span>
          </div>

          <div className="respuestas-container">
            <h4>Respuestas:</h4>
            <div className="respuestas-grid">
              {pagInfo.preguntas.map(numPregunta => {
                const key = `${seccionKey}_${numPregunta}`
                const respuestaActual = respuestas[key]
                return (
                  <div key={numPregunta} className="pregunta-row">
                    <span className="pregunta-num">{numPregunta}</span>
                    <div className="opciones-row">
                      {letras.map(letra => (
                        <button key={letra} className={`opcion-mini ${respuestaActual === letra ? 'seleccionada' : ''}`}
                          onClick={() => handleRespuesta(numPregunta, letra)}>{letra}</button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="navegacion-container">
          <button className="nav-btn" onClick={() => setPaginaActual(prev => prev - 1)} disabled={paginaActual === 0}>← Anterior</button>
          <span className="nav-info">Página {paginaActual + 1} de {totalSubPaginas}</span>
          {paginaActual < totalSubPaginas - 1 && (
            <button className="nav-btn" onClick={() => { setPaginaActual(prev => prev + 1); topRef.current?.scrollIntoView({ behavior: 'smooth' }) }}>Siguiente →</button>
          )}
        </div>

        {contarRespuestasSeccion(seccionKey) >= seccion.totalPreguntas && (
          <div className="avanzar-seccion-container">
            <button className="btn-avanzar-seccion" onClick={finalizarSeccion}>
              Finalizar sección →
            </button>
          </div>
        )}
      </>
    )
  }

  // ===== RENDER SECCIÓN PERCEPTIVA =====
  const renderPerceptiva = () => {
    const itemsParte = getItemsPerceptivaParte()
    if (itemsParte.length === 0) return null

    if (!perceptivaIniciada) {
      const tiempoParteMins = Math.floor(seccion.tiempoLimiteParte / 60)
      if (partePerceptiva === 1) {
        return (
          <div className="seccion-presentacion">
            <div className="seccion-presentacion-header">
              <span className="seccion-numero">Sección {SECCIONES_ORDER.indexOf(seccionKey) + 1} de {SECCIONES_ORDER.length}</span>
              <h3 className="seccion-nombre-titulo">{seccion.nombre}</h3>
            </div>
            <div className="seccion-presentacion-info">
              <div className="seccion-dato">
                <span className="seccion-dato-label">Ítems</span>
                <span className="seccion-dato-valor">{seccion.totalPreguntas}</span>
              </div>
              <div className="seccion-dato">
                <span className="seccion-dato-label">Tiempo</span>
                <span className="seccion-dato-valor">{tiempoParteMins} min por parte (2 partes)</span>
              </div>
            </div>
            <div className="instrucciones-seccion">
              <p>{seccion.instrucciones || 'Verás combinaciones de letras/números. Identifica rápidamente cuál es el modelo resaltado y selecciónalo.'}</p>
            </div>
            <div className="seccion-aviso-no-interrumpir">
              <strong>No se puede interrumpir.</strong> Esta sección tiene 2 partes de {tiempoParteMins} minutos cada una.
            </div>
            <button className="btn-iniciar-tiempo" onClick={iniciarTiempo}>Iniciar Parte 1</button>
          </div>
        )
      }
      return (
        <div className="seccion-presentacion">
          <h3 className="seccion-nombre-titulo">{seccion.nombre} — Parte 2</h3>
          <p>Continuamos con la segunda parte. Tienes <strong>{tiempoParteMins} minutos</strong> para {itemsParte.length} ítems.</p>
          <div className="seccion-aviso-no-interrumpir">
            <strong>No se puede interrumpir.</strong> El cronómetro comenzará al dar clic.
          </div>
          <button className="btn-iniciar-tiempo" onClick={iniciarTiempo}>Iniciar Parte 2</button>
        </div>
      )
    }

    const item = itemsParte[itemPerceptiva]
    if (!item) return null
    const respondidas = itemsParte.filter(it => respuestas[`perceptiva_${it.id}`]).length

    return (
      <>
        <div className="progreso-seccion">
          <span>Parte {partePerceptiva} · Ítem {itemPerceptiva + 1}/{itemsParte.length}</span>
          <div className="progreso-bar">
            <div className="progreso-fill" style={{ width: `${(respondidas / itemsParte.length) * 100}%` }} />
          </div>
          <span>{respondidas}/{itemsParte.length}</span>
        </div>

        <div className="perceptiva-container">
          <div className="perceptiva-enunciado">
            {generarEnunciadoPerceptiva(item).map((combo, idx) => (
              <span key={idx} className={`perceptiva-combo ${combo === item.modelo ? 'perceptiva-subrayado' : ''}`}>
                {combo}
              </span>
            ))}
          </div>
          <p className="perceptiva-instruccion">Selecciona la combinación que coincide con la subrayada</p>
          <div className="perceptiva-opciones">
            {item.opciones.map((opcion, idx) => {
              const seleccionada = respuestas[`perceptiva_${item.id}`] === (idx + 1)
              return (
                <button key={idx} className={`perceptiva-opcion ${seleccionada ? 'seleccionada' : ''}`}
                  onClick={() => handlePerceptivaRespuesta(item.id, idx + 1)}>{opcion}</button>
              )
            })}
          </div>
        </div>

        <div className="navegacion-container">
          <button className="nav-btn" onClick={() => setItemPerceptiva(prev => Math.max(0, prev - 1))} disabled={itemPerceptiva === 0}>← Anterior</button>
          <span className="nav-info">Ítem {itemPerceptiva + 1} de {itemsParte.length}</span>
          {itemPerceptiva < itemsParte.length - 1 && (
            <button className="nav-btn" onClick={() => setItemPerceptiva(prev => prev + 1)}>Siguiente →</button>
          )}
        </div>
      </>
    )
  }

  // ===== RENDER SECCIÓN ACTIVA =====
  const renderContenido = () => {
    switch (seccion.tipo) {
      case 'texto': return renderTexto()
      case 'imagen': return renderImagen()
      case 'perceptiva': return renderPerceptiva()
      default: return <p>Tipo de sección no soportado</p>
    }
  }

  return (
    <div className="test-razonamiento" ref={topRef}>
      <div className="razonamiento-header">
        {!tiempoIniciado && <button className="btn-volver-test" onClick={finalizarSeccion}>←</button>}
        <div className="test-info">
          <span className="aptitudes-titulo">{seccion.nombre}</span>
          <span className="aptitudes-progreso">{contarRespuestasSeccion(seccionKey)}/{seccion.totalPreguntas}</span>
        </div>
        {tiempoRestante !== null && tiempoIniciado && (
          <div className={`timer ${tiempoRestante < 30 ? 'urgente' : ''}`}>
            {formatTiempo(tiempoRestante)}
          </div>
        )}
      </div>

      {renderContenido()}
    </div>
  )
}

export default TestRazonamiento
