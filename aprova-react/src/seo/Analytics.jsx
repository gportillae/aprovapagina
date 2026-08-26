import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Google Analytics 4.
//
// El ID sale de VITE_GA_MEASUREMENT_ID. Si no está definida, este componente no
// hace absolutamente nada: así en desarrollo no se ensucian las estadísticas y el
// sitio funciona igual aunque nunca se configure Analytics.
//
// Ojo con dos cosas propias de un SPA:
//   1. El script se carga una sola vez, no en cada cambio de ruta.
//   2. GA solo cuenta la visita inicial por su cuenta. Como aquí la navegación no
//      recarga la página, las vistas se envían a mano en cada cambio de ruta y se
//      desactiva la automática (send_page_view: false) para no contar dos veces
//      la primera página.

const ID = import.meta.env.VITE_GA_MEASUREMENT_ID

let scriptCargado = false

function cargarGtag() {
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`
  document.head.appendChild(s)

  window.dataLayer = window.dataLayer || []
  // gtag tiene que usar `arguments`, no rest params: así lo espera la librería.
  window.gtag = function () {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', ID, { send_page_view: false })
}

function Analytics() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    if (!ID) return

    if (!scriptCargado) {
      cargarGtag()
      scriptCargado = true
    }

    // Va después del efecto de <Seo>, que ya dejó el document.title de esta ruta.
    window.gtag('event', 'page_view', {
      page_path: pathname + search,
      page_location: window.location.href,
      page_title: document.title
    })
  }, [pathname, search])

  return null
}

export default Analytics
