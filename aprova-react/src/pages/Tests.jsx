import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TestAreas from '../components/TestAreas'
import TestTerman from '../components/TestTerman'
import TestAptitudes from '../components/TestAptitudes'
import TestRazonamiento from '../components/TestRazonamiento'
import TestIntereses from '../components/TestIntereses'
import TestMBTI from '../components/TestMBTI'
import './Tests.css'

const API_URL = import.meta.env.VITE_API_URL ?? ''

// Diagnóstico Diferencial - mapeo de áreas a aptitudes e intereses requeridos
const DIAGNOSTICO_DIFERENCIAL = {
  'FM': {
    nombre: 'Físico-Matemáticas',
    aptitudes: ['Numérica', 'Mecánica', 'Coordinación Visomotriz', 'Espacial'],
    intereses: ['Cálculo', 'Mecánico Constructivo', 'Geofísicos', 'Campestre']
  },
  'B': {
    nombre: 'Biológicas',
    aptitudes: ['Abstracta o Científica', 'Social', 'Coordinación Visomotriz'],
    intereses: ['Científico', 'Campestre', 'Biológicos', 'Servicio Social']
  },
  'Q': {
    nombre: 'Químicas',
    aptitudes: ['Abstracta o Científica', 'Numérica'],
    intereses: ['Científico', 'Biológicos']
  },
  'S': {
    nombre: 'Ciencias Sociales',
    aptitudes: ['Social', 'Verbal', 'Persuasiva'],
    intereses: ['Servicio Social', 'Ejecutivo Persuasivo', 'Organización']
  },
  'H': {
    nombre: 'Humanidades',
    aptitudes: ['Verbal', 'Social', 'Artístico Plástica', 'Musical'],
    intereses: ['Literativo', 'Servicio Social', 'Artístico Plástico', 'Musical']
  },
  'A': {
    nombre: 'Administrativas',
    aptitudes: ['Numérica', 'Organización', 'Social', 'Directiva', 'Persuasiva'],
    intereses: ['Ejecutivo Persuasivo', 'Organización', 'Cálculo', 'Servicio Social', 'Contabilidad']
  }
}

function calcularDiagnostico(top3Aptitudes, top3Intereses) {
  const scores = {}
  Object.entries(DIAGNOSTICO_DIFERENCIAL).forEach(([key, area]) => {
    const matchApt = area.aptitudes.filter(a => top3Aptitudes.includes(a)).length
    const matchInt = area.intereses.filter(i => top3Intereses.includes(i)).length
    scores[key] = { ...area, key, matchApt, matchInt, total: matchApt + matchInt }
  })
  // Top 3 áreas por coincidencias
  return Object.values(scores)
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
    .map(a => a.key)
}

function Tests() {
  const navigate = useNavigate()
  const [acceso, setAcceso] = useState(null)
  const [testActual, setTestActual] = useState(null)
  const [respuestas, setRespuestas] = useState({})
  const [testCompletado, setTestCompletado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [diagnostico, setDiagnostico] = useState(null)
  const [generandoReporte, setGenerandoReporte] = useState(false)
  const [reporteError, setReporteError] = useState('')
  const [reporteExito, setReporteExito] = useState(false)
  const [esPrueba, setEsPrueba] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('prueba') === '1'
  })
  const [cargandoEstado, setCargandoEstado] = useState(true)
  const [testsCompletados, setTestsCompletados] = useState(() => {
    const saved = localStorage.getItem('aprova_tests_completados')
    return saved ? JSON.parse(saved) : []
  })

  // Limpiar datos si el usuario actual es diferente al que completó los tests
  useEffect(() => {
    if (!acceso) return
    const emailGuardado = localStorage.getItem('aprova_tests_usuario')
    if (emailGuardado && emailGuardado !== acceso.email) {
      // Usuario diferente: limpiar todos los datos de tests
      localStorage.removeItem('aprova_tests_completados')
      localStorage.removeItem('aprova_top3_aptitudes')
      localStorage.removeItem('aprova_top3_intereses')
      localStorage.removeItem('aprova_razonamiento_progreso')
      localStorage.removeItem('aprova_mbti_progreso')
      localStorage.removeItem('aprova_resultado_terman')
      localStorage.removeItem('aprova_resultado_aptitudes')
      localStorage.removeItem('aprova_resultado_intereses')
      localStorage.removeItem('aprova_resultado_areas')
      localStorage.removeItem('aprova_resultado_razonamiento')
      localStorage.removeItem('aprova_resultado_mbti')
      setTestsCompletados([])
      setDiagnostico(null)
    }
    // Siempre guardar el email del usuario actual
    localStorage.setItem('aprova_tests_usuario', acceso.email)
  }, [acceso])

  // Cargar estado de tests desde el servidor
  useEffect(() => {
    if (!acceso) { setCargandoEstado(false); return }
    if (esPrueba) { setCargandoEstado(false); return }
    const cargarEstadoServidor = async () => {
      try {
        const response = await fetch(`${API_URL}/api/resultados/${encodeURIComponent(acceso.email)}`)
        if (response.ok) {
          const data = await response.json()
          if (data.testsCompletados && data.testsCompletados.length > 0) {
            setTestsCompletados(prev => {
              const merged = [...new Set([...prev, ...data.testsCompletados])]
              localStorage.setItem('aprova_tests_completados', JSON.stringify(merged))
              return merged
            })
            // Restaurar diagnóstico si el servidor tiene aptitudes e intereses
            if (data.tests?.aptitudes?.resultados && data.tests?.intereses?.resultados) {
              const aptRes = data.tests.aptitudes.resultados
              const intRes = data.tests.intereses.resultados
              // Extraer top3 de aptitudes (por porcentaje)
              const aptEntries = Object.entries(aptRes).sort((a, b) => b[1].porcentaje - a[1].porcentaje)
              const top3Apt = aptEntries.slice(0, 3).map(([nombre]) => nombre)
              // Extraer top3 de intereses (por porcentaje)
              const intEntries = Object.entries(intRes).sort((a, b) => b[1].porcentaje - a[1].porcentaje)
              const top3Int = intEntries.slice(0, 3).map(([nombre]) => nombre)
              localStorage.setItem('aprova_top3_aptitudes', JSON.stringify(top3Apt))
              localStorage.setItem('aprova_top3_intereses', JSON.stringify(top3Int))
              const areas = calcularDiagnostico(top3Apt, top3Int)
              setDiagnostico({ top3Apt, top3Int, areas })
            }
          }
        }
      } catch (err) {
        console.warn('No se pudo conectar al servidor para cargar estado:', err)
      } finally {
        setCargandoEstado(false)
      }
    }
    cargarEstadoServidor()
  }, [acceso])

  // Verificar si todos los tests están completados
  const esModalidad2 = acceso && acceso.modalidad === 'modalidad2'
  const subtiposCompletos = diagnostico
    ? diagnostico.areas.every(key => testsCompletados.includes(`area_${key}`))
    : false
  const todosTestsCompletos = testsCompletados.includes('terman') &&
    testsCompletados.includes('aptitudes') &&
    testsCompletados.includes('intereses') &&
    testsCompletados.includes('area_PU') &&
    subtiposCompletos &&
    (!esModalidad2 || (testsCompletados.includes('razonamiento') && testsCompletados.includes('mbti')))

  const handleGenerarReporte = async () => {
    setGenerandoReporte(true)
    setReporteError('')
    setReporteExito(false)

    try {
      const response = await fetch(`${API_URL}/api/generar-reporte`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: acceso.email })
      })

      if (!response.ok) {
        throw new Error('Error al generar el reporte')
      }

      // Descargar el PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Reporte_Vocacional_${(acceso.nombre || 'usuario').replace(/\s+/g, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      setReporteExito(true)
    } catch (err) {
      console.error('Error al generar reporte:', err)
      setReporteError('Error al generar el reporte. Intenta de nuevo.')
    } finally {
      setGenerandoReporte(false)
    }
  }

  const marcarTestCompletado = (testId) => {
    setTestsCompletados(prev => {
      if (prev.includes(testId)) return prev
      const updated = [...prev, testId]
      localStorage.setItem('aprova_tests_completados', JSON.stringify(updated))
      return updated
    })
  }

  // Recalcular diagnóstico diferencial
  const recalcularDiagnostico = () => {
    const apt = localStorage.getItem('aprova_top3_aptitudes')
    const int = localStorage.getItem('aprova_top3_intereses')
    if (apt && int) {
      const top3Apt = JSON.parse(apt)
      const top3Int = JSON.parse(int)
      const areas = calcularDiagnostico(top3Apt, top3Int)
      setDiagnostico({ top3Apt, top3Int, areas })
    }
  }

  // Verificar acceso al cargar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const modoPrueba = params.get('prueba') === '1'
    setEsPrueba(modoPrueba)

    const accesoGuardado = localStorage.getItem('aprova_acceso')

    // Modo prueba: /tests?prueba=1 — resetea todo para poder probar cualquier test
    if (modoPrueba) {
      localStorage.removeItem('aprova_tests_completados')
      localStorage.removeItem('aprova_top3_aptitudes')
      localStorage.removeItem('aprova_top3_intereses')
      localStorage.removeItem('aprova_razonamiento_progreso')
      localStorage.removeItem('aprova_mbti_progreso')
      localStorage.removeItem('aprova_resultado_terman')
      localStorage.removeItem('aprova_resultado_aptitudes')
      localStorage.removeItem('aprova_resultado_intereses')
      localStorage.removeItem('aprova_resultado_areas')
      localStorage.removeItem('aprova_resultado_razonamiento')
      localStorage.removeItem('aprova_resultado_mbti')
      setTestsCompletados([])
      setDiagnostico(null)
      const accesoPrueba = { email: 'prueba@aprova.com', nombre: 'Usuario Prueba', modalidad: 'modalidad1' }
      localStorage.setItem('aprova_acceso', JSON.stringify(accesoPrueba))
      setAcceso(accesoPrueba)
      recalcularDiagnostico()
      return
    }

    if (accesoGuardado) {
      setAcceso(JSON.parse(accesoGuardado))
    }
    recalcularDiagnostico()
  }, [])

  // Si no tiene acceso, mostrar pantalla de bloqueo
  if (!acceso) {
    return (
      <div className="tests-page">
        <div className="acceso-requerido">
          <div className="lock-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <h1>Acceso restringido</h1>
          <p>Para acceder a los tests psicométricos necesitas adquirir uno de nuestros servicios.</p>
          <Link to="/servicios" className="btn btn-primary">
            Ver servicios disponibles
          </Link>
        </div>
      </div>
    )
  }

  // Info de áreas para generar cards dinámicas
  const AREA_INFO = {
    FM: { nombre: 'Físico-Matemáticas', preguntas: 80, duracion: '15-20 min', subareas: 8, desc: 'Evalúa 8 subáreas: puras, artefactos, naturaleza, industria, construcción, manejo de datos, medición geodésica y diseño' },
    B: { nombre: 'Biológicas', preguntas: 70, duracion: '15-20 min', subareas: 7, desc: 'Evalúa 7 subáreas: puras, salud humana, salud animal, terrestre, silvícola, ambientalista y marítima' },
    Q: { nombre: 'Químicas', preguntas: 70, duracion: '15-20 min', subareas: 7, desc: 'Evalúa 7 subáreas: puras, inorgánicas, alimentos, farmacología, agrícolas, petroquímico y clínica' },
    A: { nombre: 'Administrativas', preguntas: 90, duracion: '20-25 min', subareas: 9, desc: 'Evalúa 9 subáreas: instrumentales, financieros, humanos, comerciales, turísticos, públicos, educativos, agrícolas y mineros' },
    S: { nombre: 'Sociales', preguntas: 60, duracion: '10-15 min', subareas: 6, desc: 'Evalúa 6 subáreas: principios y leyes, asistencial, existencial, legal, educacional e interhumana' },
    H: { nombre: 'Humanidades', preguntas: 100, duracion: '20-30 min', subareas: 10, desc: 'Evalúa 10 subáreas: humanidades, oral, escrita, plástica, corporal, auditiva, complementación, idiomas, combinación y cuidado cultural' }
  }

  // Construir lista de tests en orden:
  // 1. Terman, 2. Aptitudes, 3. Intereses, 4. PU, 5-7. Subtipos, 8. Razonamiento
  const tests = (() => {
    const list = [
      {
        id: 'terman',
        nombre: 'Test de Inteligencia',
        descripcion: 'Evalúa 10 áreas cognitivas: información, juicio, vocabulario, síntesis, concentración, análisis, abstracción, planeación, organización y atención',
        duracion: '60-90 min',
        preguntas: 175,
        componente: 'terman'
      },
      {
        id: 'aptitudes',
        nombre: 'Test de Aptitudes',
        descripcion: 'Autoevaluación de 12 aptitudes: científica, verbal, numérica, persuasiva, mecánica, social, directiva, organización, musical, artística, espacial y coordinación',
        duracion: '30-45 min',
        preguntas: 120,
        componente: 'aptitudes'
      },
      {
        id: 'intereses',
        nombre: 'Test de Intereses Ocupacionales',
        descripcion: 'Evalúa 13 escalas de intereses: biológicos, mecánico, campestre, geofísicos, servicio social, literativo, organización, ejecutivo, cálculo, contabilidad, musical, artístico y científico',
        duracion: '30-45 min',
        preguntas: 130,
        componente: 'intereses'
      },
      {
        id: 'area_PU',
        nombre: 'Preferencias Universitarias',
        descripcion: 'Jerarquiza actividades de las 6 áreas profesionales para identificar tus preferencias generales',
        duracion: '10-15 min',
        preguntas: 60,
        componente: 'area_subtipo',
        areaKey: 'PU'
      }
    ]

    // Después de PU, insertar las 3 áreas del diagnóstico
    if (diagnostico) {
      diagnostico.areas.forEach((key, idx) => {
        const info = AREA_INFO[key]
        list.push({
          id: `area_${key}`,
          nombre: `Subtipo: ${info.nombre}`,
          descripcion: info.desc,
          duracion: info.duracion,
          preguntas: info.preguntas,
          componente: 'area_subtipo',
          areaKey: key,
          orden: idx // 0, 1, 2
        })
      })
    }

    // Razonamiento y MBTI solo para modalidad 2
    if (acceso && acceso.modalidad === 'modalidad2') {
      list.push({
        id: 'razonamiento',
        nombre: 'Test de Razonamiento',
        descripcion: 'Evalúa razonamiento verbal, numérico, abstracto, mecánico, espacial, ortografía y rapidez perceptiva',
        duracion: '90-120 min',
        preguntas: 250,
        componente: 'razonamiento'
      })

      list.push({
        id: 'mbti',
        nombre: 'Test de Personalidad',
        descripcion: 'Identifica tu tipo de personalidad en 4 dimensiones: Extraversión/Introversión, Sensación/Intuición, Pensamiento/Sentimiento y Juicio/Percepción',
        duracion: '15-20 min',
        preguntas: 72,
        componente: 'mbti'
      })
    }

    return list
  })()

  // Mostrar carga mientras se sincroniza con el servidor
  if (cargandoEstado) {
    return (
      <div className="tests-page">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Cargando tu progreso...</p>
        </div>
      </div>
    )
  }

  // Vista de test completado (debe estar antes de otras verificaciones)
  if (testCompletado) {
    return (
      <div className="tests-page">
        <div className="test-completado">
          <div className="check-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h1>¡Test completado!</h1>
          <p>Tus respuestas han sido registradas. Tu especialista APROVA las analizará y te enviará los resultados.</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setTestActual(null)
              setTestCompletado(false)
              setRespuestas({})
            }}
          >
            Volver a los tests
          </button>
        </div>
      </div>
    )
  }

  // Callback genérico al completar un test
  const handleTestCompletado = (testId, extra) => {
    marcarTestCompletado(testId)
    if (extra) extra()
    setTestCompletado(true)
  }

  // Si se seleccionó el test de Aptitudes BRP
  if (testActual && testActual.componente === 'aptitudes') {
    return (
      <div className="tests-page">
        <TestAptitudes
          acceso={acceso}
          onVolver={() => setTestActual(null)}
          onCompletado={() => handleTestCompletado('aptitudes', recalcularDiagnostico)}
        />
      </div>
    )
  }

  // Si se seleccionó un subtipo de área individual
  if (testActual && testActual.componente === 'area_subtipo') {
    const esPU = testActual.areaKey === 'PU'
    return (
      <div className="tests-page">
        <TestAreas
          acceso={acceso}
          onVolver={() => setTestActual(null)}
          onCompletado={() => handleTestCompletado(testActual.id, esPU ? recalcularDiagnostico : null)}
          areasRecomendadas={[testActual.areaKey]}
        />
      </div>
    )
  }

  // Si se seleccionó el test TERMAN, mostrar el componente especializado
  if (testActual && testActual.componente === 'terman') {
    return (
      <div className="tests-page">
        <TestTerman
          acceso={acceso}
          onVolver={() => setTestActual(null)}
          onCompletado={() => handleTestCompletado('terman')}
        />
      </div>
    )
  }

  // Si se seleccionó el test de Intereses
  if (testActual && testActual.componente === 'intereses') {
    return (
      <div className="tests-page">
        <TestIntereses
          acceso={acceso}
          onVolver={() => setTestActual(null)}
          onCompletado={() => handleTestCompletado('intereses', recalcularDiagnostico)}
        />
      </div>
    )
  }

  // Si se seleccionó el test de Razonamiento DAT-5
  if (testActual && testActual.componente === 'razonamiento') {
    return (
      <div className="tests-page">
        <TestRazonamiento
          acceso={acceso}
          onVolver={() => setTestActual(null)}
          onCompletado={() => handleTestCompletado('razonamiento')}
        />
      </div>
    )
  }

  // Si se seleccionó el test MBTI
  if (testActual && testActual.componente === 'mbti') {
    return (
      <div className="tests-page">
        <TestMBTI
          acceso={acceso}
          onVolver={() => setTestActual(null)}
          onCompletado={() => handleTestCompletado('mbti')}
        />
      </div>
    )
  }

  const AREA_NOMBRES = { FM: 'Físico-Matemáticas', B: 'Biológicas', Q: 'Químicas', A: 'Administrativas', S: 'Sociales', H: 'Humanidades' }

  // Vista de selección de tests
  if (!testActual) {
    return (
      <div className="tests-page">
        <div className="tests-container">
          <div className="tests-header">
            <span className="tests-badge">Tests Psicométricos</span>
            <h1>Bienvenido, {acceso.nombre || acceso.email}</h1>
            <p>Completa los siguientes tests para obtener tu perfil vocacional.</p>
          </div>

          <div className="tests-grid">
            {tests.map((test) => {
              const completado = testsCompletados.includes(test.id)

              // Lógica de bloqueo secuencial (desactivada en modo prueba)
              let bloqueado = false
              let mensajeBloqueo = ''

              if (esPrueba) {
                // En modo prueba no se bloquea ningún test
              } else if (test.id === 'area_PU') {
                // PU requiere aptitudes e intereses completados
                bloqueado = !testsCompletados.includes('aptitudes') || !testsCompletados.includes('intereses')
                mensajeBloqueo = 'Completa Aptitudes e Intereses primero'
              } else if (test.componente === 'area_subtipo' && test.areaKey !== 'PU') {
                // Subtipos requieren PU + diagnóstico + el subtipo anterior
                if (!testsCompletados.includes('area_PU') || !diagnostico) {
                  bloqueado = true
                  mensajeBloqueo = 'Completa Preferencias Universitarias primero'
                } else if (test.orden > 0) {
                  const prevKey = diagnostico.areas[test.orden - 1]
                  if (!testsCompletados.includes(`area_${prevKey}`)) {
                    bloqueado = true
                    mensajeBloqueo = `Completa primero: ${AREA_INFO[prevKey]?.nombre || prevKey}`
                  }
                }
              } else if (test.id === 'razonamiento') {
                // Razonamiento requiere los 3 subtipos completados
                if (!diagnostico) {
                  bloqueado = true
                  mensajeBloqueo = 'Completa los tests anteriores primero'
                } else {
                  const faltante = diagnostico.areas.find(key => !testsCompletados.includes(`area_${key}`))
                  if (faltante) {
                    bloqueado = true
                    mensajeBloqueo = `Completa los subtipos de áreas primero`
                  }
                }
              } else if (test.id === 'mbti') {
                // MBTI requiere razonamiento completado
                if (!testsCompletados.includes('razonamiento')) {
                  bloqueado = true
                  mensajeBloqueo = 'Completa el Test de Razonamiento primero'
                }
              }

              return (
                <div key={test.id} className={`test-card ${bloqueado || completado ? 'proximamente' : ''}`}>
                  {bloqueado && !completado && <span className="badge-proximamente">{mensajeBloqueo}</span>}
                  {completado && <span className="badge-proximamente" style={{ background: '#22c55e' }}>Completado</span>}
                  <div className="test-info">
                    <h3>{test.nombre}</h3>
                    <p>{test.descripcion}</p>
                    <div className="test-meta">
                      <span>{test.duracion}</span>
                      {test.preguntas > 0 && <span>{test.preguntas} preguntas</span>}
                    </div>
                  </div>
                  <button
                    className="btn-iniciar-test"
                    onClick={() => !bloqueado && !completado && setTestActual(test)}
                    disabled={bloqueado || completado}
                  >
                    {completado ? 'Test completado' : bloqueado ? 'No disponible' : 'Iniciar test'}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Diagnóstico Diferencial visible cuando existe */}
          {diagnostico && (
            <div style={{
              background: '#f0edfe', border: '2px solid #534AB7', borderRadius: '12px',
              padding: '20px', marginTop: '20px'
            }}>
              <h3 style={{ color: '#26215C', margin: '0 0 12px' }}>Diagnóstico Diferencial</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '14px', margin: '0 0 6px', color: '#534AB7' }}>Top 3 Aptitudes:</p>
                  {diagnostico.top3Apt.map((a, i) => (
                    <p key={i} style={{ margin: '2px 0', fontSize: '14px' }}>{i + 1}. {a}</p>
                  ))}
                </div>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '14px', margin: '0 0 6px', color: '#534AB7' }}>Top 3 Intereses:</p>
                  {diagnostico.top3Int.map((a, i) => (
                    <p key={i} style={{ margin: '2px 0', fontSize: '14px' }}>{i + 1}. {a}</p>
                  ))}
                </div>
              </div>
              <p style={{ fontWeight: '600', fontSize: '14px', margin: '0 0 6px', color: '#534AB7' }}>Áreas profesionales inferidas:</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {diagnostico.areas.map(key => (
                  <span key={key} style={{
                    background: '#534AB7', color: '#fff', padding: '6px 14px',
                    borderRadius: '16px', fontSize: '14px', fontWeight: '600'
                  }}>
                    {AREA_NOMBRES[key]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Botón para generar reporte cuando todos los tests están completos */}
          {todosTestsCompletos && (
            <div style={{
              background: 'linear-gradient(135deg, #26215C 0%, #534AB7 100%)',
              borderRadius: '12px', padding: '28px', marginTop: '20px',
              textAlign: 'center', color: '#fff'
            }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '20px' }}>Todos los tests completados</h3>
              <p style={{ margin: '0 0 20px', color: '#AFA9EC', fontSize: '15px' }}>
                Ya puedes generar tu reporte vocacional completo en PDF.
              </p>
              <button
                onClick={handleGenerarReporte}
                disabled={generandoReporte}
                style={{
                  background: '#fff', color: '#26215C', border: 'none',
                  padding: '14px 32px', borderRadius: '8px', fontSize: '16px',
                  fontWeight: '600', cursor: generandoReporte ? 'wait' : 'pointer',
                  opacity: generandoReporte ? 0.7 : 1, transition: 'opacity 0.2s'
                }}
              >
                {generandoReporte ? 'Generando reporte...' : 'Generar Reporte PDF'}
              </button>
              {reporteExito && (
                <p style={{ margin: '12px 0 0', color: '#22c55e', fontSize: '14px' }}>
                  Reporte generado y descargado correctamente. También fue enviado por correo.
                </p>
              )}
              {reporteError && (
                <p style={{ margin: '12px 0 0', color: '#EF4444', fontSize: '14px' }}>
                  {reporteError}
                </p>
              )}
            </div>
          )}

          <div className="tests-nota">
            <p>
              <strong>Importante:</strong> Responde con honestidad. No hay respuestas
              correctas o incorrectas. Los resultados serán enviados únicamente a tu
              especialista APROVA.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Preguntas de ejemplo para el test
  const preguntasEjemplo = [
    {
      id: 1,
      texto: '¿Te sientes cómodo/a trabajando en equipo?',
      opciones: ['Totalmente de acuerdo', 'De acuerdo', 'Neutral', 'En desacuerdo', 'Totalmente en desacuerdo']
    },
    {
      id: 2,
      texto: '¿Prefieres tareas que requieran creatividad?',
      opciones: ['Totalmente de acuerdo', 'De acuerdo', 'Neutral', 'En desacuerdo', 'Totalmente en desacuerdo']
    },
    {
      id: 3,
      texto: '¿Te atrae trabajar con números y datos?',
      opciones: ['Totalmente de acuerdo', 'De acuerdo', 'Neutral', 'En desacuerdo', 'Totalmente en desacuerdo']
    },
    {
      id: 4,
      texto: '¿Disfrutas ayudando a otras personas?',
      opciones: ['Totalmente de acuerdo', 'De acuerdo', 'Neutral', 'En desacuerdo', 'Totalmente en desacuerdo']
    },
    {
      id: 5,
      texto: '¿Te gusta liderar proyectos?',
      opciones: ['Totalmente de acuerdo', 'De acuerdo', 'Neutral', 'En desacuerdo', 'Totalmente en desacuerdo']
    }
  ]

  const handleRespuesta = (preguntaId, respuesta) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: respuesta
    }))
  }

  const handleEnviarTest = async () => {
    setEnviando(true)
    setError('')

    // Formatear respuestas con el texto de las preguntas
    const respuestasFormateadas = {}
    preguntasEjemplo.forEach(pregunta => {
      if (respuestas[pregunta.id]) {
        respuestasFormateadas[pregunta.texto] = respuestas[pregunta.id]
      }
    })

    try {
      const response = await fetch(`${API_URL}/api/enviar-resultados`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: acceso.email,
          nombre: acceso.nombre || acceso.email,
          testNombre: testActual.nombre,
          respuestas: respuestasFormateadas,
          modalidad: acceso.modalidad
        })
      })

      const data = await response.json()

      if (data.success) {
        setTestCompletado(true)
      } else {
        setError('Error al enviar las respuestas. Intenta de nuevo.')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error de conexión. Verifica tu internet.')
    } finally {
      setEnviando(false)
    }
  }

  // Vista del test activo (genérico)
  return (
    <div className="tests-page">
      <div className="test-activo-container">
        <div className="test-activo-header">
          <button className="btn-volver" onClick={() => setTestActual(null)}>
            ← Volver
          </button>
          <h2>{testActual.nombre}</h2>
          <p>{testActual.descripcion}</p>
        </div>

        <div className="preguntas-lista">
          {preguntasEjemplo.map((pregunta, index) => (
            <div key={pregunta.id} className="pregunta-card">
              <p className="pregunta-numero">Pregunta {index + 1}</p>
              <p className="pregunta-texto">{pregunta.texto}</p>
              <div className="opciones-grid">
                {pregunta.opciones.map((opcion, opcionIndex) => (
                  <button
                    key={opcionIndex}
                    className={`opcion-btn ${respuestas[pregunta.id] === opcion ? 'seleccionada' : ''}`}
                    onClick={() => handleRespuesta(pregunta.id, opcion)}
                  >
                    {opcion}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="test-footer">
          <div>
            <p>
              {Object.keys(respuestas).length} de {preguntasEjemplo.length} preguntas respondidas
            </p>
            {error && <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '8px' }}>{error}</p>}
          </div>
          <button
            className="btn-enviar-test"
            onClick={handleEnviarTest}
            disabled={Object.keys(respuestas).length < preguntasEjemplo.length || enviando}
          >
            {enviando ? 'Enviando...' : 'Enviar respuestas'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Tests
