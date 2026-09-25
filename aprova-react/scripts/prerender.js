// Prerenderiza las páginas públicas a HTML estático después del build.
//
// Por qué: la web es un SPA que se pinta con JavaScript. Googlebot sí ejecuta JS,
// pero lo hace en una segunda pasada y con retraso; y los crawlers de los motores
// de respuesta (GPTBot y OAI-SearchBot de ChatGPT, PerplexityBot, ClaudeBot)
// directamente NO ejecutan JavaScript: sin esto ven una página en blanco.
//
// Genera, a partir del build de Vite:
//   dist/index.html        -> portada ya renderizada
//   dist/servicios.html    -> una por cada ruta pública (el server las sirve sin
//   dist/contacto.html        redirección gracias a `extensions: ['html']`)
//   ...
//   dist/app.html          -> cascarón vacío con noindex para las rutas privadas
//   dist/sitemap.xml
//   dist/llms.txt

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { render } from '../dist-ssr/entry-server.js'
import {
  SITE,
  PRECIOS,
  FAQS,
  RUTAS,
  CASCARON,
  canonicalDe,
  jsonLdDe
} from '../src/seo/siteMeta.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.resolve(__dirname, '..', 'dist')

const MARCA_INICIO = '<!--seo-inicio-->'
const MARCA_FIN = '<!--seo-fin-->'

const escapar = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Bloque completo de <head> para una ruta (o para el cascarón). */
function construirHead(meta) {
  const robots = meta.noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

  const etiquetas = [
    `<title>${escapar(meta.title)}</title>`,
    `<meta name="description" content="${escapar(meta.description)}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<meta name="author" content="${escapar(SITE.nombre)}" />`,
    `<meta name="geo.region" content="MX-AGU" />`,
    `<meta name="geo.placename" content="Aguascalientes" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapar(SITE.nombre)}" />`,
    `<meta property="og:locale" content="es_MX" />`,
    `<meta property="og:title" content="${escapar(meta.title)}" />`,
    `<meta property="og:description" content="${escapar(meta.description)}" />`,
    `<meta property="og:image" content="${SITE.imagenSocial}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapar(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapar(meta.description)}" />`,
    `<meta name="twitter:image" content="${SITE.imagenSocial}" />`
  ]

  // El cascarón cubre varias rutas privadas a la vez, así que no le corresponde
  // ninguna URL concreta: sin canonical ni JSON-LD.
  if (!meta.noindex) {
    const canonical = canonicalDe(meta.path)
    etiquetas.splice(2, 0, `<link rel="canonical" href="${canonical}" />`)
    etiquetas.push(`<meta property="og:url" content="${canonical}" />`)
    // El JSON-LD va escapado para que un `</script>` dentro de un texto no rompa el HTML.
    const jsonLd = JSON.stringify(jsonLdDe(meta.path)).replace(/</g, '\\u003c')
    etiquetas.push(`<script type="application/ld+json" id="aprova-jsonld">${jsonLd}</script>`)
  }

  return etiquetas.join('\n    ')
}

/** Sustituye el bloque entre marcadores del index.html base. */
function inyectarHead(plantilla, meta) {
  const desde = plantilla.indexOf(MARCA_INICIO)
  const hasta = plantilla.indexOf(MARCA_FIN)
  if (desde === -1 || hasta === -1) {
    throw new Error(
      `No se encontraron los marcadores ${MARCA_INICIO} / ${MARCA_FIN} en index.html. ` +
        'El prerender no puede insertar las etiquetas SEO.'
    )
  }
  return (
    plantilla.slice(0, desde) +
    construirHead(meta) +
    plantilla.slice(hasta + MARCA_FIN.length)
  )
}

/** Mete el HTML renderizado dentro del contenedor #root. */
function inyectarCuerpo(html, contenido) {
  const contenedor = '<div id="root"></div>'
  if (!html.includes(contenedor)) {
    throw new Error('No se encontró <div id="root"></div> en index.html.')
  }
  return html.replace(contenedor, `<div id="root">${contenido}</div>`)
}

/** Nombre de archivo en dist para una ruta: "/" -> index.html, "/servicios" -> servicios.html */
const archivoDe = (pathname) => (pathname === '/' ? 'index.html' : `${pathname.slice(1)}.html`)

// ===== Generación =====

const plantilla = fs.readFileSync(path.join(dist, 'index.html'), 'utf-8')
const publicas = RUTAS.filter((r) => !r.noindex)

for (const ruta of publicas) {
  const html = inyectarCuerpo(inyectarHead(plantilla, ruta), render(ruta.path))
  fs.writeFileSync(path.join(dist, archivoDe(ruta.path)), html, 'utf-8')
  console.log(`  prerender  ${ruta.path.padEnd(14)} -> dist/${archivoDe(ruta.path)}`)
}

// Cascarón para las rutas privadas: sin contenido prerenderizado (dependen de
// localStorage y del usuario) y con noindex para que no entren al índice.
fs.writeFileSync(path.join(dist, 'app.html'), inyectarHead(plantilla, CASCARON), 'utf-8')
console.log('  prerender  (privadas)   -> dist/app.html')

// ===== sitemap.xml =====

const hoy = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicas
  .map(
    (r) => `  <url>
    <loc>${canonicalDe(r.path)}</loc>
    <lastmod>${hoy}</lastmod>
    <changefreq>${r.frecuencia}</changefreq>
    <priority>${r.prioridad}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap, 'utf-8')
console.log(`  sitemap    ${publicas.length} urls    -> dist/sitemap.xml`)

// ===== llms.txt =====
// Resumen en texto plano del negocio para los motores de respuesta. Se genera
// desde siteMeta.js para que precios y FAQ nunca queden desfasados del sitio.

const llms = `# APROVA — Orientación Vocacional

> APROVA es un servicio mexicano de orientación vocacional para estudiantes de
> preparatoria y universidad. Combina seis tests psicométricos en línea con
> asesoría personalizada para ayudar a elegir carrera universitaria.
> Sede en Aguascalientes, con especialistas en Guadalajara y Ciudad de México,
> y atención virtual en todo México.

## Datos de contacto
- Sitio web: ${SITE.url}
- Teléfono: ${SITE.telefonoLegible} (${SITE.telefono})
- WhatsApp: ${SITE.whatsapp}
- Correo: ${SITE.email}
- Ciudades: ${SITE.ciudades.join(', ')} y servicio virtual en todo México

## Servicios y precios (MXN)
- Modalidad 1 — $${PRECIOS.modalidad1.toLocaleString('es-MX')}: seis tests psicométricos en línea
  y perfil vocacional escrito enviado por correo.
- Modalidad 2 — $${PRECIOS.modalidad2.toLocaleString('es-MX')}: todo lo anterior más múltiples sesiones
  virtuales en vivo con un especialista, coaching personalizado de unas 12 horas
  y una sesión final con los padres de familia.

## Tests incluidos
1. Test de Inteligencia
2. Test de Aptitudes
3. Test de Intereses Ocupacionales
4. Áreas Vocacionales
5. Razonamiento
6. Test de Personalidad (16 tipos / MBTI)

## Páginas
${publicas.map((r) => `- [${r.title.split('|')[0].trim()}](${canonicalDe(r.path)}): ${r.description}`).join('\n')}

## Preguntas frecuentes
${FAQS.map((f) => `### ${f.question}\n${f.answer}`).join('\n\n')}
`
fs.writeFileSync(path.join(dist, 'llms.txt'), llms, 'utf-8')
console.log('  llms.txt                -> dist/llms.txt')
