// Extrae del reporte Word la tabla de definiciones, que mezcla los subtests de
// razonamiento (DAT-5) con las aptitudes (BRP), y las separa según los nombres
// que realmente usa la aplicación.
const fs = require('fs')
const path = require('path')

const DOC = path.join(process.argv[2], 'REPORTE 2023 INTJ', 'word', 'document.xml')
const SALIDA = process.argv[3]

// Nombre en el Word -> clave de sección del test de razonamiento en la app
const A_RAZONAMIENTO = {
  'Razonamiento Verbal': 'verbal',
  'Razonamiento Numérico': 'numerico',
  'Razonamiento Abstracto': 'abstracto',
  'Relaciones Espaciales': 'espacial',
  'Ortografía': 'ortografia',
  'Velocidad y Exactitud Perceptual': 'perceptiva'
}

// Nombre en el Word -> nombre exacto de la aptitud en items_aptitudes.json
const A_APTITUDES = {
  'Coordinación Visomotriz': 'Coordinación Visomotriz',
  'Verbal': 'Verbal',
  'Persuasiva': 'Persuasiva',
  'Social': 'Social',
  'Directiva': 'Directiva',
  'Organización': 'Organización',
  'Musical': 'Musical',
  'Artístico Plástico': 'Artístico Plástica'
}

// Nombre en el Word -> nombre exacto de la escala en items_intereses.json
const A_INTERESES = {
  'Biológico': 'Biológicos',
  'Mecánico/Constructivo': 'Mecánico Constructivo',
  'Campestre': 'Campestre',
  'Geofísico': 'Geofísicos',
  'Servicio Social': 'Servicio Social',
  'Literario': 'Literativo',
  'Organización': 'Organización',
  'Ejecutivo/Persuasivo': 'Ejecutivo Persuasivo',
  'Cálculo': 'Cálculo',
  'Contabilidad': 'Contabilidad',
  'Musical': 'Musical',
  'Artístico/Plástico': 'Artístico Plástico',
  'Científico': 'Científico'
}

// Definiciones que NO existen en el reporte Word de Gabriela y se redactaron aparte.
// Las de razonamiento siguen la descripción oficial del subtest en el manual DAT-5;
// las de aptitudes se redactaron a partir de los reactivos de items_aptitudes.json,
// respetando el estilo de las definiciones originales.
// Solo se usan para rellenar huecos: si el Word llega a traerlas, gana el Word.
const COMPLEMENTO = {
  razonamiento: {
    mecanico: 'Mide la capacidad para comprender los principios básicos de la mecánica: el funcionamiento de máquinas, herramientas y movimientos. Cada reactivo presenta gráficamente una situación mecánica acompañada de una pregunta breve, de manera que se evalúa el razonamiento sobre principios elementales —palancas, poleas, engranes, fuerzas y equilibrio— más que los conocimientos técnicos previos. Es una habilidad característica de profesiones como la ingeniería, la mecánica, la electricidad y la operación de maquinaria.'
  },
  aptitudes: {
    'Abstracta o Científica': 'Capacidad para comprender las relaciones que existen entre elementos y fenómenos, así como para manejar los conceptos y nomenclaturas propios de las ciencias. Implica facilidad para aplicar el método científico, para seguir e interpretar artículos de investigación en ciencias naturales, químicas o biológicas, y para explicar de modo lógico y claro los procesos que estudia. El sujeto capta con facilidad los principios generales y los relaciona entre sí para llegar a conclusiones.',
    'Numérica': 'Capacidad para comprender y manejar con soltura las relaciones numéricas. El sujeto sigue sin dificultad el razonamiento de un procedimiento matemático, advierte cuando falta un dato para resolver un problema o cuando hay un error en la solución planteada, y es capaz de construir por su cuenta ejercicios y relaciones numéricas. Implica facilidad para entender la clase de matemáticas y para aplicar operaciones y fórmulas a situaciones concretas.',
    'Mecánica': 'Capacidad para comprender el funcionamiento de aparatos, máquinas y sistemas mecánicos, así como para armarlos, operarlos y darles mantenimiento. El sujeto identifica con facilidad las partes de un mecanismo y la función de cada una, aprende su manejo a partir de manuales o instructivos, y entiende sin dificultad los textos técnicos y de divulgación sobre el tema.',
    'Espacial': 'Capacidad para representar y manejar mentalmente los espacios y los objetos en tres dimensiones. Implica imaginar un objeto desde distintas posiciones y perspectivas, orientarse con facilidad en lugares desconocidos, retener indicaciones para llegar a un destino y prever cómo se distribuyen o acomodan los elementos dentro de un espacio determinado.'
  },
  intereses: {},
  // Las áreas profesionales no están definidas en ningún lado del reporte Word.
  // Se redactaron a partir de las subáreas y los listados de carreras del propio
  // instrumento, para que coincidan con lo que el reporte enlista después.
  areas: {
    'Preferencias Universitarias': 'Jerarquiza actividades representativas de las seis áreas profesionales para identificar hacia cuáles se inclina la persona de manera general, antes de explorar a fondo sus subtipos. El resultado señala el orden de preferencia entre las áreas; no mide el dominio ni la aptitud para ellas.',
    'Físico-Matemáticas': 'Agrupa las profesiones que trabajan con el número, la materia y la energía para transformar el entorno. Comprende desde las ciencias puras —matemáticas y física— hasta el diseño y la construcción de artefactos, obras e instalaciones, el aprovechamiento de los recursos naturales, la industria, el manejo de datos y la medición del territorio. Son carreras que exigen razonamiento numérico y abstracto, visión espacial y gusto por resolver problemas técnicos.',
    'Biológicas': 'Reúne las profesiones dedicadas al estudio y cuidado de los seres vivos y de su entorno. Abarca la biología en su forma pura, la salud humana y animal, la producción agrícola y forestal, la conservación del medio ambiente y el aprovechamiento de los recursos marinos. Suponen interés por la observación de la naturaleza, disposición al servicio y una base sólida en ciencias experimentales.',
    'Químicas': 'Comprende las profesiones que estudian la composición y la transformación de la materia, y que aplican ese conocimiento en la industria y en la salud. Incluye la química pura e inorgánica, la bioquímica de los alimentos, la farmacología, el análisis clínico, la química agrícola y los procesos petroquímicos. Requieren precisión, método experimental y facilidad para el trabajo de laboratorio.',
    'Administrativas': 'Agrupa las profesiones que planean, organizan y dirigen los recursos de una institución para alcanzar sus objetivos. Se extiende a la administración de recursos financieros, humanos, comerciales, turísticos, públicos, educativos, agrícolas y mineros, así como al manejo de la información. Suponen capacidad de organización, trato con la gente, iniciativa y visión práctica.',
    'Sociales': 'Reúne las profesiones que estudian a la persona y a la sociedad, y que intervienen para mejorar su convivencia. Comprende el estudio de los principios y las leyes que rigen a los grupos humanos, el trabajo asistencial, el acompañamiento psicológico, el ejercicio del derecho, la educación y las relaciones entre las personas. Exigen sensibilidad social, facilidad de palabra y disposición para escuchar.',
    'Humanidades': 'Agrupa las profesiones dedicadas a la reflexión sobre el ser humano y a la expresión de su cultura. Va del pensamiento filosófico y religioso a las distintas formas de expresión —oral, escrita, plástica, corporal y auditiva—, además de los idiomas, el estudio del pasado y el resguardo del patrimonio cultural. Suponen sensibilidad estética, capacidad de expresión y gusto por la lectura y la creación.'
  }
}

const xml = fs.readFileSync(DOC, 'utf-8')
const tablas = xml.split('<w:tbl>').slice(1)

// Son dos tablas distintas y hay que procesarlas por separado: "Organización" y
// "Musical" existen en ambas, con definiciones diferentes según el test.
const tablaAptitudes = tablas.find(t => t.includes('Razonamiento Verbal'))
const tablaIntereses = tablas.find(t => t.includes('Gusto por conocer e investigar los organismos'))
if (!tablaAptitudes) { console.error('No se encontro la tabla de aptitudes/razonamiento'); process.exit(1) }
if (!tablaIntereses) { console.error('No se encontro la tabla de intereses'); process.exit(1) }

function filasDe(tabla) {
  // Cortar en el cierre de la tabla. Sin esto, la última tabla del documento se
  // extiende hasta el final del archivo y su último renglón absorbe todo el
  // texto que viene después (asesoría, hábitos de estudio, etc.).
  const cierre = tabla.indexOf('</w:tbl>')
  const soloTabla = cierre === -1 ? tabla : tabla.slice(0, cierre)

  return soloTabla.split('<w:tr').slice(1).map(f =>
    f.split('<w:tc>').slice(1)
      .map(c => [...c.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(m => m[1]).join('').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
  ).filter(c => c.length >= 2)
}

// En el Word quedaron puntos sin espacio ("lectura misma.Capacidad para").
// Al unir los runs del XML se conservan, así que se corrigen aquí.
function limpiar(texto) {
  return texto.replace(/([.,;])([A-ZÁÉÍÓÚÑ])/g, '$1 $2').replace(/\s+/g, ' ').trim()
}

const razonamiento = {}
const aptitudes = {}
const intereses = {}
const areas = {}
const sinUsar = []

filasDe(tablaAptitudes).forEach(([etiqueta, definicion]) => {
  const nombre = etiqueta.replace(/[\s:]+$/, '').trim()
  if (A_RAZONAMIENTO[nombre]) razonamiento[A_RAZONAMIENTO[nombre]] = limpiar(definicion)
  else if (A_APTITUDES[nombre]) aptitudes[A_APTITUDES[nombre]] = limpiar(definicion)
  else sinUsar.push('aptitudes/' + nombre)
})

filasDe(tablaIntereses).forEach(([etiqueta, definicion]) => {
  const nombre = etiqueta.replace(/[\s:]+$/, '').trim()
  if (A_INTERESES[nombre]) intereses[A_INTERESES[nombre]] = limpiar(definicion)
  else sinUsar.push('intereses/' + nombre)
})

// Rellenar los huecos con las definiciones redactadas aparte, sin pisar el Word
const complementadas = []
Object.entries(COMPLEMENTO).forEach(([grupo, defs]) => {
  const destino = { razonamiento, aptitudes, intereses, areas }[grupo]
  Object.entries(defs).forEach(([clave, texto]) => {
    if (!destino[clave]) { destino[clave] = texto; complementadas.push(grupo + '/' + clave) }
  })
})

fs.writeFileSync(SALIDA, JSON.stringify({ razonamiento, aptitudes, intereses, areas }, null, 2), 'utf-8')

// Reportar cobertura contra lo que la app realmente evalúa
const SECCIONES_APP = ['verbal', 'numerico', 'abstracto', 'mecanico', 'espacial', 'ortografia', 'perceptiva']
const APTITUDES_APP = ['Abstracta o Científica', 'Coordinación Visomotriz', 'Numérica', 'Verbal', 'Persuasiva', 'Mecánica', 'Social', 'Directiva', 'Organización', 'Musical', 'Artístico Plástica', 'Espacial']
const INTERESES_APP = ['Biológicos', 'Mecánico Constructivo', 'Campestre', 'Geofísicos', 'Servicio Social', 'Literativo', 'Organización', 'Ejecutivo Persuasivo', 'Cálculo', 'Contabilidad', 'Musical', 'Artístico Plástico', 'Científico']

const AREAS_APP = ['Preferencias Universitarias', 'Físico-Matemáticas', 'Biológicas', 'Químicas', 'Administrativas', 'Sociales', 'Humanidades']

const cobertura = [
  ['RAZONAMIENTO', razonamiento, SECCIONES_APP],
  ['APTITUDES   ', aptitudes, APTITUDES_APP],
  ['INTERESES   ', intereses, INTERESES_APP],
  ['ÁREAS       ', areas, AREAS_APP]
]
cobertura.forEach(([etiqueta, obj, esperados]) => {
  const faltan = esperados.filter(k => !obj[k])
  console.log(etiqueta + ':', Object.keys(obj).length + '/' + esperados.length,
    '| faltan:', faltan.join(', ') || 'ninguna')
})
if (sinUsar.length) console.log('Sin mapear:', sinUsar.join(', '))
if (complementadas.length) console.log('Redactadas aparte (no vienen del Word):', complementadas.join(', '))
console.log('->', SALIDA)
