// Contenido del reporte vocacional, independiente del formato de salida.
//
// construirBloques() devuelve una lista de bloques neutrales que renderizan por
// separado generar-reporte.js (PDF) y generar-reporte-word.js (Word). La estructura
// del documento vive aquí y solo aquí: si se agrega una sección, aparece en ambos
// formatos sin tocar los renderizadores.
const path = require('path')
const fs = require('fs')
// Qué mide cada apartado de razonamiento y cada aptitud. Se extraen de los
// reportes Word de APROVA con scripts/extraer-definiciones.js.
let DEFINICIONES = { razonamiento: {}, aptitudes: {}, intereses: {}, areas: {} }
try {
  DEFINICIONES = require('./data/definiciones.json')
} catch (e) {
  console.error('No se pudo cargar data/definiciones.json:', e.message)
}

// Narrativa por tipo de personalidad, extraída de los reportes Word de APROVA
// con scripts/extraer-mbti.js. Los tipos que no estén aquí (hoy solo ESTJ, que
// no tiene reporte propio) recurren a la descripción breve de más abajo.
let REPORTES_MBTI = {}
try {
  REPORTES_MBTI = require('./data/mbti-reportes.json')
} catch (e) {
  console.error('No se pudo cargar data/mbti-reportes.json:', e.message)
}

// Orden en que se presentan las secciones de la narrativa de personalidad
const ORDEN_SECCIONES_MBTI = [
  'personalidad', 'aprendizaje', 'escritura', 'procrastinacion',
  'exploracionCarrera', 'busquedaTrabajo', 'trabajo', 'equipo',
  'liderazgo', 'comunicacion', 'decisiones', 'juego', 'estres'
]

// Colores APROVA
const COLORS = {
  primary: '#534AB7',
  primaryDark: '#26215C',
  primaryLight: '#AFA9EC',
  primaryPale: '#EEEDFE',
  primaryBg: '#F8F7FF',
  white: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  green: '#22C55E',
  red: '#EF4444',
  orange: '#F97316',
  yellow: '#FBBF24',
  blue: '#3B82F6',
  darkBlue: '#1E40AF'
}

// Descripciones MBTI del servidor (las del test original)
const descripcionesMBTI = {
  ISTJ: { titulo: 'ISTJ - El Inspector', motivacion: 'Le gusta mirar la información en términos de hechos y detalles. Se enfoca más en el aquí y ahora más que en las posibilidades del futuro. Se siente confortable en áreas que han sido probadas con la experiencia. Toma un enfoque realista de las cosas.', preferencias: 'Busca desarrollar una visión realista del mundo como es a la luz de lo que observa. Es pragmático por naturaleza y aprende constantemente a adaptarse al mundo como es ahora. Observa de modo subjetivo, seleccionando y relacionando los hechos que otros dejan pasar.', conducta: 'Se enfoca en su mundo interior sensitivo en hechos impersonales y opciones lógicas. Tiende a detectar las fallas y las injusticias. Toma decisiones con base en el análisis lógico que soporta su forma de entender el mundo.', equipo: 'Trabajar duro y eficientemente para completar tareas en los plazos previstos. Clasificar las ideas e identificar aquellas que son más prácticas. Aplicar el sentido común para enfrentarse a la resolución de problemas. Mantener al equipo enfocado en el objetivo. Aplicar procedimientos y metodologías.', irritar: 'No articula su comprensión de la situación. No ve el bosque sino los árboles. Es demasiado serio. Parece ser inflexible. No estimula a los otros a experimentar o innovar.', crecimiento: 'Articular más sus propios puntos de vista. Desarrollar una visión de largo plazo. Entender más cómo sienten los demás. Cambiar las cosas por experimentar para ver de qué manera pueden mejorarse.', estres: 'Buscar un lugar solitario en donde pueda pensar y trabajar. Usar métodos probados y confiables para resolver problemas. Dirigir o criticar los esfuerzos de los otros.' },
  ISFJ: { titulo: 'ISFJ - El Protector', motivacion: 'Le gusta mirar la información en términos de hechos y detalles. Se enfoca más en el aquí y ahora más que en las posibilidades del futuro. Se siente confortable en áreas que han sido probadas con la experiencia. Toma un enfoque realista de las cosas.', preferencias: 'Busca desarrollar una visión realista del mundo como es a la luz de lo que observa. Es pragmático por naturaleza y aprende constantemente a adaptarse al mundo como es ahora.', conducta: 'Enfoca su mundo interior de emociones en ideas y posibilidades que se relacionan con la gente. Expresa su aprecio por las contribuciones de los otros. Toma decisiones con base en los valores que soportan su forma de entender el mundo.', equipo: 'Trabaja duro y eficientemente para completar tareas en los plazos previstos. Construye el espíritu del equipo manteniendo buenas relaciones con cada miembro. Asegura que cada uno en el equipo se siente valorado.', irritar: 'Evita el conflicto y no proporciona su crítica cuando es requerida. No articula su forma de entender las situaciones. No ve el bosque sino los árboles. Falla en establecer sus propias necesidades.', crecimiento: 'Articular más sus propios puntos de vista. Desarrollar una visión de largo plazo. Entrenamiento en ser más asertivo. Ser más franco y ofrecer una crítica directa.', estres: 'Buscar un lugar solitario en donde pueda pensar y trabajar. Valorar los esfuerzos de los otros. Usar métodos probados y confiables para resolver problemas.' },
  INFJ: { titulo: 'INFJ - El Consejero', motivacion: 'Le gusta mirar la información desde un punto de vista global, detectando los patrones y relaciones que lo llevan a entender los puntos clave. Se enfoca más en las posibilidades para el futuro que en el aquí y ahora. Disfruta del cambio, el reto y la variedad.', preferencias: 'Busca desarrollar un entendimiento de cómo es o cómo puede ser el mundo. Busca entender los patrones que se esconden en sus observaciones. Es estratégico por naturaleza, deseando establecer una visión clara hacia la cual trabajar.', conducta: 'Enfoca su mundo interior de intuición en ideas y posibilidades que se relacionan con la gente. Expresa su apreciación por las contribuciones de los demás. Toma decisiones con base en los valores que soportan su forma de entender el mundo.', equipo: 'Observa y entiende la dinámica del equipo. Escucha cuidadosamente varios puntos de vista e identifica áreas de acuerdo. Es confiable y cumple con sus compromisos. Aporta ideas creativas orientadas a las personas.', irritar: 'No incluye a los demás en su proceso de desarrollar ideas y visión. No critica o expresa su desacuerdo cuando es apropiado. Ignora la realidad presente en búsqueda de profundidad y significado.', crecimiento: 'Estar preparado para declarar sus propias visiones o metas. Investigar y reconocer los hechos antes de interpretar su significado. Cambiar su visión para ajustarla a lo que es realmente posible.', estres: 'Buscar un lugar solitario en donde pueda pensar y trabajar. Tratar de resolver el problema a largo plazo. Cometer errores de hecho o ignorar elementos rutinarios esenciales.' },
  INTJ: { titulo: 'INTJ - El Estratega', motivacion: 'Le gusta mirar la información desde un punto de vista global, detectando los patrones y relaciones que lo llevan a entender los puntos clave. Se enfoca más en las posibilidades para el futuro. Disfruta el cambio, el reto y la variedad.', preferencias: 'Busca desarrollar un entendimiento de cómo es o cómo puede ser el mundo. Busca entender los patrones que se esconden en sus observaciones. Es estratégico por naturaleza, deseando establecer una visión clara hacia la cual trabajar.', conducta: 'Enfoca su mundo interior de intuición en ideas y posibilidades que se relacionan con los sistemas y conceptos. Mantiene una visión de largo plazo. Aplica un análisis lógico a los patrones y posibilidades percibidos.', equipo: 'Retar al status quo. Conducir al equipo a un mayor entendimiento de los principios involucrados. Encontrar formas de superar dificultades aparentemente insolubles. Producir trabajo de alto nivel de calidad.', irritar: 'Puede ser obstinado y terco. No toma en cuenta suficientemente las realidades presentes. No expresa su apreciación por las contribuciones de los otros. No delega.', crecimiento: 'Articular su visión y permitir que otros contribuyan en su desarrollo. Expresar apreciación por el trabajo realizado. Investigar los hechos y documentarlos antes de interpretar lo que significan.', estres: 'Retirarse a un lugar privado para pensar a fondo un problema. Tratar de mantener un alto grado de calidad en la solución. Criticar las ideas de los demás.' },
  ISTP: { titulo: 'ISTP - El Artesano', motivacion: 'Le gusta tomar decisiones con base en la lógica, mediante consideraciones objetivas. Se preocupa por la verdad, los principios y la justicia. Es analítico y crítico, tiende a ver los inconvenientes en las situaciones.', preferencias: 'Pasa tiempo pensando analíticamente, organizando sus pensamientos sobre una base lógica. Desarrolla una comprensión de los principios que hay detrás de una situación. Toma decisiones internamente, pero no las comunica a los demás.', conducta: 'Enfoca su mundo interior en entender problemas prácticos o mecánicos. Percibe los hechos que son apropiados para respaldar su análisis lógico.', equipo: 'Ser la fuente de información o un "experto" en algunos temas. Usar destrezas analíticas para producir soluciones prácticas a problemas difíciles. Permanecer con cabeza fría en una crisis.', irritar: 'Se enfoca demasiado en la tarea presente a expensas del largo plazo. No ve el bosque sino los árboles. No completa una tarea antes de trasladar su atención a la siguiente. No comunica su forma de entender una situación.', crecimiento: 'Tomarse tiempo para considerar el impacto de sus enfoques e ideas en los sentimientos de los demás. Expresar apreciación hacia los otros. Desarrollar una estrategia personal de largo plazo.', estres: 'Aislarse de la gente, para pensar a fondo las posibles soluciones. Usar soluciones probadas y conocidas para los problemas de corto plazo. Criticar los esfuerzos de los otros.' },
  ISFP: { titulo: 'ISFP - El Aventurero', motivacion: 'Toma decisiones basado en sus valores personales. Aprecia y acepta a las personas, disfrutando su compañía y la búsqueda de la armonía. Establece el impacto de las decisiones en los demás, es comprensivo y compasivo.', preferencias: 'Desarrolla una vida interna emocional que a menudo no es percibida por los demás, pero que es experimentada intensamente. Conserva un sentido fuerte de los valores, que a menudo no expresa.', conducta: 'Enfoca su mundo interior de sentimientos hacia sus relaciones presentes y hacia las personas. Busca disfrutar de la compañía de aquellos que conoce. Ayuda a los demás en forma práctica.', equipo: 'Resolver problemas tan pronto ocurran, especialmente aquellos que involucran personas. Generar el espíritu de equipo mediante la promoción de la cooperación. Asegurar el bienestar de los miembros del equipo.', irritar: 'Se preocupa demasiado por la armonía del grupo. No impulsa suficientemente sus propias ideas. Es obstinado acerca de temas que el grupo no había considerado como problemas. Evita los conflictos.', crecimiento: 'Estar preparado para declarar sus valores personales. Interpretar los hechos que observa para revelar los significados ocultos. Establecer metas de largo plazo y desarrollar un plan detallado.', estres: 'Concentrarse solamente en lo que le parece importante. Trabajar solo. Actuar impulsivamente y tomar riesgos.' },
  INFP: { titulo: 'INFP - El Mediador', motivacion: 'Toma decisiones con base en sus valores personales. Aprecia y acepta a las personas, disfrutando su compañía y la búsqueda de la armonía. Es comprensivo y compasivo. Toma las cosas desde el punto de vista de las personas.', preferencias: 'Desarrolla una vida interna emocional que a menudo no es percibida por los demás, pero que es experimentada intensamente. Acepta o rechaza emocionalmente varios aspectos de la vida.', conducta: 'Enfoca su mundo interior de sentimientos hacia ideas y posibilidades para las personas, buscando relaciones significativas. Decide sobre la amistad a través de indagar en la personalidad y las motivaciones de los demás.', equipo: 'Promover la reflexión y el entendimiento común entre el equipo. Contribuir con ideas meditadas a fondo e innovadoras. Generar el espíritu de equipo a través de escuchar con atención.', irritar: 'Es demasiado idealista. Parece fuera de contacto, sin reconocer las realidades presentes. Pasa mucho tiempo reflexionando. Evita los conflictos y no proporciona crítica directa.', crecimiento: 'Estar preparado para declarar sus valores personales. Investigar y reconocer los hechos antes de interpretar su significado. Enfocarse en detalles impersonales durante las discusiones.', estres: 'Concentrarse solamente en lo que le parece importante. Trabajar solo. Contribuir ideas creativas pero pasar por alto las realidades presentes.' },
  INTP: { titulo: 'INTP - El Lógico', motivacion: 'Le gusta tomar decisiones con base en la lógica y mediante consideraciones objetivas. Se preocupa con la verdad, los principios y la justicia. Es analítico y crítico, tiende a ver las deficiencias en las situaciones.', preferencias: 'Pasa tiempo pensando analíticamente y organizando sus pensamientos sobre bases lógicas. Desarrolla una comprensión de los principios que hay detrás de una situación. Piensa principalmente sobre temas impersonales.', conducta: 'Enfoca su mundo interior en entender las posibilidades para el futuro. Percibe patrones en la información para sustentar su análisis lógico.', equipo: 'Usar destrezas analíticas y críticas para resolver problemas. Enfocar la atención en el punto central de una situación. Proporcionar perspicacia intelectual. Sugerir ideas que apuntan a metas de corto y largo plazo.', irritar: 'Es demasiado intelectual. Encuentra demasiadas fallas y no acepta soluciones imperfectas. No toma en cuenta los sentimientos de los otros. Se aferra a un principio a expensas de las relaciones.', crecimiento: 'Expresar apreciación hacia los otros. Trabajar dentro de las limitaciones de los demás. Aceptar y reconocer los esfuerzos imperfectos de los otros. Desarrollar relaciones personales.', estres: 'Apartarse para pensar acerca del punto principal que requiere atención. Debatir el tema desde un punto de vista intelectual. Criticar los esfuerzos de los demás e ignorar sus sentimientos.' },
  ESTP: { titulo: 'ESTP - El Emprendedor', motivacion: 'Le gusta mirar la información en términos de hechos y detalles. Se enfoca más en el aquí y ahora. Se siente confortable en áreas que han sido probadas con la experiencia. Toma un enfoque realista de las cosas.', preferencias: 'Busca experimentar y disfrutar el mundo como es. Está muy interesado en los eventos actuales. Es pragmático por naturaleza, buscando cambiar el mundo a la forma en que quiere que sea.', conducta: 'Se enfoca en su mundo interior sensitivo en hechos impersonales y opciones lógicas. Tiende a disfrutar la acción y los eventos en sí mismos. Disfruta de las posesiones materiales.', equipo: 'Hacer que las cosas sucedan, con un enfoque orientado a la acción. Construir una atmósfera de "puede hacerse". Enfocarse en ideas prácticas. Aplicar el sentido común cuando se trata de resolver problemas.', irritar: 'Actúa muy rápido aparentemente sin pensar las cosas con cuidado. Se enfoca demasiado en la tarea actual. No toma en cuenta la sensibilidad de los demás. Genera crisis como forma de hacer que las cosas se lleven a cabo.', crecimiento: 'Desarrollar una visión de largo plazo. Entender más cómo sienten los demás. Detenerse y pensar antes de actuar. Asegurarse de que todos los aspectos de una tarea se han completado.', estres: 'Usar su energía impulsiva para sobrepasar cualquier obstáculo. Generar nuevas acciones. Usar métodos probados y confiables para resolver problemas.' },
  ESFP: { titulo: 'ESFP - El Animador', motivacion: 'Le gusta mirar la información en términos de hechos y detalles. Se enfoca más en el aquí y ahora. Se siente confortable en áreas que han sido probadas con la experiencia. Toma un enfoque realista de las cosas.', preferencias: 'Busca experimentar y disfrutar el mundo como es. Está muy interesado en los eventos actuales. Es pragmático por naturaleza. Observa de modo objetivo.', conducta: 'Se enfoca en su mundo exterior de sensaciones en relaciones y hechos que se refieren a las personas. Tiende a disfrutar la acción y los eventos por la compañía de los demás. Disfruta de la interacción con otras personas.', equipo: 'Involucrar a todos en la discusión y la toma de decisiones. Valorar las fortalezas de cada individuo. Usar el sentido del humor para construir una atmósfera amistosa. Aplicar el sentido común.', irritar: 'Toma un enfoque demasiado personal, asume las críticas personalmente. Actúa muy rápido aparentemente sin pensar. No toma en cuenta los costos o las consideraciones lógicas. Abusa del humor.', crecimiento: 'Desarrollar una mayor comprensión de la forma en que sienten las personas. Detenerse y pensar antes de actuar. Pasar tiempo interpretando los hechos, buscando significados subjetivos y patrones ocultos.', estres: 'Convocar la ayuda de otras personas. Usar métodos probados y confiables. Actuar impulsivamente y tomar riesgos.' },
  ENFP: { titulo: 'ENFP - El Activista', motivacion: 'Le gusta mirar la información desde un punto de vista global, detectando patrones y relaciones que lleven a entender los puntos claves. Se enfoca más en las posibilidades para el futuro. Disfruta del cambio, el reto y la variedad.', preferencias: 'Ensaya las ideas, explora nuevas posibilidades y descubre por experiencia cuáles funcionan. Cambia los procedimientos para ver qué mejoras se pueden hacer. Está más interesado en explorar las ideas que en llevarlas a término.', conducta: 'Se enfoca en su mundo exterior de ideas y posibilidades que se relacionan con las personas. Internamente aprecia las contribuciones de los demás, aunque no las expresa a menudo.', equipo: 'Actuar como un catalizador del cambio. Enfocarse en puntos de acuerdo y construir sobre las proposiciones de los demás. Contribuir con ideas creativas orientadas a las personas. Generar espíritu de equipo.', irritar: 'Pierde la visión del propósito principal. Inicia demasiados proyectos y no puede responder por todos. Habla demasiado. Realiza muchos cambios. Comete errores de hecho.', crecimiento: 'Ser selectivo acerca de iniciar proyectos. Aceptar el valor de las rutinas existentes que funcionan bien. Investigar los hechos y documentarlos antes de interpretar su significado.', estres: 'Involucrar a las personas en sesiones de lluvia de ideas. Ser democrático en la escogencia de la solución. Proporcionar mucho impulso, pero tratar de hacer demasiado.' },
  ENTP: { titulo: 'ENTP - El Innovador', motivacion: 'Le gusta mirar la información desde un punto de vista global, detectando los patrones y relaciones que lo llevan a entender los puntos clave. Se enfoca más en las posibilidades para el futuro. Disfruta el cambio, el reto y la variedad.', preferencias: 'Ensaya las ideas, explora nuevas posibilidades y descubre por experiencia cuáles funcionan. Cambia los procedimientos para ver qué mejoras se pueden hacer. Está más interesado en explorar las ideas que en llevarlas a término.', conducta: 'Enfoca su mundo interior de intuición en ideas y posibilidades que se relacionan con los sistemas y conceptos. Internamente tiende a detectar las fallas en las situaciones. Aplica un análisis lógico a los patrones percibidos.', equipo: 'Retar al status quo y promover que otros miembros del equipo logren más. Conducir al equipo a un mayor entendimiento de los principios. Crear nuevas ideas a partir de discusiones. Encontrar formas de vencer dificultades insuperables.', irritar: 'Inicia demasiados proyectos y no puede responder por todos. No se da cuenta de las realidades presentes. Parece competitivo y no aprecia las contribuciones de los demás. Deja a otros el trabajo rutinario.', crecimiento: 'Ser selectivo acerca de iniciar proyectos. Aceptar el valor de las rutinas existentes. Investigar los hechos y documentarlos. Tomarse tiempo para considerar el impacto en los sentimientos de los demás.', estres: 'Dedicar tiempo a sesiones de lluvias de ideas y debatir. Proporcionar mucho impulso pero tratar de hacer demasiado. Convocar personas con habilidades comprobadas.' },
  ESTJ: { titulo: 'ESTJ - El Director', motivacion: 'Le gusta tomar decisiones con base en la lógica, mediante consideraciones objetivas. Se preocupa por la verdad, los principios y la justicia. Es analítico y crítico. Toma un punto de vista objetivo.', preferencias: 'Organiza la vida con una base lógica, clasificando, ordenando y dirigiendo los hechos y situaciones. Es decisivo con el fin de ser justo y equitativo. Critica espontáneamente. No le teme al conflicto.', conducta: 'Enfoca su mundo exterior de reflexión en decisiones prácticas que llevan a formas confiables y probadas de organizarse y resolver problemas. Enfoca sus decisiones en consideraciones inmediatas.', equipo: 'Trabajar duro y eficientemente para completar tareas en los plazos previstos. Contribuir con sus capacidades de organizar en forma práctica el trabajo. Aplicar argumentos relevantes y realistas.', irritar: 'Se enfoca demasiado en la tarea actual. Es demasiado franco al criticar. No ve el bosque sino los árboles. No estimula a los otros a experimentar o innovar. No tiene en cuenta los sentimientos de los demás.', crecimiento: 'Detenerse a pensar y reconocer que los otros pueden aceptar mejor sus ideas si las contribuciones de ellos también son valoradas. Tomarse tiempo para considerar el impacto en los sentimientos de los demás.', estres: 'Tomar el control, decidir y decirle a todos lo que hay que hacer. Usar soluciones probadas y conocidas. Tomar decisiones apresuradamente sin considerar el impacto en las personas.' },
  ESFJ: { titulo: 'ESFJ - El Cónsul', motivacion: 'Toma decisiones basado en sus valores personales. Aprecia y acepta a las personas, disfrutando su compañía y la búsqueda de la armonía. Es comprensivo y compasivo. Toma las cosas desde el punto de vista de las personas.', preferencias: 'Busca relaciones estables y armoniosas. Tiende a adaptarse al entorno. Expresa la apreciación que siente hacia los demás. Tiende a considerar los sentimientos de los otros antes que los propios.', conducta: 'Enfoca su mundo exterior de sentimientos en las relaciones presentes y las personas. Encuentra formas prácticas de estar al servicio de las personas. Observa a las personas subjetivamente.', equipo: 'Trabaja duro y eficientemente para completar tareas. Asegura que cada uno se siente valorado. Mantiene buenas relaciones y construye el espíritu de equipo. Mantiene al equipo informado pidiendo contribuciones de todos.', irritar: 'Habla demasiado. Asume que conoce las necesidades de los demás. Evita el conflicto. No pone atención a sus propias necesidades. Es reacio a intentar nuevas cosas.', crecimiento: 'Aprender a observar y aceptar los aspectos negativos de personas que admira. Intentar ver a las personas de manera más independiente y objetiva. Expresar su desacuerdo o crítica cuando sea de valor.', estres: 'Trabajar duro para completar tareas predeterminadas. Expresar apreciación por los esfuerzos de todos. No reconocer la necesidad de cambio. Negar sus propias necesidades.' },
  ENFJ: { titulo: 'ENFJ - El Protagonista', motivacion: 'Toma decisiones basado en sus valores personales. Aprecia y acepta a las personas, disfrutando su compañía y la búsqueda de la armonía. Es comprensivo y compasivo. Toma las cosas desde el punto de vista de las personas.', preferencias: 'Busca relaciones estables y armoniosas. Tiende a adaptarse al entorno. Expresa la apreciación que siente hacia los demás. Es sensible al elogio y la crítica.', conducta: 'Enfoca su mundo exterior de sentimientos en ideas y posibilidades orientadas hacia las personas. Busca relaciones significativas. Intenta entender a las personas, obteniendo conocimiento de su personalidad y motivaciones.', equipo: 'Promueve inspiración y entendimiento mutuo dentro del equipo. Facilita las discusiones promoviendo los aportes de todos. Busca llegar a decisiones por consenso. Genera espíritu de equipo con energía y entusiasmo.', irritar: 'Habla demasiado. Asume que conoce las necesidades de los demás. Evita el conflicto. Toma la crítica en forma personal. Se enfoca demasiado en los temas interpersonales.', crecimiento: 'Buscar formas objetivas e independientes de verificar sus ideas acerca de las personas. Detenerse a pensar e impulsar a los otros a expresar sus propias necesidades. Enfocarse en los detalles impersonales.', estres: 'Organizar a todo el mundo. Expresar aprecio por sus esfuerzos. Contribuir con ideas creativas pero ignorar las realidades presentes.' },
  ENTJ: { titulo: 'ENTJ - El Comandante', motivacion: 'Le gusta tomar decisiones con base en la lógica, mediante consideraciones objetivas. Se preocupa por la verdad, los principios y la justicia. Es analítico y crítico. Toma un punto de vista objetivo.', preferencias: 'Organiza la vida con una base lógica, clasificando, ordenando y dirigiendo los hechos y situaciones. Es decisivo. Critica espontáneamente. No le teme al conflicto. Toma un enfoque impersonal.', conducta: 'Enfoca su mundo exterior de reflexión hacia decisiones creativas que llevan al cambio y a nuevas posibilidades. Organiza sus actividades en la búsqueda de un propósito o estrategia superiores.', equipo: 'Enfocarse en las tareas que deben realizarse y mantener al equipo en la ruta. Proporcionar impulso para completar las tareas a tiempo y con alta calidad. Moldear la estructura del equipo.', irritar: 'Establece directivas sin explicar las razones. Domina al equipo. No toma en cuenta los sentimientos de los demás. Dirige con rudeza. Decide apresuradamente.', crecimiento: 'Detenerse a pensar y reconocer que los demás aceptarán su dirección más fácilmente si las contribuciones de ellos también son valoradas. Tomarse tiempo para considerar el impacto en los sentimientos de los demás.', estres: 'Tomar el control, decidir y decirle a todos lo que hay que hacer. Mantener el sentido de dirección. Tomar decisiones apresuradamente sin considerar el impacto en las personas.' }
}

// Rangos por serie Terman
const RANGOS_SERIE = {
  I: { Sobresaliente: 16, Superior: 15, 'Término Medio Alto': 14, 'Término Medio': 12, 'Término Medio Bajo': 10, Inferior: 8, Deficiente: 0 },
  II: { Sobresaliente: 22, Superior: 20, 'Término Medio Alto': 18, 'Término Medio': 12, 'Término Medio Bajo': 10, Inferior: 8, Deficiente: 0 },
  III: { Sobresaliente: 29, Superior: 27, 'Término Medio Alto': 23, 'Término Medio': 14, 'Término Medio Bajo': 12, Inferior: 8, Deficiente: 0 },
  IV: { Sobresaliente: 18, Superior: 16, 'Término Medio Alto': 14, 'Término Medio': 10, 'Término Medio Bajo': 7, Inferior: 6, Deficiente: 0 },
  V: { Sobresaliente: 24, Superior: 20, 'Término Medio Alto': 16, 'Término Medio': 12, 'Término Medio Bajo': 8, Inferior: 6, Deficiente: 0 },
  VI: { Sobresaliente: 20, Superior: 18, 'Término Medio Alto': 15, 'Término Medio': 9, 'Término Medio Bajo': 7, Inferior: 5, Deficiente: 0 },
  VII: { Sobresaliente: 19, Superior: 18, 'Término Medio Alto': 16, 'Término Medio': 9, 'Término Medio Bajo': 6, Inferior: 5, Deficiente: 0 },
  VIII: { Sobresaliente: 17, Superior: 15, 'Término Medio Alto': 13, 'Término Medio': 8, 'Término Medio Bajo': 7, Inferior: 6, Deficiente: 0 },
  IX: { Sobresaliente: 18, Superior: 17, 'Término Medio Alto': 16, 'Término Medio': 10, 'Término Medio Bajo': 9, Inferior: 7, Deficiente: 0 },
  X: { Sobresaliente: 20, Superior: 18, 'Término Medio Alto': 16, 'Término Medio': 10, 'Término Medio Bajo': 8, Inferior: 6, Deficiente: 0 }
}
const RANGOS_ORDER = ['Sobresaliente', 'Superior', 'Término Medio Alto', 'Término Medio', 'Término Medio Bajo', 'Inferior', 'Deficiente']

const SERIES_NOMBRES = {
  I: 'Información', II: 'Juicio', III: 'Vocabulario', IV: 'Síntesis',
  V: 'Concentración', VI: 'Análisis', VII: 'Abstracción', VIII: 'Planeación',
  IX: 'Organización', X: 'Atención'
}

const INTERPRETACIONES_TERMAN = {
  I: { nombre: 'Información', descripcion: 'Evalúa la memoria a largo plazo y el nivel de información captado del entorno por parte de la persona. Nos indica la capacidad de asociación para el manejo de datos y generación de información a partir de la relación de conocimientos generales y/o culturales.', alto: 'Nivel de cultura general elevado, ambición de conocimientos, buena capacidad de aprendizaje y memoria remota. Aprovecha la percepción del mundo cotidiano.', bajo: 'Baja información del ambiente, poca capacidad para asociar sucesos y datos. Nivel de cultura general limitado.' },
  II: { nombre: 'Juicio o Comprensión', descripcion: 'Mide el sentido común, el razonamiento lógico de una serie de situaciones dadas, la comprensión y el manejo de la realidad. Podría indicar el nivel de ajuste de la persona a las normas sociales y el aprovechamiento de experiencias previas.', alto: 'Buen ajuste a normas sociales, pensamiento abstracto, sentido común y buen contacto con la realidad. Comprende y responde adecuadamente.', bajo: 'Pensamiento concreto, dificultad para ajustarse a normas y situaciones prácticas. Puede faltar sentido común.' },
  III: { nombre: 'Vocabulario', descripcion: 'Evalúa el conocimiento del lenguaje y la capacidad de análisis y de síntesis de conceptos. La puntuación se interpreta como el nivel de pensamiento abstracto y cultural.', alto: 'Riqueza verbal, inteligencia abstracta, nivel de cultura elevado y mayor riqueza en conceptos. Correcta dirección de la atención.', bajo: 'Procesos intelectuales concretos, dificultad para expresarse, bajo nivel de lectura y cultura general.' },
  IV: { nombre: 'Síntesis', descripcion: 'Evalúa el razonamiento, la deducción lógica y capacidad de abstracción. Nos permite conocer la habilidad de la persona para apreciar el medio con objetividad.', alto: 'Correcta formación de conceptos, objetivo en apreciaciones del medio ambiente. Buena capacidad de clasificación y organización lógica.', bajo: 'Tendencia práctica, analiza superficialmente las situaciones. Dificultad para conceptualizar principios básicos.' },
  V: { nombre: 'Aritmética o Concentración', descripcion: 'Mide el nivel de manejo de aspectos cuantitativos, la atención y la resistencia a la distracción. Nos permite conocer si la persona presenta capacidad de concentración para trabajar bajo cierto grado de presión.', alto: 'Buenos conocimientos numéricos, elevado grado de concentración y atención bajo presión. Experiencia en manejo de operaciones aritméticas.', bajo: 'Dificultad para concentrarse, posible ansiedad bajo presión, problemas con habilidad numérica.' },
  VI: { nombre: 'Análisis o Juicio Práctico', descripcion: 'Mide el sentido común, la previsión e identificación de incongruencias. Nos ayuda a conocer si la persona puede desglosar la información y llegar a las causas de un problema.', alto: 'Cultura amplia, buena comprensión de información escrita y óptimo contacto con la realidad.', bajo: 'Dificultades en lectura y comprensión de textos. Cultura o información limitada y poco enriquecida.' },
  VII: { nombre: 'Abstracción', descripcion: 'Mide la generalización y comprensión de ideas. Refleja la habilidad para observar de forma diferente las cualidades de un objeto y relacionarlas para llegar a la solución de un problema.', alto: 'Facilidad de palabra, utilización adecuada de conceptos, rapidez y efectividad en elección de alternativas.', bajo: 'Capacidad de expresión limitada, dificultad para encontrar conceptos precisos, necesita tiempo para elegir entre alternativas.' },
  VIII: { nombre: 'Planeación', descripcion: 'Evalúa la capacidad de planeación, organización, anticipación, imaginación y atención a los detalles. Implica que la persona sea capaz de prever las ventajas o consecuencias de determinadas situaciones futuras.', alto: 'Iniciativa, busca soluciones rápidas y creativas. Buena atención a detalles, capacidad de ordenar lo desestructurado. Perfeccionista.', bajo: 'Baja atención a detalles, baja capacidad para percibir la totalidad. Observa los árboles pero no puede ver el bosque. Conformista.' },
  IX: { nombre: 'Organización', descripcion: 'Evalúa la capacidad de discriminación, organización y seguimiento de procesos. Nos permite conocer la habilidad de identificar fallos en los procesos y hacer posible que las cosas funcionen bien.', alto: 'Hábil en comprensión de significados y conceptos, ágil para encontrar discrepancias y reacomodar situaciones.', bajo: 'Capacidad de conceptualización limitada, problemas para ordenar y jerarquizar prioridades.' },
  X: { nombre: 'Atención, Anticipación o Seriación', descripcion: 'Mide la atención, concentración y deducción. El rendimiento indicará el nivel de capacidad para interpretar y verificar cálculos numéricos y la habilidad para estar concentrado en una tarea que requiere manejar símbolos bajo cierta presión.', alto: 'Buena capacidad de observación, sintetiza información para analizarla y aplicarla. Actividades básicas para desempeñar una gerencia con éxito.', bajo: 'Dificultad para observar detalles, las presiones provocan ansiedad.' }
}

// CARRERAS por área/subárea. Fuente única compartida con server.js: antes había
// dos copias en el código y la de este archivo se quedó con un tercio de las carreras.
const CARRERAS = require('./data/carreras.json')

// Color de cada área, el mismo de items_areas.json y del Excel de resultados,
// para que la gráfica general y la de cada subárea se lean como un solo sistema.
const AREA_COLORS = {
  'Preferencias Universitarias': '#3498DB',
  'Físico-Matemáticas': '#E74C3C',
  'Biológicas': '#27AE60',
  'Químicas': '#9B59B6',
  'Administrativas': '#F39C12',
  'Sociales': '#1ABC9C',
  'Humanidades': '#E91E63'
}

const AREA_KEY_MAP = {
  'Preferencias Universitarias': 'PU',
  'Físico-Matemáticas': 'FM',
  'Biológicas': 'B',
  'Químicas': 'Q',
  'Administrativas': 'A',
  'Sociales': 'S',
  'Humanidades': 'H'
}

// Textos fijos del reporte (extraídos del documento de muestra)
const TEXTOS = {
  introAprova: `Aprender a elegir es el objetivo de APROVA.

La Orientación Vocacional es un proceso de aprendizaje; es un conjunto de instrumentos destinados a proveer las herramientas necesarias para posibilitar la mejor situación para la toma de decisión.

En APROVA promovemos un ámbito de reflexión, para acompañar a los jóvenes en forma activa, para pensar con ellos (pero no por ellos), y puedan libremente ser protagonistas en la construcción de su propio proyecto de vida.

Al tomar conciencia de sí, al conocer sus fortalezas, debilidades, oportunidades y deseos, cada uno irá preparando un terreno más seguro, para elaborar su proyecto personal.

Es primordial escucharlos, reflejar lo que se nos transmite, ayudar a repensar lo que se dice, de lo que quieren y lo que no quieren ser. Reflexionar sobre los condicionamientos que entretejen la vida de la persona, ayudar a identificar lo que surge de uno mismo y lo que surge del otro.

Aprender a elegir es elegirse, definir el yo que se ha de llegar a ser. El primer "llegar a ser" es llegar a "ser uno mismo", crecer en conocimiento y en autonomía responsable, no sólo para sí, sino como miembro de su comunidad.

Llegar a "ser" y llegar a "hacer" no son nunca definitivos ni cerrados, ni tampoco ofrecen una puntual coincidencia entre el ser y el hacer. Siempre existe un margen de posibles desencuentros.`,

  objetivoEvaluacion: (nombre) => `El objetivo al aplicar las diferentes pruebas consiste en ayudar a ${nombre} a obtener un autoconocimiento, de su persona, de sus capacidades y sus intereses, de sus fortalezas, debilidades y oportunidades que le ayuden a encontrar la carrera profesional más compatible con su perfil.

Las pruebas que se eligieron para ${nombre} muestran una fotografía de su situación actual, del hoy, de ninguna manera pretenden determinar y/o encasillar a la persona, pues recordemos que somos seres cambiantes, y lo que hoy nos define, no necesariamente será lo que nos defina mañana.

Recordemos que los estudios profesionales, siguen siendo parte de la formación primordial de la persona, que cada día es una nueva oportunidad para elegir qué es "lo que se quiere ser".

Las pruebas psicométricas aplicadas, nos permiten un acercamiento al conocimiento de la persona, con el fin de comparar la compatibilidad de la misma, con el perfil de las carreras afines.

Cabe señalar que el resultado obtenido será confiable en la medida que las pruebas sean contestadas con la mayor honestidad.`,

  elegirCarrera: `La mayoría de los jóvenes que empiezan una carrera lo hacen porque creen que la licenciatura elegida es algo que les gusta, pero el error es que no tienen suficiente información como para determinar si esto es en realidad así o solamente se trata de una idea general que tienen de lo que es la carrera.

1. Investigar los temas que se estudian
Quizás sea lo más instintivo. ¿Qué temas voy a ver si curso tal carrera? Aquí lo importante no es creer lo que uno va a estudiar de acuerdo a lo que le parece, sino investigar. ¿Cómo se puede hacer esto? Buscando el plan de estudios de la carrera donde se la desea estudiar. ¿Alcanza con saber el nombre de las materias? ¡No! Hay que buscar el temario, al menos de las materias del primer año. ¿Alcanza con leer los nombres de los temas? ¡Tampoco! Hay que leer un poco y mirar en forma general. Determinar si hay demasiado contenido que no nos gusta.

Aquí pueden llegar a descubrir que lo que pensaban que les gustaba, en realidad no sólo no les gusta, sino que de ninguna manera lo desearían. Es mejor hacerlo antes que cuando ya se está cursando la licenciatura.

2. Ver a qué se dedica diariamente un profesional de esa carrera
¿Elegiste medicina? Bien, ¿cómo es un día en la vida de un médico? ¿Qué hace en la mañana? ¿Cuántas horas trabaja? ¿Con qué personas comparte su espacio de trabajo? Todas estas preguntas son solo algunas de las que uno debería hacerse. Y podría buscar la respuesta investigando en internet o contactándose con personas que se dediquen a la carrera elegida.

3. Conocer el ambiente de trabajo del profesional
¡No saben lo importante que es! No es lo mismo lo que uno hace, que el lugar dónde lo hace. Las preguntas que podríamos hacernos aquí son: ¿Hay que moverse mucho? ¿Hay que pasar tiempo en la calle? ¿Hay que estar encerrado todo el día? Aunque a uno le guste una carrera y los temas que trata, si no está conforme con el ambiente en que tiene que trabajar, nunca podrá ejercer esa profesión.

4. Socializar con personas vinculadas a la carrera
Nada mejor que hablar con personas vinculadas a la vocación elegida. Esto incluye profesionales, a quienes les pueden realizar varias de las preguntas de los puntos anteriores, o estudiantes de la carrera preseleccionada. El contacto con los profesionales y con estudiantes avanzados de la carrera les puede dar un mejor panorama.

5. Averiguar si hay oferta laboral
Siempre decimos que uno debe elegir una carrera de acuerdo a si le apasiona o no. Sin embargo, no hay que dejar de lado que de nuestra labor diaria vamos a vivir, es decir, implica que nos va a generar un ingreso. No es una cuestión menor.

6. Asistir a charlas de universidades
Muchas universidades suelen realizar charlas informativas donde se habla de las carreras y también de la actividad académica. Pueden ser provechosas para entender un poco más lo que se va a estudiar.`,

  elegirUniversidad: `¿Cuál es la Universidad adecuada para ti? Tomar en cuenta:

• Grado de dificultad para ingresar
• Las formas de acceso a esos estudios
• Nivel académico, nivel de dificultad
• Los contenidos o el plan de estudios
• La duración
• El perfil de las personas que realizan estos estudios
• El tipo de título que se obtiene al finalizar los estudios
• Ubicación
• Cómo es el campus
• Cuánto cuesta
• Si se puede vivir en ella
• Cómo y por qué es reconocida
• El coste de los estudios
• Las posibilidades de becas o ayudas
• Las ofertas laborales profesionales
• Los centros públicos y privados donde se imparten

Recomendamos:
• Asistir a una feria de universidades.
• Hablar con tus padres.
• Hablar con varias personas que asistan o hayan asistido a esa universidad.
• Leer folletos de universidades y visitar sus sitios de internet.
• Visitar el campus, lo cual te dará una mejor perspectiva posible.

La elección de estudios va conjunta con la elección de la Universidad. Algunos criterios a tener en cuenta:
• Las posibilidades de realizar prácticas en empresas.
• Los programas de intercambio con el extranjero.
• Los programas de doble titulación, diplomados, o demás cursos que ofrecen.
• Posibilidad de cursar materias en verano.
• Los servicios del centro (biblioteca, bolsa de empleo, aula de estudios).
• El prestigio y reconocimiento de la Universidad.
• El prestigio y reconocimiento de sus profesores.`,

  habitosEstudio: `Lo que caracteriza a los estudiantes exitosos es que han logrado adquirir buenos hábitos de estudio. Para adquirir buenos hábitos, no es suficiente tener la intención, sino practicarlos diariamente.

• Planifica tus actividades semanales y asigna horario específico para estudiar. Usa una agenda. Planea tu semana de estudio, y escoge la mejor hora para estudiar. Asígnale un tiempo a cada materia.

• Limita tus periodos de trabajo para no estudiar demasiado cada vez. Si tratas de estudiar demasiado cada vez, te cansarás y tu estudio no será muy efectivo. Distribuye el trabajo en periodos cortos.

• Trata de estudiar a las mismas horas cada día. Si estudias a la misma hora cada día, establecerás una rutina que se transforma en una parte habitual de su vida.

• Fija metas específicas para tus horarios de estudio. Las metas te ayudan a mantenerte enfocado y controlar tu progreso.

• Empieza a estudiar en los horarios programados. El retraso en iniciar el estudio se llama procrastinar. Si no puedes empezar a tiempo por alguna razón, no pierdas el tiempo esperando.

• Trabaja primero en la materia que encuentras más difícil. La asignación más difícil va a requerir de tu mayor esfuerzo. Inicia con ella pues es cuando tienes mucha más energía mental.

• Repasa tus apuntes antes de comenzar a estudiar en una materia.

• Evita distractores. Una idea sencilla: apaga tu celular durante tus horas de estudio.

• Consulta a un compañero. Si tienes dificultades al comprender la materia, "dos cabezas piensan mejor que una."

• Acuéstate temprano. Dormir lo necesario asegura estar llenos de energía para comenzar el siguiente día.

• Asegúrate de tener un buen lugar de estudio. Tener un escritorio y una silla confortable, con buena luz, y una temperatura agradable.`,

  vivirFuera: `Una de las determinaciones más importantes y difíciles para cualquier estudiante que se prepara para ingresar al mundo de la educación superior es decidir exactamente qué estudiar. Combina esto con la decisión valiente, admirable y aventurera para seguir esos estudios fuera de tu lugar de residencia.

Consideraciones básicas:

Abandonar el lugar en que vivimos: Implica mudarse y dejar atrás, al menos durante unos años, el lugar donde uno se creció y a la gente que uno quiere. No debe ser fácil. Las comunicaciones de hoy en día seguramente ayudan mucho a mantener el contacto.

Restringir el tiempo libre y de esparcimiento: Una carrera universitaria demanda mucho tiempo para estudiar y estar al día con las materias, es probable que se disponga de menos tiempo libre para divertirse.

La independencia personal: La verdadera independencia se alcanza manejándose con autonomía sin depender de los padres. Es necesario un trabajo que garantice una suma de dinero tal que cubra los gastos de alimentos, vivienda y salud.

Postergar etapas de la vida: La universidad consume no sólo tiempo sino también energía. A tal punto, que es preferible verla como una etapa de nuestras vidas, y concentrarnos en ella.

Postergar proyectos personales: Todos tenemos más de una afición. Quizás en algún momento incluso estuvimos tentados a estudiar otra carrera. Eso es normal.`,

  otrasConsideraciones: `• El promedio que se solicita en las universidades para el ingreso equivale a los 5 primeros semestres de preparatoria, lo cual hace imprescindible lograr los mejores resultados al cursar el primer semestre del último grado de preparatoria.

• Los exámenes presentados a nivel nacional (EXANI o CENEVAL), son de suma importancia, ya que en base a ellos se pueden obtener becas académicas y forman la integración del expediente solicitado para el ingreso a otros niveles superiores de estudio.

• El examen del College Board, que mide las habilidades del pensamiento, es también aplicado en otras universidades como examen de admisión.

• Es importante también acreditar los exámenes de computación (MOS). Forman parte de tu expediente académico.

• En todas las universidades de México se solicita un nivel académico de Inglés, por lo tanto, se recomienda acreditar el idioma por una academia externa reconocida (TOEFL, Cambridge, First Certificate, etc.).

• La cartilla Nacional es un requisito que debes considerar, sobre todo, si estudias o vas a estudiar en el extranjero.`
}

function getRangoSerie(serieKey, puntuacion) {
  const rangos = RANGOS_SERIE[serieKey]
  if (!rangos) return 'Término Medio'
  for (const rng of RANGOS_ORDER) {
    if (puntuacion >= rangos[rng]) return rng
  }
  return 'Deficiente'
}

function getNivelRaz(centil) {
  if (centil >= 90) return 'Muy Alto'
  if (centil >= 75) return 'Alto'
  if (centil >= 60) return 'Medio Alto'
  if (centil >= 40) return 'Medio'
  if (centil >= 25) return 'Medio Bajo'
  if (centil >= 10) return 'Bajo'
  return 'Muy Bajo'
}

function getNivelAptitud(puntaje) {
  if (puntaje >= 41) return 'Muy Alto'
  if (puntaje >= 31) return 'Alto'
  if (puntaje >= 21) return 'Medio'
  if (puntaje >= 11) return 'Bajo'
  return 'Muy Bajo'
}

function getRangoCI(ci) {
  if (ci >= 140) return 'Sobresaliente'
  if (ci >= 120) return 'Superior'
  if (ci >= 110) return 'Término Medio Alto'
  if (ci >= 90) return 'Normal (Término Medio)'
  if (ci >= 80) return 'Término Medio Bajo'
  if (ci >= 70) return 'Inferior'
  return 'Deficiente'
}

function getEtiquetaNivel(rango) {
  const idx = RANGOS_ORDER.indexOf(rango)
  if (idx <= 1) return 'FORTALEZA'
  if (idx === 2) return 'ARRIBA DEL PROMEDIO'
  if (idx === 3) return 'PROMEDIO'
  if (idx === 4) return 'ABAJO DEL PROMEDIO'
  return 'ÁREA DE OPORTUNIDAD'
}

function getLevelColor(level) {
  const map = {
    'Muy Alto': COLORS.darkBlue,
    'Alto': COLORS.green,
    'Medio Alto': '#38BDF8',
    'Medio': COLORS.yellow,
    'Medio Bajo': COLORS.orange,
    'Bajo': COLORS.red,
    'Muy Bajo': '#DC2626',
    'Sobresaliente': COLORS.darkBlue,
    'Superior': COLORS.blue,
    'Término Medio Alto': COLORS.green,
    'Término Medio': COLORS.yellow,
    'Término Medio Bajo': COLORS.orange,
    'Inferior': COLORS.red,
    'Deficiente': '#991B1B'
  }
  return map[level] || COLORS.primary
}

// ===== CONSTRUCCIÓN DEL CONTENIDO =====
// Cada bloque describe QUÉ va en el reporte, no CÓMO se dibuja. Tipos:
//   portada, cierre, imagenPagina   — páginas completas
//   seccion, subseccion, subsubtitulo — encabezados (seccion abre página nueva)
//   parrafo, vineta, destacado, nota, centrado, carrera — texto
//   grafica, definiciones, dimensiones — bloques compuestos

// Los reportes de Gabriela alternan párrafos corridos con listas introducidas por
// una frase que termina en "…" o en ":" ("En el trabajo, a menudo suelen..."). Al
// extraer el .docx se pierde la viñeta, así que aquí se reconstruye.
function bloquesNarrativaMBTI(parrafos) {
  const bloques = []
  let enLista = false
  parrafos.forEach(parrafo => {
    if (/[…:]$/.test(parrafo) || /\.\.\.$/.test(parrafo)) {
      bloques.push({ tipo: 'destacado', texto: parrafo, espacioMin: 40 })
      enLista = true
      return
    }
    bloques.push(enLista
      ? { tipo: 'vineta', texto: parrafo, espacioMin: 20 }
      : { tipo: 'parrafo', texto: parrafo, espacioMin: 40 })
  })
  return bloques
}

function construirBloques(datos) {
  const { nombre, terman, mbti, aptitudes, intereses, areas, razonamiento } = datos
  const b = []

  let desc16 = {}
  try {
    desc16 = require('./mbti_16personalidades.json')
  } catch (e) {
    console.error('No se pudo cargar mbti_16personalidades.json:', e.message)
  }

  const fecha = new Date().toLocaleDateString('es-MX', {
    timeZone: 'America/Mexico_City', year: 'numeric', month: 'long', day: 'numeric'
  })

  b.push({ tipo: 'portada', nombre, fecha })

  b.push({ tipo: 'seccion', titulo: 'APROVA' })
  b.push({ tipo: 'parrafo', texto: TEXTOS.introAprova })

  b.push({ tipo: 'seccion', titulo: 'El Objetivo de la Evaluación' })
  b.push({ tipo: 'parrafo', texto: TEXTOS.objetivoEvaluacion(nombre) })

  // ===== PERSONALIDAD MBTI =====
  if (mbti) {
    const tipo = mbti.tipo || ''
    const tipoDesc = descripcionesMBTI[tipo]
    const tipo16 = desc16[tipo]

    b.push({ tipo: 'seccion', titulo: 'Características de la Personalidad' })
    b.push({ tipo: 'centrado', texto: tipo, tamano: 24, negrita: true, color: COLORS.primary })
    if (tipoDesc) {
      b.push({ tipo: 'centrado', texto: tipoDesc.titulo, tamano: 14, color: COLORS.textSecondary })
    }

    if (mbti.dimensiones) {
      const dimNombres = {
        EI: { polo1: 'Extraversión (E)', polo2: 'Introversión (I)' },
        SN: { polo1: 'Sensación (S)', polo2: 'Intuición (N)' },
        TF: { polo1: 'Pensamiento (T)', polo2: 'Sentimiento (F)' },
        JP: { polo1: 'Juicio (J)', polo2: 'Percepción (P)' }
      }
      const filas = []
      Object.entries(mbti.dimensiones).forEach(([key, dim]) => {
        const info = dimNombres[key]
        if (!info) return
        const total = (dim[key[0]] || 0) + (dim[key[1]] || 0)
        const pct1 = total > 0 ? Math.round((dim[key[0]] / total) * 100) : 50
        filas.push({
          etiqueta: `${info.polo1}: ${pct1}%    vs    ${info.polo2}: ${100 - pct1}%    →  Dominante: ${dim.dominante}`,
          pct1
        })
      })
      if (filas.length) b.push({ tipo: 'dimensiones', filas })
    }

    // Narrativa propia de APROVA: es la fuente preferente por ser contenido propio
    // y mucho más extenso que las descripciones de respaldo.
    const narrativa = REPORTES_MBTI[tipo]
    const clavesNarrativa = narrativa
      ? ORDEN_SECCIONES_MBTI.filter(k => narrativa[k] && narrativa[k].parrafos.length)
      : []

    clavesNarrativa.forEach(k => {
      b.push({ tipo: 'subseccion', titulo: narrativa[k].titulo, espacioMin: 80 })
      bloquesNarrativaMBTI(narrativa[k].parrafos).forEach(x => b.push(x))
    })

    // Respaldo para tipos sin reporte propio
    if (!clavesNarrativa.length && tipo16) {
      b.push({ tipo: 'subseccion', titulo: 'Visión General' })
      b.push({ tipo: 'parrafo', texto: tipo16.descripcion })

      if (tipo16.fortalezas && tipo16.fortalezas.length) {
        b.push({ tipo: 'subseccion', titulo: 'Fortalezas', espacioMin: 60 })
        tipo16.fortalezas.forEach(f => b.push({ tipo: 'vineta', texto: f, espacioMin: 20 }))
      }
      if (tipo16.debilidades && tipo16.debilidades.length) {
        b.push({ tipo: 'subseccion', titulo: 'Áreas de Mejora', espacioMin: 60 })
        tipo16.debilidades.forEach(d => b.push({ tipo: 'vineta', texto: d, espacioMin: 20 }))
      }
    }

    if (!clavesNarrativa.length && tipoDesc) {
      const respaldo = [
        ['¿Qué lo hace mover?', tipoDesc.motivacion],
        ['Sus preferencias hacen que:', tipoDesc.preferencias],
        ['Su forma de conducirse:', tipoDesc.conducta],
        ['Contribuciones al trabajo en equipo:', tipoDesc.equipo],
        ['Puede irritar a los demás porque:', tipoDesc.irritar],
        ['Crecimiento personal:', tipoDesc.crecimiento],
        ['Reconocer el estrés:', tipoDesc.estres]
      ]
      respaldo.forEach(par => {
        b.push({ tipo: 'subseccion', titulo: par[0], espacioMin: 60 })
        b.push({ tipo: 'parrafo', texto: par[1] })
      })
    }
  }

  // ===== INTELIGENCIA (TERMAN) =====
  if (terman) {
    b.push({ tipo: 'seccion', titulo: 'Inteligencia' })

    const ordenSeries = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
    const series = terman.series || {}

    b.push({ tipo: 'subseccion', titulo: 'Perfil de Inteligencia' })
    b.push({
      tipo: 'grafica',
      maxValue: 30,
      items: ordenSeries.map(key => {
        const d = series[key]
        if (!d) return null
        const rango = getRangoSerie(key, d.puntuacion)
        return {
          label: `${key}. ${(INTERPRETACIONES_TERMAN[key] || {}).nombre || key}`,
          value: d.puntuacion,
          displayValue: `${d.puntuacion}`,
          level: rango,
          color: getLevelColor(rango)
        }
      }).filter(Boolean)
    })

    // Detalle por serie: solo el nombre, sin aciertos ni nivel
    ordenSeries.forEach(key => {
      const d = series[key]
      if (!d) return
      const interp = INTERPRETACIONES_TERMAN[key]
      const esAlto = RANGOS_ORDER.indexOf(getRangoSerie(key, d.puntuacion)) <= 2
      b.push({ tipo: 'subsubtitulo', texto: `${key} ${interp.nombre}`, tamano: 12, espacioMin: 120 })
      b.push({ tipo: 'nota', texto: interp.descripcion, tamano: 10 })
      b.push({ tipo: 'interpretacion', etiqueta: 'Interpretación: ', texto: esAlto ? interp.alto : interp.bajo })
    })

    b.push({ tipo: 'subseccion', titulo: 'Recomendaciones Generales', espacioMin: 80 })
    const recomendaciones = [
      'Mantener un ambiente de aprendizaje estructurado con objetivos claros.',
      'Utilizar estrategias de enseñanza variadas que atiendan diferentes estilos de aprendizaje.',
      'Establecer rutinas de estudio regulares con períodos de descanso.',
      'Fomentar la lectura y actividades que amplíen el conocimiento general.',
      'Proporcionar retroalimentación frecuente y reconocimiento de logros.'
    ]
    recomendaciones.forEach(r => b.push({ tipo: 'vineta', texto: r, espacioMin: 16 }))

    b.push({
      tipo: 'nota',
      tamano: 9,
      texto: 'Nota importante: Este reporte es una herramienta de orientación. Los resultados deben ser interpretados por un profesional calificado y considerados en conjunto con otras fuentes de información (observación, historial académico, entrevistas).'
    })
  }

  // ===== RAZONAMIENTO (DAT-5) =====
  if (razonamiento) {
    b.push({ tipo: 'seccion', titulo: 'Razonamiento' })

    if (razonamiento.datosPersonales) {
      const dp = razonamiento.datosPersonales
      if (dp.sexo) b.push({ tipo: 'nota', texto: `Sexo: ${dp.sexo}`, tamano: 10 })
      if (dp.nivel) b.push({ tipo: 'nota', texto: `Nivel educativo: ${dp.nivel}`, tamano: 10 })
    }

    const secciones = razonamiento.secciones || razonamiento.respuestas || {}
    const ordenadas = Object.entries(secciones).sort((x, y) => (y[1].centil || 0) - (x[1].centil || 0))

    b.push({
      tipo: 'grafica',
      maxValue: 99,
      items: ordenadas.map(par => {
        const key = par[0]
        const d = par[1]
        const centil = d.centil != null ? d.centil : d.porcentaje
        const nivel = getNivelRaz(centil)
        return { label: d.nombre || key, value: centil, displayValue: `${centil}`, level: nivel, color: getLevelColor(nivel) }
      })
    })

    const defs = ordenadas
      .map(par => ({ nombre: par[1].nombre || par[0], definicion: (DEFINICIONES.razonamiento || {})[par[0]] }))
      .filter(d => d.definicion)
    if (defs.length) {
      b.push({ tipo: 'subseccion', titulo: 'Qué mide cada apartado', espacioMin: 100 })
      b.push({ tipo: 'definiciones', entradas: defs })
    }
  }

  // ===== APTITUDES =====
  if (aptitudes) {
    b.push({ tipo: 'seccion', titulo: 'Aptitudes' })
    const ordenadas = Object.entries(aptitudes).sort((x, y) => y[1].puntaje - x[1].puntaje)

    b.push({
      tipo: 'grafica',
      maxValue: 50,
      items: ordenadas.map(par => ({
        label: par[0],
        value: par[1].puntaje,
        displayValue: `${par[1].puntaje} (${par[1].porcentaje}%)`,
        level: par[1].nivel,
        color: getLevelColor(par[1].nivel)
      }))
    })

    const defs = ordenadas
      .map(par => ({ nombre: par[0], definicion: (DEFINICIONES.aptitudes || {})[par[0]] }))
      .filter(d => d.definicion)
    if (defs.length) {
      b.push({ tipo: 'subseccion', titulo: 'Qué mide cada aptitud', espacioMin: 100 })
      b.push({ tipo: 'definiciones', entradas: defs })
    }
  }

  // ===== INTERESES =====
  if (intereses) {
    b.push({ tipo: 'seccion', titulo: 'Intereses' })
    const ordenados = Object.entries(intereses).sort((x, y) => y[1].puntaje - x[1].puntaje)

    b.push({
      tipo: 'grafica',
      maxValue: 50,
      items: ordenados.map(par => ({
        label: par[0],
        value: par[1].puntaje,
        displayValue: `${par[1].puntaje} (${par[1].porcentaje}%)`,
        level: par[1].nivel,
        color: getLevelColor(par[1].nivel)
      }))
    })

    const defs = ordenados
      .map(par => ({ nombre: par[0], definicion: (DEFINICIONES.intereses || {})[par[0]] }))
      .filter(d => d.definicion)
    if (defs.length) {
      b.push({ tipo: 'subseccion', titulo: 'Qué mide cada interés', espacioMin: 100 })
      b.push({ tipo: 'definiciones', entradas: defs })
    }
  }

  // ===== PREFERENCIAS UNIVERSITARIAS =====
  if (areas) {
    b.push({ tipo: 'seccion', titulo: 'Preferencias Universitarias' })

    // Las subáreas del test de PU son las 6 áreas profesionales: muestran cómo
    // las jerarquizó el alumno.
    const pu = areas['Preferencias Universitarias']
    if (pu && pu.subareas) {
      b.push({ tipo: 'subseccion', titulo: 'Preferencia entre las áreas profesionales' })
      b.push({
        tipo: 'grafica',
        maxValue: 100,
        items: Object.entries(pu.subareas)
          .sort((x, y) => y[1].porcentaje - x[1].porcentaje)
          .map(par => ({ label: par[0], value: par[1].porcentaje, displayValue: `${par[1].porcentaje}%`, color: COLORS.primary }))
      })
    }

    // Se excluye PU: no es un área, es la jerarquización de todas.
    const ordenadas = Object.entries(areas)
      .filter(par => par[0] !== 'Preferencias Universitarias')
      .sort((x, y) => y[1].porcentaje - x[1].porcentaje)

    if (ordenadas.length) {
      b.push({ tipo: 'subseccion', titulo: 'Áreas Vocacionales exploradas', espacioMin: 100 })
      b.push({
        tipo: 'grafica',
        maxValue: 100,
        items: ordenadas.map(par => ({ label: par[0], value: par[1].porcentaje, displayValue: `${par[1].porcentaje}%`, color: AREA_COLORS[par[0]] || COLORS.primary }))
      })
    }

    const ordenAreas = ['Físico-Matemáticas', 'Biológicas', 'Químicas', 'Administrativas', 'Sociales', 'Humanidades']
    const defsAreas = ordenAreas
      .map(area => ({ nombre: area, definicion: (DEFINICIONES.areas || {})[area] }))
      .filter(d => d.definicion)
    if (defsAreas.length) {
      b.push({ tipo: 'subseccion', titulo: 'Qué comprende cada área profesional', espacioMin: 100 })
      b.push({ tipo: 'definiciones', entradas: defsAreas })
    }

    // Cada área que el alumno exploró (los tres subtipos que abrió el diagnóstico)
    // lleva primero la gráfica con todas sus subáreas y enseguida las carreras, para
    // que la puntuación y la oferta se lean juntas. Las carreras se limitan a las tres
    // subáreas más altas, igual que en el Excel de resultados: la gráfica da el
    // panorama completo y la lista se queda con lo que de verdad le conviene revisar.
    ordenadas.forEach(par => {
      const area = par[0]
      const d = par[1]
      if (!d.subareas) return
      const areaKey = AREA_KEY_MAP[area]
      if (!areaKey || !CARRERAS[areaKey]) return

      const color = AREA_COLORS[area] || COLORS.primary
      const subsOrdenadas = Object.entries(d.subareas)
        .sort((x, y) => y[1].porcentaje - x[1].porcentaje)

      b.push({ tipo: 'subseccion', titulo: `${area} (${d.porcentaje}%)`, espacioMin: 160 })
      b.push({ tipo: 'subsubtitulo', texto: 'Puntuación por subárea', tamano: 11, espacioMin: 80 })
      b.push({
        tipo: 'grafica',
        maxValue: 100,
        items: subsOrdenadas.map(sp => ({
          label: sp[0],
          value: sp[1].porcentaje,
          displayValue: `${sp[1].porcentaje}%`,
          color
        }))
      })

      b.push({ tipo: 'subsubtitulo', texto: 'Carreras afines (subáreas más altas)', tamano: 11, espacioMin: 60 })
      subsOrdenadas.slice(0, 3).forEach(sp => {
        const carreras = CARRERAS[areaKey][sp[0]]
        if (!carreras || !carreras.length) return
        b.push({ tipo: 'subsubtitulo', texto: `${sp[0]} (${sp[1].porcentaje}%)`, tamano: 11, espacioMin: 40 })
        carreras.forEach(c => b.push({ tipo: 'carrera', texto: c, espacioMin: 14 }))
      })
    })
  }

  // ===== SECCIONES FIJAS DE ASESORÍA =====
  b.push({ tipo: 'seccion', titulo: 'Elegir Carrera' })
  b.push({ tipo: 'parrafo', texto: TEXTOS.elegirCarrera })

  b.push({ tipo: 'seccion', titulo: 'Elegir la Universidad' })
  b.push({ tipo: 'parrafo', texto: TEXTOS.elegirUniversidad })

  b.push({ tipo: 'seccion', titulo: 'Consideraciones para Vivir Fuera' })
  b.push({ tipo: 'parrafo', texto: TEXTOS.vivirFuera })

  b.push({ tipo: 'seccion', titulo: 'Hábitos de Estudio' })
  b.push({ tipo: 'parrafo', texto: TEXTOS.habitosEstudio })

  b.push({ tipo: 'seccion', titulo: 'Otras Consideraciones' })
  b.push({ tipo: 'parrafo', texto: TEXTOS.otrasConsideraciones })

  const pasosImg = path.join(__dirname, 'pasos_aprova.jpg')
  if (fs.existsSync(pasosImg)) b.push({ tipo: 'imagenPagina', ruta: pasosImg })

  b.push({ tipo: 'cierre', fecha })

  return b
}

module.exports = { construirBloques, COLORS, getLevelColor }
