// Reporte con el diseño de APROVA (azul y naranja), el mismo que arma la herramienta
// local "Rediseñar reporte" sobre el Word corregido. El contenido sale de
// construirBloques(), igual que el PDF clásico y el Word; aquí solo se acomoda en la
// plantilla (plantilla-reporte/plantilla_reporte.html) y Chromium la imprime a PDF.
//
// La plantilla usa Arial Narrow, que no se puede subir al repositorio (es de Microsoft
// Office). En su lugar se incrusta Liberation Sans Narrow, de licencia libre y con las
// mismas medidas, bajo el nombre "Arial Narrow" para no tocar la plantilla.
const fs = require('fs')
const path = require('path')
const { construirBloques } = require('./reporte-contenido')

const DIR = path.join(__dirname, 'plantilla-reporte')
const PLANTILLA = path.join(DIR, 'plantilla_reporte.html')
const FUENTES = path.join(DIR, 'fuentes')

const POLO = {
  E: 'Extraversión', I: 'Introversión', S: 'Sensación', N: 'Intuición',
  T: 'Pensamiento', F: 'Sentimiento', J: 'Juicio', P: 'Percepción'
}
const AREAS_PROF = ['Físico-Matemáticas', 'Biológicas', 'Químicas', 'Administrativas', 'Sociales', 'Humanidades']

// Chromium en Railway (nixpacks.toml); en Windows, el Edge o Chrome de la computadora
const NAVEGADORES = [
  process.env.CHROMIUM_PATH,
  '/root/.nix-profile/bin/chromium',
  '/nix/var/nix/profiles/default/bin/chromium',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
]

// ===== HELPERS DE HTML =====
function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
}

function claseNivel(lv) {
  if (['Muy Alto', 'Alto', 'Superior', 'Sobresaliente'].includes(lv)) return 'nivel--alto'
  if (['Medio', 'Término Medio', 'Medio Alto', 'Término Medio Alto'].includes(lv)) return 'nivel--medio'
  return 'nivel--bajo'
}

const nivel = lv => `<span class="nivel ${claseNivel(lv)}">${esc(lv)}</span>`
const barra = pct => `<span class="barra" style="--pct:${Math.max(0, Math.min(100, Math.round(pct)))}"><i></i></span>`
const td = (x, cls) => cls ? `<td class="${cls}">${x}</td>` : `<td>${x}</td>`
const fila = (...celdas) => '      <tr>' + celdas.join('') + '</tr>\n'

function tarjeta(etiqueta, valor, detalle) {
  return `      <div class="tarjeta">\n        <div class="tarjeta__etiqueta">${esc(etiqueta)}</div>\n` +
    `        <div class="tarjeta__valor">${esc(valor)}</div>\n        <div class="tarjeta__detalle">${esc(detalle)}</div>\n      </div>\n`
}

function cabecera(num, titulo) {
  return `<section class="seccion">\n  <header class="seccion__cabecera"><span class="seccion__num">${num}</span><h2>${esc(titulo)}</h2></header>\n`
}

// Una definición puede traer varios párrafos separados por saltos de línea
const parrafosDe = texto => String(texto || '').split(/\n+/).map(t => t.trim()).filter(Boolean)

// Pedazos de la plantilla entre sus comentarios '<!-- ===== NN · NOMBRE ===== -->'
function seccionesPlantilla(contenido) {
  const marcas = [...contenido.matchAll(/<!-- =+ ([^=]+?) =+ -->/g)]
  const out = {}
  marcas.forEach((m, j) => {
    const fin = j + 1 < marcas.length ? marcas[j + 1].index : contenido.length
    out[m[1].trim().split(' ')[0]] = contenido.slice(m.index + m[0].length, fin)
  })
  return out
}

// ===== DE BLOQUES A DATOS =====
// Los bloques describen el reporte en orden de lectura; el diseño los necesita
// agrupados (tablas, tarjetas de la portada), así que se reagrupan por sección.
function porSeccion(bloques) {
  const secs = {}
  let actual = null
  for (const b of bloques) {
    if (b.tipo === 'seccion') { actual = secs[b.titulo] = []; continue }
    if (actual) actual.push(b)
  }
  return secs
}

function leerPersonalidad(bs) {
  const centrados = bs.filter(b => b.tipo === 'centrado')
  const tipo = centrados[0] ? centrados[0].texto : ''
  const titulo = centrados[1] ? centrados[1].texto : tipo
  const dims = (bs.find(b => b.tipo === 'dimensiones') || { filas: [] }).filas
  const texto = []
  for (const b of bs) {
    if (b.tipo === 'subseccion') texto.push(['h3', b.titulo])
    else if (b.tipo === 'destacado') texto.push(['entradilla', b.texto])
    else if (b.tipo === 'vineta') texto.push(['li', b.texto])
    else if (b.tipo === 'parrafo') texto.push(['p', b.texto])
  }
  return { tipo, nombreTipo: titulo.replace(`${tipo} - `, ''), dims, texto }
}

function leerInteligencia(bs) {
  const grafica = bs.find(b => b.tipo === 'grafica')
  const series = grafica ? grafica.items.map(it => ({ nombre: it.label, nivel: it.level, valor: it.value })) : []
  const defs = []
  const recomendaciones = []
  let nota = ''
  let actual = null
  for (const b of bs) {
    if (b.tipo === 'subsubtitulo') { actual = { titulo: b.texto, mide: '', interp: '' }; defs.push(actual) }
    else if (b.tipo === 'subseccion') actual = null
    else if (b.tipo === 'nota' && b.texto.startsWith('Nota importante')) nota = b.texto.replace(/^Nota importante:\s*/, '')
    else if (b.tipo === 'nota' && actual) actual.mide = b.texto
    else if (b.tipo === 'interpretacion' && actual) actual.interp = b.texto
    else if (b.tipo === 'vineta') recomendaciones.push(b.texto)
  }
  return { series, defs, recomendaciones, nota }
}

function leerRazonamiento(bs) {
  const dato = pre => {
    const b = bs.find(x => x.tipo === 'nota' && x.texto.startsWith(pre))
    return b ? b.texto.slice(pre.length).trim() : ''
  }
  const grafica = bs.find(b => b.tipo === 'grafica')
  const defs = (bs.find(b => b.tipo === 'definiciones') || { entradas: [] }).entradas
  return {
    sexo: dato('Sexo:'),
    nivel: dato('Nivel educativo:'),
    filas: grafica ? grafica.items.map(it => ({ nombre: it.label, nivel: it.level, valor: it.value })) : [],
    defs: Object.fromEntries(defs.map(d => [d.nombre, parrafosDe(d.definicion)]))
  }
}

// Aptitudes e intereses: la gráfica trae "34 (68%)" como texto a mostrar
function leerPuntajes(bs) {
  const grafica = bs.find(b => b.tipo === 'grafica')
  const defs = (bs.find(b => b.tipo === 'definiciones') || { entradas: [] }).entradas
  return {
    filas: grafica ? grafica.items.map(it => {
      const m = /\((\d+)%\)/.exec(it.displayValue || '')
      return { nombre: it.label, nivel: it.level, puntaje: it.value, pct: m ? Number(m[1]) : 0 }
    }) : [],
    defs: Object.fromEntries(defs.map(d => [d.nombre, parrafosDe(d.definicion)]))
  }
}

function leerPreferencias(bs) {
  const out = { preferencias: [], exploradas: [], defs: {}, areas: [] }
  const items = g => g.items.map(it => ({ nombre: it.label, valor: it.value }))
  let destino = null // a qué lista va la siguiente gráfica
  let area = null
  let grupo = null
  for (const b of bs) {
    if (b.tipo === 'subseccion') {
      grupo = null
      const m = /^(.+) \((\d+)%\)$/.exec(b.titulo)
      if (m) {
        area = { area: m[1], pct: Number(m[2]), subareas: [], grupos: [] }
        out.areas.push(area)
        destino = null
      } else {
        area = null
        destino = { 'Preferencia entre las áreas profesionales': 'preferencias', 'Áreas Vocacionales exploradas': 'exploradas' }[b.titulo] || null
      }
    } else if (b.tipo === 'grafica') {
      if (area) area.subareas = items(b)
      else if (destino) out[destino] = items(b)
    } else if (b.tipo === 'definiciones') {
      b.entradas.forEach(d => { out.defs[d.nombre] = parrafosDe(d.definicion) })
    } else if (b.tipo === 'subsubtitulo' && area) {
      const m = /^(.+) \((\d+)%\)$/.exec(b.texto)
      if (m) { grupo = { nombre: m[1], valor: Number(m[2]), carreras: [] }; area.grupos.push(grupo) }
    } else if (b.tipo === 'carrera' && grupo) {
      grupo.carreras.push(b.texto)
    }
  }
  return out
}

// ===== ARMADO DEL HTML =====
function caraFuente(archivo, peso, estilo) {
  const datos = fs.readFileSync(path.join(FUENTES, archivo)).toString('base64')
  return `  @font-face { font-family: "Arial Narrow"; src: url("data:font/ttf;base64,${datos}") format("truetype"); font-weight: ${peso}; font-style: ${estilo}; }\n`
}

function armarHTML(bloques) {
  const t = fs.readFileSync(PLANTILLA, 'utf8')
  const i0 = t.indexOf('<!-- ▼▼▼ INICIO CONTENIDO ▼▼▼ -->')
  const i1 = t.indexOf('<!-- ▲▲▲ FIN CONTENIDO ▲▲▲ -->')
  if (i0 < 0 || i1 < 0) throw new Error('La plantilla del reporte no tiene las marcas de contenido')
  let cabeza = t.slice(0, i0)
  const fijas = seccionesPlantilla(t.slice(i0, i1))
  const cola = t.slice(i1)

  const portada = bloques.find(b => b.tipo === 'portada')
  const { nombre, fecha } = portada
  const secs = porSeccion(bloques)
  const css = s => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

  // ---- cabeza: título, datos del encabezado/pie y letras incrustadas
  cabeza = cabeza.replace(/<title>[\s\S]*?<\/title>/, `<title>Reporte Vocacional — ${esc(nombre)}</title>`)
  cabeza = cabeza.replace(/--nombre-estudiante: ".*?";/, `--nombre-estudiante: "${css(nombre)}";`)
  cabeza = cabeza.replace(/--fecha-reporte: ".*?";/, `--fecha-reporte: "${css(fecha)}";`)
  const caras = '<style id="fuentes-locales">\n' +
    caraFuente('LiberationSansNarrow-Regular.ttf', '100 500', 'normal') +
    caraFuente('LiberationSansNarrow-Bold.ttf', '600 900', 'normal') +
    caraFuente('LiberationSansNarrow-Italic.ttf', '100 500', 'italic') +
    caraFuente('LiberationSansNarrow-BoldItalic.ttf', '600 900', 'italic') +
    '</style>'
  cabeza = cabeza.replace(/<link rel="preconnect"[^>]*>\s*/g, '')
  cabeza = cabeza.replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/, () => caras)

  const per = secs['Características de la Personalidad'] && leerPersonalidad(secs['Características de la Personalidad'])
  const intel = secs['Inteligencia'] && leerInteligencia(secs['Inteligencia'])
  const raz = secs['Razonamiento'] && leerRazonamiento(secs['Razonamiento'])
  const apt = secs['Aptitudes'] && leerPuntajes(secs['Aptitudes'])
  const inte = secs['Intereses'] && leerPuntajes(secs['Intereses'])
  const pu = secs['Preferencias Universitarias'] && leerPreferencias(secs['Preferencias Universitarias'])

  let H = '<!-- ▼▼▼ INICIO CONTENIDO ▼▼▼ -->\n\n'

  // ---- portada con el resumen de resultados
  const pr0 = pu && pu.preferencias[0]
  const apt0 = apt && apt.filas[0]
  const int0 = inte && inte.filas[0]
  const raz0 = raz && raz.filas[0]
  const tmax = intel && intel.series.length ? Math.max(...intel.series.map(s => s.valor)) : null
  H += '<section class="portada">\n  <div class="portada__logo img-logo" role="img" aria-label="APROVA — Asesoría Profesional en Orientación Vocacional"></div>\n\n' +
    '  <div class="portada__titulo">\n    <div class="portada__eyebrow">Reporte de Orientación Vocacional</div>\n' +
    `    <h1 class="portada__nombre">${esc(nombre)}</h1>\n    <div class="portada__fecha">Fecha del reporte: <strong>${esc(fecha)}</strong></div>\n  </div>\n\n` +
    '  <div class="portada__resumen">\n    <div class="portada__resumen-titulo">Resumen de resultados</div>\n    <div class="tarjetas">\n'
  H += tarjeta('Tipo de personalidad', per ? per.tipo : '—', per ? per.nombreTipo : 'Sin resultado')
  H += tarjeta('Área profesional preferida', pr0 ? `${pr0.valor}%` : '—', pr0 ? pr0.nombre : 'Sin resultado')
  H += tarjeta('Aptitud más alta', apt0 ? `${apt0.pct}%` : '—', apt0 ? `${apt0.nombre} · ${apt0.nivel}` : 'Sin resultado')
  H += tarjeta('Interés más alto', int0 ? `${int0.pct}%` : '—', int0 ? `${int0.nombre} · ${int0.nivel}` : 'Sin resultado')
  H += tarjeta('Razonamiento más alto', raz0 ? raz0.valor : '—', raz0 ? `${raz0.nombre} · ${raz0.nivel}` : 'Sin resultado')
  H += tarjeta('Inteligencia: puntaje más alto', tmax ?? '—',
    tmax != null ? intel.series.filter(s => s.valor === tmax).map(s => s.nombre.replace(/^[IVX]+\.\s*/, '')).join(' · ') : 'Sin resultado')
  H += '    </div>\n  </div>\n\n  <div class="portada__pie">\n    <span>APROVA · Asesoría Profesional en Orientación Vocacional</span>\n' +
    '    <span>Reporte de Orientación Vocacional</span>\n  </div>\n</section>\n\n<main class="contenido">\n\n'

  // ---- 01 y 02: texto fijo de la plantilla (el nombre va en el objetivo)
  H += fijas['01']
  H += fijas['02'].replace(/<strong>[^<]*<\/strong>/g, `<strong>${esc(nombre)}</strong>`)

  // Las pruebas se numeran según las que trae el reporte
  let nPrueba = 0
  const prueba = titulo => cabecera(`Prueba ${++nPrueba}`, titulo)

  // ---- personalidad
  if (per) {
    H += prueba('Características de la Personalidad')
    H += `  <div class="tipo">\n    <div class="tipo__codigo">${esc(per.tipo)}</div>\n    <div>\n` +
      `      <div class="tipo__nombre">${esc(per.tipo)} - ${esc(per.nombreTipo)}</div>\n` +
      '      <div class="tipo__sub">Tipo de personalidad</div>\n    </div>\n  </div>\n\n  <div class="dicotomias">\n'
    for (const d of per.dims) {
      const da = d.dominante === d.polo1 ? ' es-dominante' : ''
      const db = d.dominante === d.polo2 ? ' es-dominante' : ''
      H += `    <div class="dico">\n      <span class="dico__lado${da}">${POLO[d.polo1]} (${d.polo1})</span><span class="dico__pct dico__pct--izq">${d.pct1}%</span>\n` +
        `      <span class="dico__barra" style="--pct:${d.pct1}"><i></i></span>\n` +
        `      <span class="dico__pct">${100 - d.pct1}%</span><span class="dico__lado${db}">${POLO[d.polo2]} (${d.polo2})</span>\n` +
        `      <span class="dico__dom">Dominante: ${esc(d.dominante)}</span>\n    </div>\n`
    }
    H += '  </div>\n\n'
    let lista = false
    for (const [tipo, txt] of per.texto) {
      if (tipo !== 'li' && lista) { H += '  </ul>\n'; lista = false }
      if (tipo === 'li') {
        if (!lista) { H += '  <ul class="lista">\n'; lista = true }
        H += `    <li>${esc(txt)}</li>\n`
      } else if (tipo === 'entradilla') H += `  <p class="entradilla">${esc(txt)}</p>\n`
      else if (tipo === 'h3') H += `\n  <h3>${esc(txt)}</h3>\n`
      else H += `  <p>${esc(txt)}</p>\n`
    }
    if (lista) H += '  </ul>\n'
    H += '</section>\n\n'
  }

  // ---- inteligencia (escala 0–30)
  if (intel) {
    H += prueba('Inteligencia')
    H += '  <h3 style="margin-top:0">Perfil de Inteligencia</h3>\n  <table class="datos">\n    <thead>\n' +
      '      <tr><th>Área</th><th class="num">Puntaje</th><th class="col-barra">Escala (0–30)</th><th class="col-nivel">Nivel</th></tr>\n' +
      '    </thead>\n    <tbody>\n'
    for (const s of intel.series) {
      H += fila(td(esc(s.nombre), 'concepto'), td(s.valor, 'num'), td(barra(s.valor * 100 / 30)), td(nivel(s.nivel)))
    }
    H += '    </tbody>\n  </table>\n\n'
    for (const d of intel.defs) {
      H += `  <div class="def">\n    <h4>${esc(d.titulo)}</h4>\n`
      if (d.mide) H += `    <p class="que-mide">${esc(d.mide)}</p>\n`
      if (d.interp) H += `    <p class="interpretacion"><strong>Interpretación:</strong> ${esc(d.interp)}</p>\n`
      H += '  </div>\n'
    }
    H += '\n  <div class="bloque bloque-titulado">\n    <h3 style="margin-top:20pt">Recomendaciones Generales</h3>\n    <ul class="lista">\n'
    H += intel.recomendaciones.map(x => `      <li>${esc(x)}</li>\n`).join('')
    H += '    </ul>\n'
    if (intel.nota) H += `    <p class="nota"><strong>Nota importante:</strong> ${esc(intel.nota)}</p>\n`
    H += '  </div>\n</section>\n\n'
  }

  // ---- razonamiento
  if (raz) {
    H += prueba('Razonamiento')
    H += `  <div class="ficha">\n    <div><span>Sexo:</span><strong>${esc(raz.sexo)}</strong></div>\n` +
      `    <div><span>Nivel educativo:</span><strong>${esc(raz.nivel)}</strong></div>\n  </div>\n\n`
    H += '  <table class="datos">\n    <thead>\n      <tr><th>Prueba</th><th class="num">Puntaje</th><th class="col-barra">Escala (0–100)</th>' +
      '<th class="col-nivel">Nivel</th></tr>\n    </thead>\n    <tbody>\n'
    for (const f of raz.filas) H += fila(td(esc(f.nombre), 'concepto'), td(f.valor, 'num'), td(barra(f.valor)), td(nivel(f.nivel)))
    H += '    </tbody>\n  </table>\n\n  <h3>Qué mide cada apartado</h3>\n'
    for (const f of raz.filas) {
      const ps = raz.defs[f.nombre]
      if (!ps || !ps.length) continue
      H += `  <div class="def">\n    <h4>${esc(f.nombre)}</h4>\n    <p class="que-mide">Puntaje: ${f.valor} · ${esc(f.nivel)}</p>\n` +
        ps.map(p => `    <p>${esc(p)}</p>\n`).join('') + '  </div>\n'
    }
    H += '</section>\n\n'
  }

  // ---- aptitudes e intereses
  for (const [titulo, col, datos, h3] of [
    ['Aptitudes', 'Aptitud', apt, 'Qué mide cada aptitud'],
    ['Intereses', 'Interés', inte, 'Qué mide cada interés']
  ]) {
    if (!datos) continue
    H += prueba(titulo)
    H += `  <table class="datos">\n    <thead>\n      <tr><th>${col}</th><th class="num">Puntaje</th><th class="num">%</th>` +
      '<th class="col-barra">Escala</th><th class="col-nivel">Nivel</th></tr>\n    </thead>\n    <tbody>\n'
    for (const f of datos.filas) {
      H += fila(td(esc(f.nombre), 'concepto'), td(f.puntaje, 'num'), td(`${f.pct}%`, 'num'), td(barra(f.pct)), td(nivel(f.nivel)))
    }
    H += `    </tbody>\n  </table>\n\n  <h3>${h3}</h3>\n`
    for (const f of datos.filas) {
      const ps = datos.defs[f.nombre]
      if (!ps || !ps.length) continue
      H += `  <div class="def">\n    <h4>${esc(f.nombre)}</h4>\n    <p class="que-mide">Puntaje: ${f.puntaje} (${f.pct}%) · ${esc(f.nivel)}</p>\n` +
        ps.map(p => `    <p>${esc(p)}</p>\n`).join('') + '  </div>\n'
    }
    H += '</section>\n\n'
  }

  // ---- preferencias universitarias y áreas exploradas con sus carreras
  if (pu) {
    const tablaPct = (encabezado, filas) =>
      `  <table class="datos">\n    <thead>\n      <tr><th>${encabezado}</th><th class="num">%</th><th class="col-barra" style="width:55%">Escala</th></tr>\n    </thead>\n    <tbody>\n` +
      filas.map(f => fila(td(esc(f.nombre), 'concepto'), td(`${f.valor}%`, 'num'), td(barra(f.valor)))).join('') +
      '    </tbody>\n  </table>\n\n'
    H += prueba('Preferencias Universitarias')
    H += '  <h3 style="margin-top:0">Preferencia entre las áreas profesionales</h3>\n' + tablaPct('Área profesional', pu.preferencias)
    H += '  <h3>Áreas Vocacionales exploradas</h3>\n' + tablaPct('Área vocacional', pu.exploradas)
    H += '  <h3>Qué comprende cada área profesional</h3>\n'
    for (const n of AREAS_PROF) {
      const ps = pu.defs[n]
      if (!ps || !ps.length) continue
      H += `  <div class="def">\n    <h4>${esc(n)}</h4>\n` + ps.map(p => `    <p>${esc(p)}</p>\n`).join('') + '  </div>\n'
    }
    for (const A of pu.areas) {
      H += `\n  <div class="area">\n    <div class="area__cabecera"><h3>${esc(A.area)}</h3><span class="area__pct">${A.pct}%</span></div>\n` +
        '    <h4 style="margin-top:0">Puntuación por subárea</h4>\n    <table class="datos">\n' +
        '      <thead><tr><th>Subárea</th><th class="num">%</th><th class="col-barra" style="width:55%">Escala</th></tr></thead>\n      <tbody>\n'
      H += A.subareas.map(f => '  ' + fila(td(esc(f.nombre), 'concepto'), td(`${f.valor}%`, 'num'), td(barra(f.valor)))).join('')
      H += '      </tbody>\n    </table>\n\n    <h4>Carreras afines (subáreas más altas)</h4>\n'
      for (const g of A.grupos) {
        H += `    <div class="grupo-carreras">\n      <h4>${esc(g.nombre)} <span>${g.valor}%</span></h4>\n      <ul class="carreras">\n` +
          g.carreras.map(c => `        <li>${esc(c)}</li>\n`).join('') + '      </ul>\n    </div>\n'
      }
      H += '  </div>\n'
    }
    H += '</section>\n\n'
  }

  // ---- guías e infografía: texto fijo de la plantilla
  for (const k of ['09', '10', '11', '12', '13', '14']) H += fijas[k].replace('</main>', '')
  H += '</main>\n\n'
  H += fijas['CONTRAPORTADA'].replace(/(<div class="contraportada__fecha">)[^<]*(<\/div>)/, (m, a, b) => a + esc(fecha) + b) + '\n'

  return cabeza + H + cola
}

// ===== IMPRESIÓN A PDF =====
function rutaNavegador() {
  // Lo que nixpacks instala queda en el PATH; se busca ahí además de las rutas fijas
  const enPath = (process.env.PATH || '').split(path.delimiter).map(d => path.join(d, 'chromium'))
  const ruta = [...NAVEGADORES, ...enPath].find(r => r && fs.existsSync(r))
  if (!ruta) throw new Error('No se encontró Chromium, Edge ni Chrome para generar el reporte con diseño')
  return ruta
}

async function htmlAPdf(html) {
  // Se carga solo cuando se usa: el resto del servidor no depende de Chromium
  const puppeteer = require('puppeteer-core')
  const navegador = await puppeteer.launch({
    executablePath: rutaNavegador(),
    headless: true,
    // En el contenedor de Railway el proceso corre como root y /dev/shm es pequeño
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-first-run']
  })
  try {
    const pagina = await navegador.newPage()
    await pagina.setContent(html, { waitUntil: 'load', timeout: 60000 })
    await pagina.evaluate(() => document.fonts.ready)
    // Tamaño carta, márgenes, encabezado y pie los define el @page de la plantilla
    const pdf = await pagina.pdf({ preferCSSPageSize: true, printBackground: true, timeout: 120000 })
    return Buffer.from(pdf)
  } finally {
    await navegador.close()
  }
}

async function generarReporteDiseno(datos) {
  return htmlAPdf(armarHTML(construirBloques(datos)))
}

module.exports = { generarReporteDiseno, armarHTML }
