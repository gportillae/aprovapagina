// Fuente única de verdad para el SEO del sitio.
//
// Este módulo lo consumen dos cosas:
//   1. El componente <Seo> del bundle de React (títulos correctos al navegar en el SPA).
//   2. scripts/prerender.js, que inyecta estas mismas etiquetas en el <head> del HTML
//      generado en el build. Eso es lo que leen los crawlers que NO ejecutan JavaScript
//      (GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot) y lo que Google indexa sin
//      esperar al render diferido.
//
// Si cambias un texto aquí, cambia en ambos lados a la vez.

export const SITE = {
  nombre: 'APROVA',
  nombreLargo: 'APROVA — Asesoría Profesional en Orientación Vocacional',
  url: 'https://aprovamx.com',
  idioma: 'es-MX',
  telefono: '+524499119192',
  telefonoLegible: '(449) 911 9192',
  email: 'contacto@aprovamx.com',
  whatsapp: 'https://wa.me/524499119192',
  logo: 'https://aprovamx.com/logo-aprova.png',
  // TODO: sustituir por una tarjeta social propia de 1200x630 px con texto legible.
  // Por ahora reutiliza el logo (1687x788, formato ancho válido para redes).
  imagenSocial: 'https://aprovamx.com/logo-aprova.png',
  ciudades: ['Aguascalientes', 'Guadalajara', 'Ciudad de México'],
  fundacion: '2014'
}

// Precios en pesos; deben coincidir con PRODUCTOS del backend (que los guarda en centavos).
export const PRECIOS = {
  modalidad1: 4000,
  modalidad2: 7000
}

// Las FAQ viven aquí para que la página /servicios y el JSON-LD de FAQPage
// no se puedan desincronizar: ambos leen este mismo arreglo.
export const FAQS = [
  {
    question: '¿Cuánto cuesta la orientación vocacional en APROVA?',
    answer:
      `La Modalidad 1 (solo tests psicométricos y perfil vocacional por correo) cuesta $${PRECIOS.modalidad1.toLocaleString('es-MX')} MXN. ` +
      `La Modalidad 2, que añade múltiples sesiones de asesoría virtual y coaching personalizado, cuesta $${PRECIOS.modalidad2.toLocaleString('es-MX')} MXN. ` +
      'Ambas incluyen las 6 evaluaciones psicométricas completas.'
  },
  {
    question: '¿Los resultados de los tests son confidenciales?',
    answer:
      'Sí. Solo tú y tu especialista APROVA tienen acceso a los resultados. Nunca se comparten con terceros ni con instituciones educativas.'
  },
  {
    question: '¿Qué tests psicométricos incluye el servicio?',
    answer:
      'Incluye 6 evaluaciones: Test de Inteligencia (Terman), Áreas Vocacionales, Razonamiento (DAT-5), Aptitudes, Intereses Ocupacionales y Test de Personalidad. Cada uno evalúa una dimensión diferente de tu perfil.'
  },
  {
    question: '¿Qué incluye la sesión con padres de familia?',
    answer:
      'En la Modalidad 2, la última sesión es un coaching para padres donde compartimos el resumen del proceso, entregamos el reporte escrito del perfil vocacional y resolvemos todas las inquietudes para que puedan apoyar la decisión en familia.'
  },
  {
    question: '¿Las sesiones virtuales son en vivo o grabadas?',
    answer:
      'Son sesiones en vivo por videoconferencia con tu especialista asignado. Se agendan en horarios convenientes para ti.'
  },
  {
    question: '¿Tienen servicio en Guadalajara y Ciudad de México?',
    answer:
      'Sí. Tenemos especialistas en Aguascalientes, Guadalajara y CDMX. La modalidad virtual está disponible desde cualquier lugar de México.'
  },
  {
    question: '¿A qué edad es recomendable hacer la orientación vocacional?',
    answer:
      'Idealmente en los últimos años de preparatoria, aunque también trabajamos con jóvenes que ya están en universidad y desean reorientar su carrera. Nunca es tarde para tomar una mejor decisión.'
  },
  {
    question: '¿Cuánto tiempo toma el proceso completo?',
    answer:
      'La Modalidad 1 (solo tests) se completa en 1-2 días. La Modalidad 2 es un proceso de aproximadamente 12 horas divididas en sesiones de 2 horas, distribuidas a lo largo de varias semanas según tu disponibilidad.'
  },
  {
    question: '¿Puedo hacer reembolso si no estoy satisfecho?',
    answer:
      'Puedes solicitar reembolso completo dentro de las primeras 48 horas después del pago, siempre que no hayas iniciado ningún test. Consulta nuestros Términos y Condiciones para más detalles.'
  },
  {
    question: '¿Los tests se hacen en línea o de forma presencial?',
    answer:
      'Los 6 tests psicométricos se responden en línea desde cualquier computadora, a tu propio ritmo y sin límite de días. Las sesiones de asesoría de la Modalidad 2 son virtuales por videoconferencia.'
  }
]

// ===== Entidades JSON-LD reutilizables =====
// Se referencian por @id desde cada página para formar un grafo coherente,
// que es lo que permite a Google y a los motores de respuesta entender
// que todas las páginas pertenecen al mismo negocio.

const ORG_ID = `${SITE.url}/#organizacion`
const WEBSITE_ID = `${SITE.url}/#sitio`

export const organizationJsonLd = {
  '@type': ['ProfessionalService', 'EducationalOrganization'],
  '@id': ORG_ID,
  name: SITE.nombre,
  legalName: SITE.nombreLargo,
  alternateName: 'APROVA Orientación Vocacional',
  url: SITE.url,
  logo: SITE.logo,
  image: SITE.imagenSocial,
  description:
    'APROVA ofrece orientación vocacional profesional para estudiantes de preparatoria y universidad en México, con tests psicométricos en línea y asesoría personalizada para elegir carrera.',
  telephone: SITE.telefono,
  email: SITE.email,
  foundingDate: SITE.fundacion,
  priceRange: `$${PRECIOS.modalidad1.toLocaleString('es-MX')} - $${PRECIOS.modalidad2.toLocaleString('es-MX')} MXN`,
  currenciesAccepted: 'MXN',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Aguascalientes',
    addressRegion: 'Aguascalientes',
    addressCountry: 'MX'
  },
  areaServed: [
    ...SITE.ciudades.map((ciudad) => ({ '@type': 'City', name: ciudad })),
    { '@type': 'Country', name: 'México' }
  ],
  knowsAbout: [
    'Orientación vocacional',
    'Tests psicométricos',
    'Elección de carrera universitaria',
    'Test de personalidad MBTI',
    'Test de inteligencia Terman',
    'Test de razonamiento DAT-5',
    'Aptitudes e intereses profesionales',
    'Coaching educativo para adolescentes'
  ],
  sameAs: [SITE.whatsapp],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: SITE.telefono,
    email: SITE.email,
    contactType: 'customer service',
    areaServed: 'MX',
    availableLanguage: ['Spanish', 'es-MX']
  }
}

export const websiteJsonLd = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: SITE.url,
  name: SITE.nombre,
  inLanguage: SITE.idioma,
  publisher: { '@id': ORG_ID }
}

const serviciosJsonLd = [
  {
    '@type': 'Service',
    '@id': `${SITE.url}/servicios#modalidad1`,
    name: 'Modalidad 1 — Tests psicométricos y perfil vocacional',
    serviceType: 'Orientación vocacional',
    description:
      'Seis tests psicométricos en línea (inteligencia, aptitudes, intereses, áreas vocacionales, razonamiento y personalidad) más un perfil vocacional escrito enviado por correo.',
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'México' },
    offers: {
      '@type': 'Offer',
      price: String(PRECIOS.modalidad1),
      priceCurrency: 'MXN',
      availability: 'https://schema.org/InStock',
      url: `${SITE.url}/servicios`
    }
  },
  {
    '@type': 'Service',
    '@id': `${SITE.url}/servicios#modalidad2`,
    name: 'Modalidad 2 — Tests, asesoría virtual y coaching',
    serviceType: 'Orientación vocacional con acompañamiento',
    description:
      'Todo lo de la Modalidad 1 más múltiples sesiones virtuales en vivo con un especialista, coaching personalizado de aproximadamente 12 horas y una sesión final con padres de familia.',
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'México' },
    offers: {
      '@type': 'Offer',
      price: String(PRECIOS.modalidad2),
      priceCurrency: 'MXN',
      availability: 'https://schema.org/InStock',
      url: `${SITE.url}/servicios`
    }
  }
]

const faqJsonLd = {
  '@type': 'FAQPage',
  '@id': `${SITE.url}/servicios#faq`,
  mainEntity: FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer }
  }))
}

// ===== Metadatos por ruta =====
// `noindex: true` en las rutas de la aplicación (pago, tests, acceso): son privadas,
// no aportan nada en búsqueda y diluirían el presupuesto de rastreo.

export const RUTAS = [
  {
    path: '/',
    title: 'Orientación Vocacional en México | Tests Psicométricos | APROVA',
    description:
      'Descubre qué carrera estudiar con 6 tests psicométricos en línea y asesoría personalizada. Orientación vocacional en Aguascalientes, Guadalajara, CDMX y todo México.',
    prioridad: '1.0',
    frecuencia: 'weekly',
    jsonLd: [...serviciosJsonLd]
  },
  {
    path: '/servicios',
    title: 'Precios y Servicios de Orientación Vocacional | APROVA',
    description:
      `Dos modalidades de orientación vocacional: solo tests psicométricos ($${PRECIOS.modalidad1.toLocaleString('es-MX')} MXN) o tests con asesoría virtual y coaching ($${PRECIOS.modalidad2.toLocaleString('es-MX')} MXN). Compara qué incluye cada una.`,
    prioridad: '0.9',
    frecuencia: 'weekly',
    jsonLd: [...serviciosJsonLd, faqJsonLd]
  },
  {
    path: '/contenido',
    title: 'Cómo Elegir Carrera y Universidad: Guía Práctica | APROVA',
    description:
      'Guía gratuita para elegir universidad: nivel académico, costos y becas, admisión, bolsa de trabajo, hábitos de estudio y consejos para tu transición a la vida universitaria.',
    prioridad: '0.8',
    frecuencia: 'monthly'
  },
  {
    path: '/testimonios',
    title: 'Testimonios de Estudiantes | Orientación Vocacional APROVA',
    description:
      'Historias reales de estudiantes y padres de familia que eligieron carrera con APROVA. Conoce sus experiencias con nuestros tests psicométricos y asesoría vocacional.',
    prioridad: '0.7',
    frecuencia: 'monthly'
  },
  {
    path: '/contacto',
    title: 'Contacto | Orientación Vocacional en Aguascalientes, GDL y CDMX',
    description:
      'Escríbenos por WhatsApp, teléfono o formulario y te respondemos en menos de 24 horas. Especialistas en orientación vocacional en Aguascalientes, Guadalajara y CDMX.',
    prioridad: '0.8',
    frecuencia: 'monthly'
  },
  {
    path: '/privacidad',
    title: 'Aviso de Privacidad | APROVA',
    description:
      'Cómo APROVA recaba, usa y protege los datos personales y los resultados de los tests psicométricos de sus usuarios.',
    prioridad: '0.3',
    frecuencia: 'yearly'
  },
  {
    path: '/terminos',
    title: 'Términos y Condiciones | APROVA',
    description:
      'Términos y condiciones del servicio de orientación vocacional de APROVA, incluyendo pagos, política de reembolso y uso de la plataforma de tests.',
    prioridad: '0.3',
    frecuencia: 'yearly'
  },

  // Rutas privadas de la aplicación: fuera del índice y fuera del sitemap.
  { path: '/tests', title: 'Mis tests | APROVA', description: 'Área privada para responder los tests psicométricos de APROVA.', noindex: true },
  { path: '/pago', title: 'Pago | APROVA', description: 'Página de pago de APROVA.', noindex: true },
  { path: '/pago-exitoso', title: 'Pago confirmado | APROVA', description: 'Confirmación de pago de APROVA.', noindex: true },
  { path: '/acceso', title: 'Recuperar mi acceso | APROVA', description: 'Recupera el acceso a tus tests con el correo que usaste al pagar.', noindex: true }
]

// Metadatos del cascarón (dist/app.html) que se sirve en las rutas privadas.
// Título neutro porque ese mismo archivo cubre /tests, /pago y /acceso; el
// título definitivo lo pone <Seo> al hidratar.
export const CASCARON = {
  path: '/app',
  title: 'APROVA — Orientación Vocacional',
  description: 'Área privada de APROVA.',
  noindex: true
}

const RUTA_POR_DEFECTO = RUTAS[0]

/** Metadatos de una ruta; cae en la portada si la ruta no está registrada. */
export function getMeta(pathname) {
  const limpio = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return RUTAS.find((r) => r.path === limpio) || RUTA_POR_DEFECTO
}

/** URL canónica absoluta y sin barra final (salvo la raíz). */
export function canonicalDe(pathname) {
  const limpio = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return limpio === '/' ? `${SITE.url}/` : `${SITE.url}${limpio}`
}

/** Grafo JSON-LD completo de una ruta: entidades globales + las propias de la página. */
export function jsonLdDe(pathname) {
  const meta = getMeta(pathname)
  const canonical = canonicalDe(pathname)

  const pagina = {
    '@type': 'WebPage',
    '@id': `${canonical}#pagina`,
    url: canonical,
    name: meta.title,
    description: meta.description,
    inLanguage: SITE.idioma,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID }
  }

  const migas =
    meta.path === '/'
      ? []
      : [
          {
            '@type': 'BreadcrumbList',
            '@id': `${canonical}#migas`,
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE.url}/` },
              { '@type': 'ListItem', position: 2, name: meta.title.split('|')[0].trim(), item: canonical }
            ]
          }
        ]

  return {
    '@context': 'https://schema.org',
    '@graph': [organizationJsonLd, websiteJsonLd, pagina, ...migas, ...(meta.jsonLd || [])]
  }
}
