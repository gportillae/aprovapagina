import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Contenido.css'

function Contenido() {
  const [seccionActiva, setSeccionActiva] = useState('universidades')

  return (
    <div className="contenido-page">
      {/* Hero */}
      <section className="contenido-hero">
        <img
          src="https://www.aprovamx.com/uploads/4/6/5/8/46584589/4332272.png"
          alt=""
          className="hero-watermark"
          aria-hidden="true"
        />
        <span className="badge">Recursos</span>
        <h1>Contenido para tu decisión vocacional</h1>
        <p>Guías, consejos y recursos que te ayudarán en el proceso de elegir tu carrera y universidad.</p>
      </section>

      {/* Tabs */}
      <section className="section contenido-main">
        <div className="contenido-tabs">
          <button
            className={`tab-btn ${seccionActiva === 'universidades' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('universidades')}
          >
            Elegir universidad
          </button>
          <button
            className={`tab-btn ${seccionActiva === 'videos' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('videos')}
          >
            Videos recomendados
          </button>
          <button
            className={`tab-btn ${seccionActiva === 'lectura' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('lectura')}
          >
            Beneficios de la lectura
          </button>
          <button
            className={`tab-btn ${seccionActiva === 'consejos' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('consejos')}
          >
            Consejos prácticos
          </button>
        </div>

        {/* Elegir universidad */}
        {seccionActiva === 'universidades' && (
          <div className="contenido-seccion">
            <h2>Cómo elegir la universidad correcta</h2>
            <p className="contenido-intro">
              Elegir universidad es una decisión muy personal. No existe una universidad
              perfecta para todos; existe la universidad perfecta para ti. Estos son los
              factores clave que debes considerar.
            </p>

            <div className="factores-grid">
              <div className="factor-card">
                <div className="factor-num">1</div>
                <h3>Nivel académico</h3>
                <p>Investiga el plan de estudios, la calidad de los profesores y si la carrera tiene acreditaciones. No todas las universidades tienen el mismo nivel en todas las carreras.</p>
              </div>
              <div className="factor-card">
                <div className="factor-num">2</div>
                <h3>Ubicación</h3>
                <p>¿Está cerca de tu casa o necesitas mudarte? Si es fuera de tu ciudad, considera los costos de vivienda, transporte y la adaptación a un nuevo entorno.</p>
              </div>
              <div className="factor-card">
                <div className="factor-num">3</div>
                <h3>Costos y becas</h3>
                <p>Las universidades privadas pueden ser costosas, pero muchas ofrecen becas por mérito académico, necesidad económica o talento deportivo. Investiga todas las opciones de financiamiento.</p>
              </div>
              <div className="factor-card">
                <div className="factor-num">4</div>
                <h3>Ambiente y campus</h3>
                <p>Visita el campus si es posible. El ambiente estudiantil, las instalaciones y las actividades extracurriculares influyen directamente en tu experiencia universitaria.</p>
              </div>
              <div className="factor-card">
                <div className="factor-num">5</div>
                <h3>Dificultad de admisión</h3>
                <p>Algunas universidades tienen exámenes de admisión muy competitivos. Prepárate con tiempo y considera tener opciones de respaldo.</p>
              </div>
              <div className="factor-card">
                <div className="factor-num">6</div>
                <h3>Bolsa de trabajo</h3>
                <p>Investiga si la universidad tiene convenios con empresas, programas de prácticas profesionales y qué tan empleables son sus egresados.</p>
              </div>
            </div>

            <div className="contenido-tip">
              <h3>Lo que las universidades evalúan de ti</h3>
              <div className="tip-list">
                <div className="tip-item">
                  <span className="tip-check">&#10003;</span>
                  <p>Entusiasmo genuino por la institución y la carrera</p>
                </div>
                <div className="tip-item">
                  <span className="tip-check">&#10003;</span>
                  <p>Resultados en exámenes estandarizados y calificaciones generales</p>
                </div>
                <div className="tip-item">
                  <span className="tip-check">&#10003;</span>
                  <p>Actividades extracurriculares y servicio comunitario</p>
                </div>
                <div className="tip-item">
                  <span className="tip-check">&#10003;</span>
                  <p>Cartas de recomendación y habilidades de comunicación</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Videos recomendados */}
        {seccionActiva === 'videos' && (
          <div className="contenido-seccion">
            <h2>Videos que te ayudarán a reflexionar</h2>
            <p className="contenido-intro">
              Estos videos seleccionados por nuestros especialistas te darán perspectiva
              sobre tu futuro profesional y la importancia de tomar buenas decisiones.
            </p>

            <div className="videos-grid">
              <div className="video-card">
                <div className="video-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
                <div className="video-info">
                  <h3>Discurso de Steve Jobs en Stanford</h3>
                  <p>Uno de los discursos más inspiradores sobre seguir tu pasión, conectar los puntos y no conformarte hasta encontrar lo que amas hacer.</p>
                  <span className="video-tag">Inspiración</span>
                </div>
              </div>
              <div className="video-card">
                <div className="video-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
                <div className="video-info">
                  <h3>¿Qué es la zona de confort?</h3>
                  <p>Entender tu zona de confort es clave para tomar decisiones valientes sobre tu futuro. Aprende por qué salir de ella es necesario para crecer.</p>
                  <span className="video-tag">Desarrollo personal</span>
                </div>
              </div>
              <div className="video-card">
                <div className="video-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
                <div className="video-info">
                  <h3>Donde tus sueños te lleven</h3>
                  <p>Una reflexión sobre la importancia de perseguir tus sueños y no dejarte llevar por las expectativas de los demás al elegir tu camino.</p>
                  <span className="video-tag">Motivación</span>
                </div>
              </div>
              <div className="video-card">
                <div className="video-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
                <div className="video-info">
                  <h3>Carreras rentables para el futuro</h3>
                  <p>¿Qué carreras tendrán mayor demanda en los próximos años? Una guía sobre las tendencias del mercado laboral y las profesiones emergentes.</p>
                  <span className="video-tag">Mercado laboral</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Beneficios de la lectura */}
        {seccionActiva === 'lectura' && (
          <div className="contenido-seccion">
            <h2>Por qué leer te ayuda a elegir mejor</h2>
            <p className="contenido-intro">
              La lectura es un hábito que fortalece tus capacidades intelectuales y te
              prepara para tomar mejores decisiones. Estos son sus beneficios comprobados.
            </p>

            <div className="beneficios-grid">
              <div className="beneficio-card">
                <div className="beneficio-num">1</div>
                <h3>Agilidad mental</h3>
                <p>Leer aumenta tu concentración y fortalece las conexiones neuronales. Pensar, ordenar ideas e interrelacionar conceptos son habilidades que se desarrollan leyendo.</p>
              </div>
              <div className="beneficio-card">
                <div className="beneficio-num">2</div>
                <h3>Ampliación del conocimiento</h3>
                <p>La lectura te permite explorar temas que no conocías y descubrir áreas profesionales que no habías considerado. Cada libro abre nuevas posibilidades.</p>
              </div>
              <div className="beneficio-card">
                <div className="beneficio-num">3</div>
                <h3>Mejores relaciones sociales</h3>
                <p>Leer mejora tu expresión verbal y te da temas de conversación. Esto es clave en entrevistas de admisión, becas y tu futuro profesional.</p>
              </div>
              <div className="beneficio-card">
                <div className="beneficio-num">4</div>
                <h3>Mejora tu escritura</h3>
                <p>La lectura inspira nuevas formas de escribir, perfecciona tu ortografía y gramática, y amplía tu vocabulario — habilidades esenciales en cualquier carrera.</p>
              </div>
              <div className="beneficio-card">
                <div className="beneficio-num">5</div>
                <h3>Reduce el estrés</h3>
                <p>Sumergirte en una buena lectura reduce los niveles de estrés y ansiedad. En momentos de incertidumbre sobre tu futuro, leer te ayuda a tener claridad.</p>
              </div>
              <div className="beneficio-card">
                <div className="beneficio-num">6</div>
                <h3>Mayor éxito profesional</h3>
                <p>Investigaciones de la Universidad de Oxford demuestran que los adolescentes que leen tienen mayor probabilidad de éxito laboral en la vida adulta.</p>
              </div>
            </div>
          </div>
        )}

        {/* Consejos prácticos */}
        {seccionActiva === 'consejos' && (
          <div className="contenido-seccion">
            <h2>Consejos para tu transición a la universidad</h2>
            <p className="contenido-intro">
              La preparatoria y la universidad son mundos distintos. Estos consejos
              te prepararán para el cambio.
            </p>

            <div className="consejos-list">
              <div className="consejo-card">
                <h3>Análisis FODA personal</h3>
                <p>Antes de elegir carrera, haz un análisis de tus Fortalezas, Oportunidades, Debilidades y Amenazas. Esto te dará un mapa claro de dónde estás y hacia dónde puedes ir. Es una herramienta que usamos en el proceso APROVA.</p>
              </div>
              <div className="consejo-card">
                <h3>Hábitos de estudio</h3>
                <p>La universidad requiere más autodisciplina que la preparatoria. Desarrollar buenos hábitos de estudio antes de entrar te dará una ventaja significativa. Organiza tu tiempo, establece metas semanales y aprende a priorizar.</p>
              </div>
              <div className="consejo-card">
                <h3>Tus primeros días en la universidad</h3>
                <p>Es normal sentir incertidumbre. Participa en actividades de integración, conoce a tus compañeros, explora el campus y no tengas miedo de pedir ayuda. Los primeros días definen mucho de tu experiencia.</p>
              </div>
              <div className="consejo-card">
                <h3>Estudiar fuera de tu ciudad</h3>
                <p>Si consideras mudarte, evalúa los costos reales (renta, comida, transporte), la distancia con tu familia y la red de apoyo que tendrás. Es una decisión que va más allá de la universidad misma.</p>
              </div>
              <div className="consejo-card">
                <h3>Formación de la voluntad</h3>
                <p>La carrera que elijas requerirá disciplina y persistencia. Fortalece tu voluntad con pequeños hábitos diarios: levantarte a la misma hora, cumplir tus compromisos, terminar lo que empiezas.</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="cta-contenido">
        <img
          src="https://www.aprovamx.com/uploads/4/6/5/8/46584589/4332272.png"
          alt=""
          className="cta-watermark"
          aria-hidden="true"
        />
        <h2>¿Necesitas orientación personalizada?</h2>
        <p>Nuestros recursos son un complemento. Para un análisis completo de tu perfil vocacional, conoce nuestros servicios.</p>
        <div className="cta-buttons">
          <Link to="/servicios" className="btn btn-primary">
            Ver servicios
          </Link>
          <Link to="/contacto" className="btn btn-secondary">
            Contáctanos
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Contenido
