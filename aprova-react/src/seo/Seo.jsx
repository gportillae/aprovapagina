import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SITE, getMeta, canonicalDe, jsonLdDe } from './siteMeta'

// Mantiene el <head> sincronizado al navegar dentro del SPA.
//
// Actualiza el head de forma imperativa en vez de renderizar <title>/<meta> en el
// árbol. Es a propósito: el HTML que sirve el servidor ya trae esas etiquetas
// puestas por scripts/prerender.js, así que si además las renderizara React
// acabarían duplicadas en la página. Aquí se reescriben las que ya existen.
//
// Este componente no pinta nada; solo la primera carga la resuelve el prerender
// y las navegaciones posteriores las resuelve este efecto.

/** Crea la etiqueta si no existe y le fija el contenido. */
function fijarMeta(selector, atributos, contenido) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    for (const [k, v] of Object.entries(atributos)) el.setAttribute(k, v)
    document.head.appendChild(el)
  }
  el.setAttribute('content', contenido)
}

function fijarCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function fijarJsonLd(datos) {
  let el = document.getElementById('aprova-jsonld')
  if (!el) {
    el = document.createElement('script')
    el.id = 'aprova-jsonld'
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(datos)
}

function Seo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = getMeta(pathname)
    const canonical = canonicalDe(pathname)

    document.title = meta.title
    fijarCanonical(canonical)
    fijarMeta('meta[name="description"]', { name: 'description' }, meta.description)
    fijarMeta(
      'meta[name="robots"]',
      { name: 'robots' },
      meta.noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    )

    fijarMeta('meta[property="og:title"]', { property: 'og:title' }, meta.title)
    fijarMeta('meta[property="og:description"]', { property: 'og:description' }, meta.description)
    fijarMeta('meta[property="og:url"]', { property: 'og:url' }, canonical)
    fijarMeta('meta[property="og:image"]', { property: 'og:image' }, SITE.imagenSocial)
    fijarMeta('meta[property="og:type"]', { property: 'og:type' }, 'website')
    fijarMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, SITE.nombre)

    fijarMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image')
    fijarMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, meta.title)
    fijarMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, meta.description)
    fijarMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, SITE.imagenSocial)

    fijarJsonLd(jsonLdDe(pathname))
  }, [pathname])

  return null
}

export default Seo
