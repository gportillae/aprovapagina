const PDFDocument = require('pdfkit')
const path = require('path')
const fs = require('fs')

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

// CARRERAS por área/subárea (copiado de server.js)
const CARRERAS = {"FM":{"Puras":["Lic. en Matemáticas","Lic. en Física","Lic. en Fisicomatemáticos","Ingeniería Física Industrial","Ingeniería en Nanotecnología"],"Artefactos":["Ingeniería en Mecatrónica","Ingeniería en Sistemas Computacionales","Ingeniería Mecánica","Ingeniería Eléctrica","Ingeniería en Electrónica y Comunicaciones","Ingeniería en Aeronáutica","Ingeniería Biomédica"],"Naturaleza":["Ingeniería Geológica","Ingeniería Petrolera","Ingeniería en Energía","Lic. en Ciencias de la Tierra","Lic. en Geofísica"],"Industria":["Ingeniería Industrial y de Sistemas","Ingeniería Industrial","Ingeniería en Software Industrial","Ingeniería en Gestión y Control de Calidad"],"Construcción":["Ingeniería Civil","Arquitectura","Ingeniero Urbanista","Arquitectura y Urbanismo","Ingeniería Topográfica"],"Manejo de datos":["Lic. en Actuaría","Lic. en Estadística","Lic. en Matemáticas Aplicadas","Lic. en Ciencias en Computación"],"Medición Geodésica":["Ingeniería Topográfica y Geodésica","Ingeniero Geógrafo","Lic. en Geografía","Lic. en Geomática"],"Diseño":["Lic. en Diseño Industrial","Ingeniería en Diseño Gráfico","Ingeniería en Innovación y Diseño"]},"B":{"Puras":["Lic. en Biología","Lic. en Biología Marina","Ingeniería en Biotecnología","Lic. en Genómica","Lic. en Ecología"],"Salud Humana":["Medicina","Médico Cirujano","Lic. en Enfermería","Lic. en Nutrición","Lic. en Odontología","Lic. en Fisioterapia","Lic. en Farmacia","Ingeniería Biomédica"],"Salud Animal":["Médico Veterinario y Zootecnista","Ingeniero Zootecnista","Lic. en Producción Animal"],"Terrestre":["Ingeniería Agronómica","Ingeniero Agrónomo","Ingeniero Agroindustrial","Lic. en Agronegocios"],"Silvícola":["Ingeniería Forestal","Lic. en Ciencias Forestales","Ingeniería en Manejo de Recursos Naturales"],"Ambientalista":["Ingeniería Ambiental","Lic. en Ciencias Ambientales","Lic. en Desarrollo Sustentable","Ingeniería en Sistemas Ambientales"],"Marítima":["Biología Marina","Ingeniería en Acuicultura","Oceanólogo","Lic. en Hidrobiología"]},"Q":{"Puras":["Lic. en Química","Lic. en Ciencias Químicas","Ingeniería en Nanotecnología"],"Inorgánicas":["Ingeniería Química","Ingeniería Química Metalúrgica","Químico Metalúrgico"],"Org. Bioq. Alimentos":["Ingeniería en Alimentos","Lic. en Química de los Alimentos","Bioquímica en Alimentos","Ingeniero Bioquímico"],"Org. Bioq. Farmacología":["Química Farmacéutica Biológica","Lic. en Farmacia Clínica","Lic. en Ciencias Farmacéuticas"],"Químicas Agrícolas":["Química Agrícola","Ingeniería Química en Agroindustria","Lic. Agroquímico"],"Org. Petroquímico Industrial":["Ingeniería Química Petrolera","Ingeniería Química de Procesos","Ingeniería Química Industrial"],"Org. Bioq. Clínica":["Químico Clínico","Lic. en Análisis Clínicos","Lic. Químico Biólogo","Ingeniero Bioquímico"]},"A":{"Rec. Instrumentales":["Lic. en Informática","Lic. en Computación","Ingeniería en Software","Ingeniería en Sistemas Computacionales","Lic. en Ciencias de la Información"],"Rec. Financieros":["Lic. en Contaduría Pública","Lic. en Economía","Lic. en Finanzas","Lic. en Administración Financiera","Lic. en Auditoría"],"Rec. Humanos":["Lic. en Administración de Empresas","Lic. en Recursos Humanos","Lic. en Psicología Organizacional","Lic. en Relaciones Industriales"],"Rec. Comerciales":["Lic. en Mercadotecnia","Lic. en Comercio Internacional","Lic. en Logística","Lic. en Publicidad","Lic. en Negocios Internacionales"],"Rec. Turísticos":["Lic. en Turismo","Lic. en Gastronomía","Lic. en Hotelería","Lic. en Administración de Eventos"],"Rec. Públicos":["Lic. en Administración Pública","Lic. en Ciencias Políticas","Lic. en Políticas Públicas","Lic. en Gobierno"],"Rec. Educativos":["Lic. en Pedagogía","Lic. en Psicología Educativa","Lic. en Administración Educativa","Lic. en Innovación Educativa"],"Rec. Agrícolas":["Lic. en Administración de Agronegocios","Lic. en Administración Agropecuaria"],"Rec. Mineros":["Lic. en Administración de Empresas Mineras"]},"S":{"Principios y Leyes":["Lic. en Sociología","Lic. en Antropología Social","Lic. en Ciencias Sociales","Lic. en Demografía"],"Rel. Asistencial":["Lic. en Trabajo Social","Lic. en Desarrollo Comunitario"],"Rel. Existencial":["Lic. en Psicología","Lic. en Psicología Clínica","Lic. en Criminología","Lic. en Desarrollo Humano"],"Rel. Legal":["Lic. en Derecho","Lic. en Ciencias Políticas","Lic. en Relaciones Internacionales","Lic. en Criminología y Criminalística"],"Rel. Educacional":["Lic. en Pedagogía","Lic. en Ciencias de la Educación","Lic. en Educación Especial","Lic. en Psicopedagogía"],"Rel. Interhumana":["Lic. en Relaciones Públicas","Lic. en Comunicación Organizacional","Lic. en Comunicación Humana"]},"H":{"Humanidades":["Lic. en Filosofía","Lic. en Teología","Lic. en Ciencias Humanas","Lic. en Humanidades"],"Expresión Oral":["Lic. en Artes Escénicas","Lic. en Teatro","Lic. en Comunicación","Lic. en Ciencias de la Comunicación"],"Expresión Escrita":["Lic. en Letras","Lic. en Lingüística","Lic. en Periodismo","Lic. en Creación Literaria"],"Expresión Plástica":["Lic. en Artes Visuales","Lic. en Diseño Gráfico","Lic. en Diseño de Interiores","Arquitectura","Lic. en Diseño de Modas"],"Expresión Corporal":["Lic. en Danza","Lic. en Ciencias del Deporte","Lic. en Cultura Física y Deporte"],"Expresión Auditiva":["Lic. en Música","Ingeniería en Sonido","Lic. en Composición"],"Complementación":["Lic. en Ciencias de la Comunicación","Lic. en Publicidad","Lic. en Comunicación y Medios Digitales"],"Idiomas":["Lic. en Traducción","Lic. en Lenguas Extranjeras","Lic. en Lenguas Modernas"],"Combinación":["Arqueología","Lic. en Historia","Lic. en Antropología","Lic. en Restauración y Museos"],"Cuidado Cultural":["Lic. en Biblioteconomía","Lic. en Archivonomía","Lic. en Bibliotecología"]}}

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

// Helpers para dibujar en el PDF
function addSectionTitle(doc, text) {
  doc.addPage()
  doc.fontSize(22).font('Helvetica-Bold').fillColor(COLORS.primaryDark).text(text)
  doc.moveDown(0.5)
  // Línea decorativa
  doc.save()
  doc.moveTo(doc.x, doc.y).lineTo(doc.x + 200, doc.y).lineWidth(3).strokeColor(COLORS.primary).stroke()
  doc.restore()
  doc.moveDown(1)
}

function addSubsectionTitle(doc, text) {
  doc.moveDown(0.5)
  doc.fontSize(14).font('Helvetica-Bold').fillColor(COLORS.primary).text(text)
  doc.moveDown(0.3)
}

function addBodyText(doc, text) {
  doc.fontSize(11).font('Helvetica').fillColor(COLORS.text).text(text, { lineGap: 4, align: 'justify' })
  doc.moveDown(0.5)
}

function addBulletPoint(doc, text) {
  const x = doc.x
  doc.fontSize(11).font('Helvetica').fillColor(COLORS.primary).text('•', { continued: true })
  doc.fillColor(COLORS.text).text('  ' + text, { lineGap: 3 })
}

function checkPageSpace(doc, needed) {
  if (doc.y + needed > doc.page.height - 80) {
    doc.addPage()
  }
}

function drawBarChart(doc, items, maxValue, barWidth) {
  const barHeight = 20
  const labelWidth = 170
  const startX = 60
  const chartWidth = barWidth || 250
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right

  items.forEach(item => {
    checkPageSpace(doc, barHeight + 10)
    const y = doc.y

    // Label (no avanzar cursor)
    doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.text)
    doc.text(item.label, startX, y + 3, { width: labelWidth - 10, lineBreak: false, ellipsis: true })

    // Background bar
    const barX = startX + labelWidth
    doc.save()
    doc.rect(barX, y, chartWidth, barHeight).fillColor('#E5E7EB').fill()

    // Value bar
    const pct = Math.min(item.value / maxValue, 1)
    const filledWidth = chartWidth * pct
    if (filledWidth > 0) {
      doc.rect(barX, y, filledWidth, barHeight).fillColor(item.color || COLORS.primary).fill()
    }
    doc.restore()

    // Value text inside or outside bar
    const valText = item.displayValue || String(item.value)
    if (filledWidth > 50) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.white)
      doc.text(valText, barX + 6, y + 5, { width: filledWidth - 12, lineBreak: false })
    } else if (filledWidth > 0) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.text)
      doc.text(valText, barX + filledWidth + 4, y + 5, { width: 60, lineBreak: false })
    }

    // Level text to the right
    if (item.level) {
      doc.fontSize(8).font('Helvetica').fillColor(COLORS.textSecondary)
      doc.text(item.level, barX + chartWidth + 6, y + 5, { width: 70, lineBreak: false })
    }

    doc.x = startX
    doc.y = y + barHeight + 4
  })
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

/**
 * Genera el PDF del reporte vocacional
 * @param {Object} datos - Todos los datos del reporte
 * @param {string} datos.nombre - Nombre del participante
 * @param {string} datos.email - Email del participante
 * @param {Object} datos.terman - Resultados del test Terman
 * @param {Object} datos.mbti - Resultados del test MBTI
 * @param {Object} datos.aptitudes - Resultados del test de aptitudes
 * @param {Object} datos.intereses - Resultados del test de intereses
 * @param {Object} datos.areas - Resultados del test de áreas vocacionales
 * @param {Object} datos.razonamiento - Resultados del test de razonamiento
 * @returns {Promise<Buffer>} Buffer del PDF generado
 */
async function generarReportePDF(datos) {
  const { nombre, email, terman, mbti, aptitudes, intereses, areas, razonamiento } = datos

  // Cargar las descripciones de 16 personalidades
  let desc16 = {}
  try {
    desc16 = require('./mbti_16personalidades.json')
  } catch (e) {
    console.error('No se pudo cargar mbti_16personalidades.json:', e.message)
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 60, bottom: 60, left: 60, right: 60 },
      info: {
        Title: `Reporte Vocacional - ${nombre}`,
        Author: 'APROVA - Orientación Vocacional',
        Subject: 'Perfil Vocacional',
        Creator: 'APROVA'
      }
    })

    const chunks = []
    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const fecha = new Date().toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City', year: 'numeric', month: 'long', day: 'numeric' })

    // ===== PORTADA =====
    doc.rect(0, 0, doc.page.width, doc.page.height).fillColor(COLORS.primaryDark).fill()

    // Nombre centrado
    doc.fontSize(36).font('Helvetica-Bold').fillColor(COLORS.white)
    doc.text(nombre, 60, 200, { align: 'center', width: doc.page.width - 120 })

    doc.moveDown(2)
    doc.fontSize(18).font('Helvetica').fillColor(COLORS.primaryLight)
    doc.text('Reporte de Orientación Vocacional', { align: 'center', width: doc.page.width - 120 })

    doc.moveDown(4)
    doc.fontSize(28).font('Helvetica-Bold').fillColor(COLORS.white)
    doc.text('APROVA', { align: 'center', width: doc.page.width - 120 })

    doc.fontSize(14).font('Helvetica').fillColor(COLORS.primaryLight)
    doc.text('Orientación Vocacional', { align: 'center', width: doc.page.width - 120 })

    doc.moveDown(4)
    doc.fontSize(12).fillColor(COLORS.primaryLight)
    doc.text(fecha, { align: 'center', width: doc.page.width - 120 })

    // ===== INTRODUCCIÓN APROVA =====
    addSectionTitle(doc, 'APROVA')
    addBodyText(doc, TEXTOS.introAprova)

    // ===== OBJETIVO DE LA EVALUACIÓN =====
    addSectionTitle(doc, 'El Objetivo de la Evaluación')
    addBodyText(doc, TEXTOS.objetivoEvaluacion(nombre))

    // ===== PERSONALIDAD MBTI =====
    if (mbti) {
      const tipo = mbti.tipo || ''
      const tipoDesc = descripcionesMBTI[tipo]
      const tipo16 = desc16[tipo]

      addSectionTitle(doc, 'Características de la Personalidad')

      // Tipo
      doc.fontSize(24).font('Helvetica-Bold').fillColor(COLORS.primary)
      doc.text(tipo, { align: 'center' })
      if (tipoDesc) {
        doc.fontSize(14).font('Helvetica').fillColor(COLORS.textSecondary)
        doc.text(tipoDesc.titulo, { align: 'center' })
      }
      doc.moveDown(1)

      // Dimensiones
      if (mbti.dimensiones) {
        const dimNames = {
          EI: { polo1: 'Extraversión (E)', polo2: 'Introversión (I)' },
          SN: { polo1: 'Sensación (S)', polo2: 'Intuición (N)' },
          TF: { polo1: 'Pensamiento (T)', polo2: 'Sentimiento (F)' },
          JP: { polo1: 'Juicio (J)', polo2: 'Percepción (P)' }
        }

        Object.entries(mbti.dimensiones).forEach(([key, dim]) => {
          const info = dimNames[key]
          if (!info) return
          checkPageSpace(doc, 30)
          const polo1Key = key[0]
          const polo2Key = key[1]
          const total = (dim[polo1Key] || 0) + (dim[polo2Key] || 0)
          const pct1 = total > 0 ? Math.round((dim[polo1Key] / total) * 100) : 50

          doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.text)
          doc.text(`${info.polo1}: ${pct1}%    vs    ${info.polo2}: ${100 - pct1}%    →  Dominante: ${dim.dominante}`, { align: 'center' })

          // Mini barra
          const barY = doc.y + 2
          const barX = 150
          const barW = 300
          const cols1 = Math.round((pct1 / 100) * barW)
          doc.save()
          doc.rect(barX, barY, cols1, 8).fillColor(COLORS.primary).fill()
          doc.rect(barX + cols1, barY, barW - cols1, 8).fillColor(COLORS.primaryLight).fill()
          doc.restore()
          doc.y = barY + 16
        })
      }

      doc.moveDown(1)

      // Descripción general de 16personalidades
      if (tipo16) {
        addSubsectionTitle(doc, 'Visión General')
        addBodyText(doc, tipo16.descripcion)

        if (tipo16.fortalezas && tipo16.fortalezas.length > 0) {
          checkPageSpace(doc, 60)
          addSubsectionTitle(doc, 'Fortalezas')
          tipo16.fortalezas.forEach(f => {
            checkPageSpace(doc, 20)
            addBulletPoint(doc, f)
          })
          doc.moveDown(0.5)
        }

        if (tipo16.debilidades && tipo16.debilidades.length > 0) {
          checkPageSpace(doc, 60)
          addSubsectionTitle(doc, 'Áreas de Mejora')
          tipo16.debilidades.forEach(d => {
            checkPageSpace(doc, 20)
            addBulletPoint(doc, d)
          })
          doc.moveDown(0.5)
        }
      }

      // Secciones detalladas del MBTI
      if (tipoDesc) {
        const seccionesMBTI = [
          ['¿Qué lo hace mover?', tipoDesc.motivacion],
          ['Sus preferencias hacen que:', tipoDesc.preferencias],
          ['Su forma de conducirse:', tipoDesc.conducta],
          ['Contribuciones al trabajo en equipo:', tipoDesc.equipo],
          ['Puede irritar a los demás porque:', tipoDesc.irritar],
          ['Crecimiento personal:', tipoDesc.crecimiento],
          ['Reconocer el estrés:', tipoDesc.estres]
        ]

        seccionesMBTI.forEach(([titulo, texto]) => {
          checkPageSpace(doc, 60)
          addSubsectionTitle(doc, titulo)
          addBodyText(doc, texto)
        })
      }
    }

    // ===== INTELIGENCIA (TERMAN) =====
    if (terman) {
      addSectionTitle(doc, 'Inteligencia')

      // Resumen general
      doc.fontSize(14).font('Helvetica-Bold').fillColor(COLORS.primaryDark)
      doc.text(`Coeficiente Intelectual: ${terman.ci}`)
      doc.fontSize(12).font('Helvetica').fillColor(COLORS.text)
      doc.text(`Rango: ${terman.rango}`)
      doc.text(`Sumatoria Total: ${terman.sumatoria}`)
      if (terman.edadMental) doc.text(`Edad Mental: ${terman.edadMental}`)
      doc.moveDown(1)

      // Gráfica de barras por serie
      const seriesOrder = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
      const series = terman.series || {}
      const maxPorSerie = { I: 16, II: 22, III: 29, IV: 18, V: 24, VI: 20, VII: 19, VIII: 17, IX: 18, X: 20 }

      addSubsectionTitle(doc, 'Perfil de Inteligencia')
      doc.moveDown(0.3)

      const termanItems = seriesOrder.map(key => {
        const datos = series[key]
        if (!datos) return null
        const rango = getRangoSerie(key, datos.puntuacion)
        const interpNombre = INTERPRETACIONES_TERMAN[key]?.nombre || key
        return {
          label: `${key}. ${interpNombre}`,
          value: datos.puntuacion,
          displayValue: `${datos.puntuacion}`,
          level: rango,
          color: getLevelColor(rango)
        }
      }).filter(Boolean)

      drawBarChart(doc, termanItems, 30)
      doc.moveDown(1)

      // Detalle por serie
      seriesOrder.forEach(key => {
        const datos = series[key]
        if (!datos) return

        const rango = getRangoSerie(key, datos.puntuacion)
        const interp = INTERPRETACIONES_TERMAN[key]
        const rangoIdx = RANGOS_ORDER.indexOf(rango)
        const esAlto = rangoIdx <= 2
        const etiqueta = getEtiquetaNivel(rango)

        checkPageSpace(doc, 120)

        // Título de la serie
        doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.primaryDark)
        doc.text(`${key} ${interp.nombre}. Resultado: ${datos.puntuacion} aciertos | Nivel: ${rango} | ${etiqueta}`)
        doc.moveDown(0.3)

        // Descripción
        doc.fontSize(10).font('Helvetica').fillColor(COLORS.textSecondary)
        doc.text(interp.descripcion, { lineGap: 3 })
        doc.moveDown(0.3)

        // Interpretación
        doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.text)
        doc.text('Interpretación: ', { continued: true })
        doc.font('Helvetica').text(esAlto ? interp.alto : interp.bajo, { lineGap: 3 })
        doc.moveDown(0.8)
      })

      // Recomendaciones generales
      checkPageSpace(doc, 80)
      addSubsectionTitle(doc, 'Recomendaciones Generales')
      const recomendaciones = [
        'Mantener un ambiente de aprendizaje estructurado con objetivos claros.',
        'Utilizar estrategias de enseñanza variadas que atiendan diferentes estilos de aprendizaje.',
        'Establecer rutinas de estudio regulares con períodos de descanso.',
        'Fomentar la lectura y actividades que amplíen el conocimiento general.',
        'Proporcionar retroalimentación frecuente y reconocimiento de logros.'
      ]
      recomendaciones.forEach(r => {
        checkPageSpace(doc, 16)
        addBulletPoint(doc, r)
      })

      doc.moveDown(0.5)
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.textSecondary)
      doc.text('Nota importante: Este reporte es una herramienta de orientación. Los resultados deben ser interpretados por un profesional calificado y considerados en conjunto con otras fuentes de información (observación, historial académico, entrevistas).', { lineGap: 3 })
    }

    // ===== APTITUDES =====
    if (aptitudes || razonamiento) {
      addSectionTitle(doc, 'Aptitudes')

      if (aptitudes) {
        addSubsectionTitle(doc, 'Perfil de Aptitudes')
        doc.moveDown(0.3)

        const aptOrdenadas = Object.entries(aptitudes).sort((a, b) => b[1].puntaje - a[1].puntaje)
        const items = aptOrdenadas.map(([aptitud, datos]) => ({
          label: aptitud,
          value: datos.puntaje,
          displayValue: `${datos.puntaje} (${datos.porcentaje}%)`,
          level: datos.nivel,
          color: getLevelColor(datos.nivel)
        }))

        drawBarChart(doc, items, 50)
        doc.moveDown(1)
      }

      if (razonamiento) {
        checkPageSpace(doc, 100)
        addSubsectionTitle(doc, 'Aptitudes de Razonamiento (DAT-5)')
        doc.moveDown(0.3)

        if (razonamiento.datosPersonales) {
          doc.fontSize(10).font('Helvetica').fillColor(COLORS.textSecondary)
          if (razonamiento.datosPersonales.sexo) doc.text(`Sexo: ${razonamiento.datosPersonales.sexo}`)
          if (razonamiento.datosPersonales.nivel) doc.text(`Nivel educativo: ${razonamiento.datosPersonales.nivel}`)
          doc.moveDown(0.5)
        }

        const secciones = razonamiento.secciones || razonamiento.respuestas || {}
        const secOrdenadas = Object.entries(secciones).sort((a, b) => (b[1].centil || 0) - (a[1].centil || 0))

        const items = secOrdenadas.map(([key, datos]) => {
          const centil = datos.centil != null ? datos.centil : datos.porcentaje
          const nivel = getNivelRaz(centil)
          return {
            label: datos.nombre || key,
            value: centil,
            displayValue: `${centil}`,
            level: nivel,
            color: getLevelColor(nivel)
          }
        })

        drawBarChart(doc, items, 99)
        doc.moveDown(1)
      }
    }

    // ===== INTERESES =====
    if (intereses) {
      addSectionTitle(doc, 'Intereses')

      const intOrdenados = Object.entries(intereses).sort((a, b) => b[1].puntaje - a[1].puntaje)
      const items = intOrdenados.map(([escala, datos]) => ({
        label: escala,
        value: datos.puntaje,
        displayValue: `${datos.puntaje} (${datos.porcentaje}%)`,
        level: datos.nivel,
        color: getLevelColor(datos.nivel)
      }))

      drawBarChart(doc, items, 50)
      doc.moveDown(1)
    }

    // ===== PREFERENCIAS UNIVERSITARIAS (ÁREAS VOCACIONALES) =====
    if (areas) {
      addSectionTitle(doc, 'Preferencias Universitarias')

      // Resumen general de áreas
      const areasOrdenadas = Object.entries(areas).sort((a, b) => b[1].porcentaje - a[1].porcentaje)

      addSubsectionTitle(doc, 'Áreas Vocacionales')
      const areaItems = areasOrdenadas.map(([area, datos]) => ({
        label: area,
        value: datos.porcentaje,
        displayValue: `${datos.porcentaje}%`,
        color: COLORS.primary
      }))
      drawBarChart(doc, areaItems, 100)
      doc.moveDown(1)

      // Top 3 áreas con carreras afines
      const topAreas = areasOrdenadas.slice(0, 3)
      topAreas.forEach(([area, datos]) => {
        if (!datos.subareas) return
        const areaKey = AREA_KEY_MAP[area]
        if (!areaKey || !CARRERAS[areaKey]) return

        checkPageSpace(doc, 80)
        addSubsectionTitle(doc, `${area} (${datos.porcentaje}%)`)

        // Top subáreas
        const subsOrdenadas = Object.entries(datos.subareas).sort((a, b) => b[1].porcentaje - a[1].porcentaje)
        const topSubs = subsOrdenadas.slice(0, 3)

        topSubs.forEach(([sub, subDatos]) => {
          const carreras = CARRERAS[areaKey][sub]
          if (!carreras || carreras.length === 0) return

          checkPageSpace(doc, 40)
          doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.primaryDark)
          doc.text(`${sub} (${subDatos.porcentaje}%)`)
          doc.moveDown(0.2)

          // Carreras
          carreras.forEach(carrera => {
            checkPageSpace(doc, 14)
            doc.fontSize(10).font('Helvetica').fillColor(COLORS.text)
            doc.text(`  • ${carrera}`)
          })
          doc.moveDown(0.5)
        })
      })
    }

    // ===== ELEGIR CARRERA =====
    addSectionTitle(doc, 'Elegir Carrera')
    addBodyText(doc, TEXTOS.elegirCarrera)

    // ===== ELEGIR UNIVERSIDAD =====
    addSectionTitle(doc, 'Elegir la Universidad')
    addBodyText(doc, TEXTOS.elegirUniversidad)

    // ===== CONSIDERACIONES PARA VIVIR FUERA =====
    addSectionTitle(doc, 'Consideraciones para Vivir Fuera')
    addBodyText(doc, TEXTOS.vivirFuera)

    // ===== HÁBITOS DE ESTUDIO =====
    addSectionTitle(doc, 'Hábitos de Estudio')
    addBodyText(doc, TEXTOS.habitosEstudio)

    // ===== OTRAS CONSIDERACIONES =====
    addSectionTitle(doc, 'Otras Consideraciones')
    addBodyText(doc, TEXTOS.otrasConsideraciones)

    // ===== PASOS APROVA =====
    const pasosImg = path.join(__dirname, 'pasos_aprova.jpg')
    if (fs.existsSync(pasosImg)) {
      doc.addPage()
      const pageW = doc.page.width
      const pageH = doc.page.height
      const marginX = 60
      const marginY = 60
      const maxW = pageW - marginX * 2
      const maxH = pageH - marginY * 2
      // Centrar imagen manteniendo proporción
      const imgW = maxW
      const imgH = maxW * 1.25 // proporción aproximada de la imagen
      const finalH = Math.min(imgH, maxH)
      const finalW = finalH < imgH ? finalH / 1.25 : imgW
      const x = (pageW - finalW) / 2
      const y = (pageH - finalH) / 2
      doc.image(pasosImg, x, y, { width: finalW, height: finalH })
    }

    // ===== CIERRE =====
    doc.addPage()
    doc.rect(0, 0, doc.page.width, doc.page.height).fillColor(COLORS.primaryDark).fill()

    doc.fontSize(28).font('Helvetica-Bold').fillColor(COLORS.white)
    doc.text('APROVA', 60, 250, { align: 'center', width: doc.page.width - 120 })

    doc.moveDown(1)
    doc.fontSize(16).font('Helvetica').fillColor(COLORS.primaryLight)
    doc.text('Orientación Vocacional', { align: 'center', width: doc.page.width - 120 })

    doc.moveDown(2)
    doc.fontSize(12).fillColor(COLORS.primaryLight)
    doc.text('Este reporte fue generado automáticamente por el sistema APROVA.', { align: 'center', width: doc.page.width - 120 })
    doc.moveDown(0.5)
    doc.text('Los resultados deben ser interpretados por un profesional calificado.', { align: 'center', width: doc.page.width - 120 })

    doc.moveDown(2)
    doc.fontSize(11).fillColor(COLORS.primaryLight)
    doc.text(fecha, { align: 'center', width: doc.page.width - 120 })

    doc.end()
  })
}

module.exports = { generarReportePDF }
