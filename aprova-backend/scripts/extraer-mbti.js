// Extrae la narrativa específica de cada tipo MBTI desde los reportes .docx de APROVA.
// El andamiaje fijo del reporte (intro, valores, aptitudes, intereses, asesoría) NO se
// extrae: eso lo genera generar-reporte.js. Aquí solo interesa lo que cambia por tipo.
const fs = require('fs')
const path = require('path')

const BASE = process.argv[2]
const SALIDA = process.argv[3]

// Cada sección con sus variantes de encabezado (los documentos se editaron a mano
// durante años y el mismo apartado quedó con nombres distintos).
const SECCIONES = [
  { key: 'personalidad', titulo: 'Características de la personalidad', alias: ['Características de la Personalidad', 'Caracteristicas de la Personalidad', 'Visión General', 'Vision General', 'PERSONALIDAD'] },
  // Ojo: no incluir "Escuela" a secas — en DATOS PERSONALES existe el campo "Escuela:"
  { key: 'aprendizaje', titulo: 'Escuela y aprendizaje', alias: ['En la escuela y Aprendizaje', 'En la Escuela Aprendizaje', 'En la Escuela Aprendiendo', 'La Escuela Aprendizaje', 'La Escuela Aprendiendo', 'Escuela Aprendizaje', 'Escuela Aprendiendo', 'En la Escuela', 'La Escuela', 'APRENDIZAJE', 'Aprendiendo', 'Aprendizaje'] },
  { key: 'escritura', titulo: 'Escritura', alias: ['Escribiendo', 'Escritura', 'ESCRITURA'] },
  { key: 'procrastinacion', titulo: 'Procrastinación', alias: ['Dilación Procrastinación', 'Dilación Procrastinar', 'Procrastinar Dilación', 'Procrastinación', 'Procrastinacion', 'Procrastinar', 'Dilación', 'Dilacion', 'POSTERGAR'] },
  { key: 'exploracionCarrera', titulo: 'Exploración de carrera', alias: ['Exploración profesional o exploración de Carreras', 'INVESTIGACION DE LA CARRERA', 'INVESTIGACIÓN DE LA CARRERA', 'Exploración de carreras', 'Exploración de carrera', 'Exploración profesional', 'Exploracion de carrera', 'Búsqueda de Profesión', 'Busqueda de Profesion'] },
  { key: 'busquedaTrabajo', titulo: 'Búsqueda de trabajo', alias: ['Búsqueda de trabajo', 'Búsqueda de empleo', 'Busqueda de trabajo', 'Busqueda de empleo'] },
  { key: 'trabajo', titulo: 'En el trabajo', alias: ['El Trabajo', 'Trabajo'] },
  { key: 'equipo', titulo: 'Trabajo en equipo', alias: ['Trabajo en equipo'] },
  { key: 'liderazgo', titulo: 'Liderazgo', alias: ['Liderazgo', 'LIDERAZGO'] },
  { key: 'comunicacion', titulo: 'Comunicación', alias: ['Comunicación', 'Comunicacion', 'COMUNICACION'] },
  { key: 'decisiones', titulo: 'Toma de decisiones', alias: ['Toma de decisiones', 'Toma de Decisión', 'Toma de decision', 'Decisiones'] },
  { key: 'juego', titulo: 'Tiempo libre', alias: ['Jugando', 'Juego', 'Tiempo libre'] },
  { key: 'estres', titulo: 'Estrés', alias: ['Estrés', 'Estres', 'ESTRES'] }
]

// Los encabezados traen puntos, guiones y dos puntos según quién editó el archivo.
// "La Escuela. Aprendizaje" y "Dilación-Procrastinar" deben compararse igual.
function normalizar(texto) {
  return texto.toLowerCase().replace(/[.\-–—:,;]+/g, ' ').replace(/\s+/g, ' ').trim()
}

// Marca dónde termina la parte específica del tipo y empieza el andamiaje fijo.
const FIN_BLOQUE = ['Inteligencia', 'Valores o', 'Valores']

function parrafosDe(documentXml) {
  const xml = fs.readFileSync(documentXml, 'utf-8')
  return xml
    .split(/<w:p[ >]/)
    .map(p => [...p.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(m => m[1]).join(''))
    .map(t => t.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
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

function tipoDeNombre(nombre) {
  const m = nombre.toUpperCase().match(/\b(IS|IN|ES|EN)(TJ|TP|FJ|FP)\b/)
  return m ? m[0] : null
}

const resultado = {}
const informe = []

fs.readdirSync(BASE).sort().forEach(dir => {
  const archivo = path.join(BASE, dir, 'word', 'document.xml')
  if (!fs.existsSync(archivo)) return
  const tipo = tipoDeNombre(dir)
  if (!tipo) { informe.push(`${dir}: no se pudo deducir el tipo MBTI`); return }

  const parrafos = parrafosDe(archivo)
  const secciones = {}
  let actual = null
  let terminado = false

  for (const p of parrafos) {
    if (terminado) break
    const enc = encabezadoDe(p)
    if (enc) {
      // Los encabezados del andamiaje fijo (Aptitudes/Intereses) reutilizan
      // palabras como "Organización", así que una sección ya llenada no se reabre.
      // Pero si sigue vacía, es que el encabezado venía repetido ("Decisiones" dos
      // veces seguidas) y hay que seguir capturando en ella.
      if (!secciones[enc.key]) { secciones[enc.key] = []; actual = enc.key }
      else if (secciones[enc.key].length === 0) actual = enc.key
      else actual = null
      continue
    }
    if (actual && esFinDeBloque(p)) { terminado = true; break }
    if (actual) secciones[actual].push(p)
  }

  // Limpiar: quitar secciones vacías y recortar ruido
  const limpias = {}
  SECCIONES.forEach(sec => {
    const cuerpo = (secciones[sec.key] || []).filter(t => t.length > 3)
    if (cuerpo.length) limpias[sec.key] = { titulo: sec.titulo, parrafos: cuerpo }
  })

  resultado[tipo] = limpias
  const faltantes = SECCIONES.filter(s => !limpias[s.key]).map(s => s.key)
  const totalParrafos = Object.values(limpias).reduce((n, s) => n + s.parrafos.length, 0)
  informe.push(`${tipo.padEnd(5)} ${String(Object.keys(limpias).length).padStart(2)}/13 secciones  ${String(totalParrafos).padStart(3)} parrafos  ${faltantes.length ? '| faltan: ' + faltantes.join(', ') : ''}`)
})

fs.writeFileSync(SALIDA, JSON.stringify(resultado, null, 2), 'utf-8')
console.log(informe.join('\n'))
console.log('\nTipos extraidos:', Object.keys(resultado).length)
console.log('Archivo:', SALIDA, '(' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB)')
