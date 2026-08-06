// Extrae la narrativa específica de cada tipo MBTI desde los reportes .docx de APROVA.
// El andamiaje fijo del reporte (intro, valores, aptitudes, intereses, asesoría) NO se
// extrae: eso lo genera generar-reporte.js. Aquí solo interesa lo que cambia por tipo.
//
//   node scripts/extraer-mbti.js data/mbti-reportes.json <carpeta-o-docx>...
//
// Acepta carpetas (toma sus .docx) y archivos sueltos. Si un tipo aparece en varias
// rutas, gana la última: sirve para corregir un tipo suelto sin tocar la carpeta.
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const SALIDA = process.argv[2]
const RUTAS = process.argv.slice(3)

if (!SALIDA || !RUTAS.length) {
  console.error('Uso: node scripts/extraer-mbti.js <salida.json> <carpeta-o-docx>...')
  process.exit(1)
}

// Cada sección con sus variantes de encabezado (los documentos se editaron a mano
// durante años y el mismo apartado quedó con nombres distintos).
const SECCIONES = [
  { key: 'personalidad', titulo: 'Características de la personalidad', alias: ['Características de la Personalidad', 'Caracteristicas de la Personalidad', 'Principales Características', 'Principales Caracteristicas', 'Visión General', 'Vision General', 'PERSONALIDAD'] },
  // Ojo: no incluir "Escuela" a secas — en DATOS PERSONALES existe el campo "Escuela:"
  { key: 'aprendizaje', titulo: 'Escuela y aprendizaje', alias: ['En la escuela y Aprendizaje', 'En la Escuela Aprendizaje', 'En la Escuela Aprendiendo', 'La Escuela Aprendizaje', 'La Escuela Aprendiendo', 'Escuela Aprendizaje', 'Escuela Aprendiendo', 'En la Escuela', 'La Escuela', 'APRENDIZAJE', 'Aprendiendo', 'Aprendizaje'] },
  { key: 'escritura', titulo: 'Escritura', alias: ['Escribiendo', 'Escritura', 'ESCRITURA'] },
  // "Procastinación" y "Expoloración" son erratas del reporte de 2021, no descuidos aquí
  { key: 'procrastinacion', titulo: 'Procrastinación', alias: ['Dilación Procrastinación', 'Dilación Procrastinar', 'Procrastinar Dilación', 'Procrastinación', 'Procrastinacion', 'Procastinación', 'Procastinacion', 'Procrastinar', 'Dilación', 'Dilacion', 'POSTERGAR'] },
  { key: 'exploracionCarrera', titulo: 'Exploración de carrera', alias: ['Exploración profesional o exploración de Carreras', 'INVESTIGACION DE LA CARRERA', 'INVESTIGACIÓN DE LA CARRERA', 'Exploración de carreras', 'Exploración de carrera', 'Expoloración de Carrera', 'Expoloracion de Carrera', 'Exploración profesional', 'Exploracion de carrera', 'Búsqueda de Profesión', 'Busqueda de Profesion'] },
  { key: 'busquedaTrabajo', titulo: 'Búsqueda de trabajo', alias: ['Búsqueda de trabajo', 'Búsqueda de empleo', 'Busqueda de trabajo', 'Busqueda de empleo'] },
  { key: 'trabajo', titulo: 'En el trabajo', alias: ['El Trabajo', 'Trabajo'] },
  { key: 'equipo', titulo: 'Trabajo en equipo', alias: ['Trabajo en equipo'] },
  { key: 'liderazgo', titulo: 'Liderazgo', alias: ['Liderazgo', 'LIDERAZGO'] },
  { key: 'comunicacion', titulo: 'Comunicación', alias: ['Comunicación', 'Comunicacion', 'COMUNICACION'] },
  { key: 'decisiones', titulo: 'Toma de decisiones', alias: ['Toma de decisiones', 'Toma de Decisión', 'Toma de decision', 'Decisiones'] },
  { key: 'juego', titulo: 'Tiempo libre', alias: ['Jugando', 'Juego', 'Tiempo libre'] },
  { key: 'estres', titulo: 'Estrés', alias: ['Estrés', 'Estres', 'ESTRES', 'Stress'] }
]

// Encabezados que cierran la sección en curso sin abrir ninguna: son apartados que
// solo trae algún reporte suelto y no forman parte de las 13 secciones comunes.
// Sin esto, su contenido se acumularía en la sección anterior.
// Casi todos vienen del reporte de ISTJ de 2021, que trae apartados que los
// demás no: listados de carreras por tipo, reglas de éxito y un anexo final.
const SECCIONES_IGNORADAS = [
  'Carreras a considerar',
  'Qué significa el éxito',
  '¿Qué significa el éxito?',
  'Diez reglas para vivir para lograr el éxito',
  'Permitiendo que tus fortalezas',
  'Áreas con problemas potenciales',
  'Explicación de problemas',
  'Soluciones',
  'Versión Reducida',
  'La Sombra'
]

// Los encabezados traen puntos, guiones y dos puntos según quién editó el archivo.
// "La Escuela. Aprendizaje" y "Dilación-Procrastinar" deben compararse igual.
function normalizar(texto) {
  return texto.toLowerCase().replace(/[.\-–—:,;]+/g, ' ').replace(/\s+/g, ' ').trim()
}

// Marca dónde termina la parte específica del tipo y empieza el andamiaje fijo.
const FIN_BLOQUE = ['Inteligencia', 'Valores o', 'Valores']

// Un .docx es un ZIP. Se lee word/document.xml directamente con zlib, sin depender
// de herramientas externas ni de descomprimir a mano. Se recorre el directorio
// central del ZIP, que es la única parte con tamaños y offsets confiables.
function leerDelDocx(rutaDocx, nombreInterno) {
  const buf = fs.readFileSync(rutaDocx)

  // Fin del directorio central (EOCD): firma 0x06054b50, buscada desde el final
  let eocd = -1
  for (let i = buf.length - 22; i >= 0 && i > buf.length - 66000; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break }
  }
  if (eocd === -1) throw new Error('no parece un .docx (no se encontró el EOCD)')

  const totalEntradas = buf.readUInt16LE(eocd + 10)
  let pos = buf.readUInt32LE(eocd + 16)

  for (let n = 0; n < totalEntradas; n++) {
    if (buf.readUInt32LE(pos) !== 0x02014b50) break
    const metodo = buf.readUInt16LE(pos + 10)
    const tamComprimido = buf.readUInt32LE(pos + 20)
    const largoNombre = buf.readUInt16LE(pos + 28)
    const largoExtra = buf.readUInt16LE(pos + 30)
    const largoComentario = buf.readUInt16LE(pos + 32)
    const offsetLocal = buf.readUInt32LE(pos + 42)
    const nombre = buf.toString('utf-8', pos + 46, pos + 46 + largoNombre)

    if (nombre === nombreInterno) {
      // En la cabecera local los largos pueden diferir de los del directorio
      const nombreLocal = buf.readUInt16LE(offsetLocal + 26)
      const extraLocal = buf.readUInt16LE(offsetLocal + 28)
      const inicio = offsetLocal + 30 + nombreLocal + extraLocal
      const datos = buf.subarray(inicio, inicio + tamComprimido)
      return metodo === 0 ? datos : zlib.inflateRawSync(datos)
    }
    pos += 46 + largoNombre + largoExtra + largoComentario
  }
  throw new Error(`el .docx no contiene ${nombreInterno}`)
}

function parrafosDe(rutaDocx) {
  const xml = leerDelDocx(rutaDocx, 'word/document.xml').toString('utf-8')
  return xml
    .split(/<w:p[ >]/)
    .map(p => [...p.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(m => m[1]).join(''))
    .map(t => t.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

// Expande carpetas a sus .docx y deja pasar los archivos sueltos, en orden
function recolectarDocx(rutas) {
  const archivos = []
  rutas.forEach(ruta => {
    if (!fs.existsSync(ruta)) { console.error('No existe:', ruta); return }
    if (fs.statSync(ruta).isDirectory()) {
      fs.readdirSync(ruta).sort()
        .filter(n => n.toLowerCase().endsWith('.docx') && !n.startsWith('~$'))
        .forEach(n => archivos.push(path.join(ruta, n)))
    } else {
      archivos.push(ruta)
    }
  })
  return archivos
}

// Todos los pares (sección, alias) ordenados del alias más largo al más corto.
// Es indispensable: "Trabajo en equipo" debe ganarle a "Trabajo", que es su prefijo.
const ALIAS_ORDENADOS = SECCIONES
  .flatMap(sec => sec.alias.map(alias => ({ sec, alias: normalizar(alias) })))
  .sort((a, b) => b.alias.length - a.alias.length)

// ¿Este párrafo es el encabezado de una sección? Debe ser corto y coincidir
// con un alias, para no confundirlo con una frase que mencione la palabra.
function encabezadoDe(parrafo) {
  if (parrafo.length > 60) return null
  const limpio = normalizar(parrafo)
  // Primero coincidencias exactas, luego por prefijo ("La Escuela Aprendiendo")
  for (const { sec, alias } of ALIAS_ORDENADOS) if (limpio === alias) return sec
  for (const { sec, alias } of ALIAS_ORDENADOS) if (limpio.startsWith(alias + ' ')) return sec
  return null
}

function esFinDeBloque(parrafo) {
  const limpio = normalizar(parrafo)
  return FIN_BLOQUE.some(m => limpio === normalizar(m))
}

function esSeccionIgnorada(parrafo) {
  if (parrafo.length > 60) return false
  const limpio = normalizar(parrafo)
  return SECCIONES_IGNORADAS.some(m => limpio.startsWith(normalizar(m)))
}

function tipoDeNombre(nombre) {
  const m = nombre.toUpperCase().match(/\b(IS|IN|ES|EN)(TJ|TP|FJ|FP)\b/)
  return m ? m[0] : null
}

const resultado = {}
const informe = []

recolectarDocx(RUTAS).forEach(archivo => {
  const nombre = path.basename(archivo, '.docx')
  const tipo = tipoDeNombre(nombre)
  if (!tipo) { informe.push(`${nombre}: no se pudo deducir el tipo MBTI`); return }

  let parrafos
  try {
    parrafos = parrafosDe(archivo)
  } catch (e) {
    informe.push(`${nombre}: no se pudo leer (${e.message})`)
    return
  }
  const secciones = {}
  let actual = null
  let terminado = false

  for (const p of parrafos) {
    if (terminado) break

    // Al llegar al andamiaje fijo se corta todo. Va antes que cualquier otra
    // comprobación: después de "Inteligencia" vienen las tablas de Aptitudes e
    // Intereses, cuyas filas reutilizan palabras como "Organización" o "Musical".
    if (esFinDeBloque(p)) { terminado = true; break }

    if (esSeccionIgnorada(p)) { actual = null; continue }

    const enc = encabezadoDe(p)
    if (enc) {
      // Una sección puede reabrirse y seguir acumulando: hay reportes que parten
      // la personalidad en "Visión General" y "Principales Características".
      if (!secciones[enc.key]) secciones[enc.key] = []
      actual = enc.key
      continue
    }
    if (actual) secciones[actual].push(p)
  }

  // Limpiar: quitar secciones vacías y recortar ruido
  const limpias = {}
  SECCIONES.forEach(sec => {
    const cuerpo = (secciones[sec.key] || []).filter(t => t.length > 3)
    if (cuerpo.length) limpias[sec.key] = { titulo: sec.titulo, parrafos: cuerpo }
  })

  // Última ruta gana, pero un archivo del que no se sacó nada no pisa uno bueno:
  // en esas carpetas conviven reportes de APROVA con documentos de otro formato.
  const previas = resultado[tipo] ? Object.keys(resultado[tipo]).length : 0
  if (previas > 0 && Object.keys(limpias).length === 0) {
    informe.push(`${tipo.padEnd(5)} se ignora ${nombre}: no se le extrajo ninguna sección`)
    return
  }
  resultado[tipo] = limpias

  const faltantes = SECCIONES.filter(s => !limpias[s.key]).map(s => s.key)
  const totalParrafos = Object.values(limpias).reduce((n, s) => n + s.parrafos.length, 0)
  informe.push(`${tipo.padEnd(5)} ${String(Object.keys(limpias).length).padStart(2)}/13 secciones  ${String(totalParrafos).padStart(3)} parrafos  ${faltantes.length ? '| faltan: ' + faltantes.join(', ') : ''}`)
})

fs.writeFileSync(SALIDA, JSON.stringify(resultado, null, 2), 'utf-8')
console.log(informe.join('\n'))
console.log('\nTipos extraidos:', Object.keys(resultado).length)
console.log('Archivo:', SALIDA, '(' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB)')
