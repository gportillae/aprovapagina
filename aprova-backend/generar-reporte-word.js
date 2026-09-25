// Renderiza a Word (.docx) el contenido que arma reporte-contenido.js.
// Comparte estructura con generar-reporte.js (PDF): ambos consumen los mismos
// bloques, así que una sección nueva aparece en los dos formatos sin tocar nada aquí.
//
// El formato (tipografía, tamaños, viñetas, justificación, interlineado) replica un
// reporte que se corrigió a mano en Word sobre uno generado por este archivo. La
// muestra no vive en el repo (lleva datos de una alumna): está en la carpeta de
// expedientes, como "Reporte_Vocacional_..._corregido.docx". Si se vuelve a ajustar
// el formato en Word, ese tipo de archivo es la muestra a comparar.
const path = require('path')
const fs = require('fs')
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, PageBreak, VerticalAlign,
  SectionType, Footer, PageNumber, LevelFormat
} = require('docx')
const { construirBloques, COLORS } = require('./reporte-contenido')

// docx quiere el color sin '#'
const hex = c => String(c || '').replace('#', '')

// ===== FORMATO =====
const FUENTE = 'Arial Narrow'
// Tamaños en puntos. El cuerpo va en 10: con Arial Narrow el reporte queda
// compacto sin perder legibilidad.
const TAM = {
  cuerpo: 10,
  seccion: 14,      // título que abre página, con línea inferior
  subseccion: 11,   // "Qué mide cada aptitud", "Biológicas (57%)"
  subsubtitulo: 11, // "Ambientalista (63%)"
  definicion: 11    // nombre de cada definición; el texto va en tamaño de cuerpo
}
// Interlineado 1.15 (Word mide en 1/240 de línea)
const INTERLINEADO = 276
// Viñetas: la normal para las listas de texto, la compacta para las carreras,
// que van a dos columnas y necesitan la sangría mínima.
const VINETA_NORMAL = 'vineta-normal'
const VINETA_CARRERA = 'vineta-carrera'

// Página A4 (lo que Word usa por omisión en estos reportes) con márgenes de 1".
const MARGENES = { top: 1440, right: 1440, bottom: 1440, left: 1440 }
const PAGINA = { size: { width: 11906, height: 16838 }, margin: MARGENES }
// Ancho útil de la A4 con esos márgenes, en twips: 11906 - 2*1440.
const ANCHO_UTIL = 9026

const SIN_BORDES = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
}

function celda(hijos, ancho, relleno) {
  return new TableCell({
    children: hijos,
    width: { size: ancho, type: WidthType.DXA },
    borders: SIN_BORDES,
    shading: relleno ? { fill: hex(relleno) } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 20, bottom: 20, left: 40, right: 40 }
  })
}

function tablaSinBordes(filas) {
  return new Table({
    rows: filas,
    width: { size: ANCHO_UTIL, type: WidthType.DXA },
    borders: SIN_BORDES,
    layout: 'fixed'
  })
}

// Una barra es una tabla de dos celdas: la rellena y el resto en gris claro.
// Es la forma nativa de dibujar barras en Word, sin imágenes.
function barra(proporcion, color, anchoTotal) {
  const p = Math.max(0, Math.min(1, proporcion))
  const lleno = Math.max(30, Math.round(p * anchoTotal))
  const vacio = Math.max(1, anchoTotal - lleno)
  const vacio2 = new Paragraph({ children: [new TextRun({ text: '', size: 12 })] })

  return new Table({
    rows: [new TableRow({
      children: [
        celda([new Paragraph({ children: [new TextRun({ text: '', size: 12 })] })], lleno, color || COLORS.primary),
        celda([vacio2], vacio, '#F1F1F5')
      ]
    })],
    width: { size: anchoTotal, type: WidthType.DXA },
    borders: SIN_BORDES,
    layout: 'fixed'
  })
}

function parrafoTexto(texto, opciones = {}) {
  return new Paragraph({
    alignment: opciones.alineacion,
    spacing: { after: opciones.despues != null ? opciones.despues : 120, line: INTERLINEADO },
    indent: opciones.sangria ? { left: opciones.sangria } : undefined,
    children: [new TextRun({
      text: texto,
      bold: opciones.negrita,
      size: (opciones.tamano || TAM.cuerpo) * 2, // docx usa medios puntos
      color: hex(opciones.color || COLORS.text),
      font: FUENTE
    })]
  })
}

// Los textos fijos del reporte traen varios párrafos separados por línea en
// blanco. Word no interpreta el \n: si se manda todo en un solo TextRun queda
// pegado en un bloque ilegible, así que aquí se convierten en párrafos reales.
// Reglas: una línea en blanco cierra el párrafo, un salto simple se une con
// espacio, y una línea que ya viene con viñeta escrita ("• …", como en los
// textos de asesoría) se convierte en viñeta real de Word: se le quita el
// carácter y se numera como lista, para que sangre y se alinee igual que las
// demás listas del reporte.
function parrafosDeTexto(texto, opciones = {}) {
  const salida = []
  let actual = []
  const cerrar = () => {
    const t = actual.join(' ').trim()
    if (t) salida.push(parrafoTexto(t, opciones))
    actual = []
  }

  String(texto).split('\n').forEach(linea => {
    const l = linea.trim()
    if (!l) return cerrar()
    const esVineta = /^[•·]\s*/.test(l)
    if (esVineta) {
      cerrar()
      salida.push(parrafoVineta(l.replace(/^[•·]\s*/, ''), {
        tamano: opciones.tamano,
        color: opciones.color,
        alineacion: opciones.alineacion,
        despues: 60
      }))
      return
    }
    actual.push(l)
  })
  cerrar()

  return salida
}

function parrafoVineta(texto, opciones = {}) {
  return new Paragraph({
    numbering: { reference: opciones.referencia || VINETA_NORMAL, level: 0 },
    alignment: opciones.alineacion,
    spacing: {
      after: opciones.despues != null ? opciones.despues : 60,
      line: opciones.interlineado === false ? undefined : INTERLINEADO
    },
    children: [new TextRun({
      text: texto,
      size: (opciones.tamano || TAM.cuerpo) * 2,
      color: hex(opciones.color || COLORS.text),
      font: FUENTE
    })]
  })
}

// ===== BLOQUES =====
function bloqueGrafica(bloque) {
  const anchoEtiqueta = 3200
  const anchoBarra = 4600
  const anchoValor = ANCHO_UTIL - anchoEtiqueta - anchoBarra

  const filas = bloque.items.map(item => new TableRow({
    children: [
      celda([
        parrafoTexto(item.label, { tamano: 9, negrita: true, despues: 0 }),
        ...(item.level ? [parrafoTexto(item.level, { tamano: 8, color: COLORS.textSecondary, despues: 0 })] : [])
      ], anchoEtiqueta),
      celda([barra(item.value / bloque.maxValue, item.color, anchoBarra - 200)], anchoBarra),
      celda([parrafoTexto(item.displayValue || String(item.value), { tamano: 8, despues: 0 })], anchoValor)
    ]
  }))

  return [tablaSinBordes(filas), parrafoTexto('', { despues: 160 })]
}

function bloqueDimensiones(bloque) {
  const salida = []
  bloque.filas.forEach(fila => {
    salida.push(parrafoTexto(fila.etiqueta, {
      tamano: TAM.cuerpo, negrita: true, alineacion: AlignmentType.CENTER, despues: 40
    }))
    // Barra bicolor centrada: el polo dominante en color primario
    const ancho = 5000
    const lleno = Math.max(30, Math.round((fila.pct1 / 100) * ancho))
    salida.push(new Table({
      rows: [new TableRow({
        children: [
          celda([new Paragraph({ children: [new TextRun({ text: '', size: 12 })] })], lleno, COLORS.primary),
          celda([new Paragraph({ children: [new TextRun({ text: '', size: 12 })] })], Math.max(1, ancho - lleno), COLORS.primaryLight)
        ]
      })],
      width: { size: ancho, type: WidthType.DXA },
      alignment: AlignmentType.CENTER,
      borders: SIN_BORDES,
      layout: 'fixed'
    }))
    salida.push(parrafoTexto('', { despues: 100 }))
  })
  return salida
}

function bloqueDefiniciones(bloque) {
  const salida = []
  bloque.entradas.forEach(({ nombre, definicion }) => {
    if (!definicion) return
    salida.push(parrafoTexto(nombre, {
      tamano: TAM.definicion, negrita: true, alineacion: AlignmentType.JUSTIFIED, despues: 40
    }))
    salida.push(...parrafosDeTexto(definicion, {
      alineacion: AlignmentType.JUSTIFIED, despues: 160
    }))
  })
  return salida
}

function bloquePortada(bloque) {
  const salida = [
    parrafoTexto('', { despues: 2400 }),
    parrafoTexto(bloque.nombre, {
      tamano: 30, negrita: true, color: COLORS.primaryDark,
      alineacion: AlignmentType.CENTER, despues: 240
    }),
    parrafoTexto('Reporte de Orientación Vocacional', {
      tamano: 16, color: COLORS.primary, alineacion: AlignmentType.CENTER, despues: 600
    })
  ]

  const logo = path.join(__dirname, 'logo-aprova.png')
  if (fs.existsSync(logo)) {
    salida.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [new ImageRun({
        data: fs.readFileSync(logo),
        transformation: { width: 320, height: 150 },
        type: 'png'
      })]
    }))
  }

  salida.push(parrafoTexto(bloque.fecha, {
    tamano: 12, color: COLORS.textSecondary, alineacion: AlignmentType.CENTER
  }))
  return salida
}

function bloqueCierre(bloque) {
  return [
    new Paragraph({ children: [new PageBreak()] }),
    parrafoTexto('', { despues: 2400 }),
    parrafoTexto('APROVA', {
      tamano: 24, negrita: true, color: COLORS.primaryDark,
      alineacion: AlignmentType.CENTER, despues: 200
    }),
    parrafoTexto('Orientación Vocacional', {
      tamano: 14, color: COLORS.primary, alineacion: AlignmentType.CENTER, despues: 400
    }),
    parrafoTexto('Este reporte fue generado automáticamente por el sistema APROVA.', {
      tamano: 11, color: COLORS.textSecondary, alineacion: AlignmentType.CENTER, despues: 80
    }),
    parrafoTexto('Los resultados deben ser interpretados por un profesional calificado.', {
      tamano: 11, color: COLORS.textSecondary, alineacion: AlignmentType.CENTER, despues: 400
    }),
    parrafoTexto(bloque.fecha, {
      tamano: 11, color: COLORS.textSecondary, alineacion: AlignmentType.CENTER
    })
  ]
}

function bloqueImagenPagina(bloque) {
  if (!fs.existsSync(bloque.ruta)) return []
  return [
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new ImageRun({
        data: fs.readFileSync(bloque.ruta),
        transformation: { width: 560, height: 700 },
        type: 'jpg'
      })]
    })
  ]
}

// Número de página, abajo a la derecha.
function pieDePagina() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({
        children: [PageNumber.CURRENT],
        size: 9 * 2, color: hex(COLORS.textSecondary), font: FUENTE
      })]
    })]
  })
}

/**
 * Genera el reporte vocacional en Word
 * @param {Object} datos - Resultados del participante (ver reporte-contenido.js)
 * @returns {Promise<Buffer>} Buffer del .docx generado
 */
async function generarReporteWord(datos) {
  const bloques = construirBloques(datos)

  // Las listas de carreras van a dos columnas, y en Word las columnas son una
  // propiedad de sección: hay que partir el documento en secciones continuas.
  // Cada tirada de bloques 'carrera' se aísla en su propia sección de 2 columnas.
  const secciones = []
  let hijos = []
  let enCarreras = false

  const cerrar = columnas => {
    if (hijos.length) secciones.push({ columnas, hijos })
    hijos = []
  }

  bloques.forEach(bloque => {
    if (bloque.tipo === 'carrera') {
      if (!enCarreras) { cerrar(1); enCarreras = true }
      hijos.push(parrafoVineta(bloque.texto, {
        referencia: VINETA_CARRERA, despues: 20, interlineado: false
      }))
      return
    }
    if (enCarreras) { cerrar(2); enCarreras = false }

    switch (bloque.tipo) {
      case 'portada':
        hijos.push(...bloquePortada(bloque))
        break
      case 'cierre':
        hijos.push(...bloqueCierre(bloque))
        break
      case 'imagenPagina':
        hijos.push(...bloqueImagenPagina(bloque))
        break
      case 'seccion':
        // Cada sección abre página, igual que en el PDF
        hijos.push(new Paragraph({ children: [new PageBreak()] }))
        hijos.push(new Paragraph({
          spacing: { after: 200 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: hex(COLORS.primary), space: 6 } },
          children: [new TextRun({
            text: bloque.titulo, bold: true, size: TAM.seccion * 2,
            color: hex(COLORS.primaryDark), font: FUENTE
          })]
        }))
        break
      case 'subseccion':
        hijos.push(parrafoTexto(bloque.titulo, {
          tamano: TAM.subseccion, negrita: true, color: COLORS.primary, despues: 120
        }))
        break
      case 'subsubtitulo':
        hijos.push(parrafoTexto(bloque.texto, {
          tamano: bloque.tamano || TAM.subsubtitulo, negrita: true, color: COLORS.primaryDark, despues: 60
        }))
        break
      case 'parrafo':
        hijos.push(...parrafosDeTexto(bloque.texto, { alineacion: AlignmentType.JUSTIFIED }))
        break
      case 'destacado':
        // Frase que introduce una lista ("El estudiante a menudo..."): sin negrita,
        // para que no compita con los subtítulos.
        hijos.push(...parrafosDeTexto(bloque.texto, { despues: 80 }))
        break
      case 'vineta':
        hijos.push(parrafoVineta(bloque.texto, { alineacion: AlignmentType.JUSTIFIED, despues: 60 }))
        break
      case 'nota':
        hijos.push(...parrafosDeTexto(bloque.texto, {
          tamano: bloque.tamano || TAM.cuerpo, color: COLORS.textSecondary, despues: 80
        }))
        break
      case 'interpretacion':
        hijos.push(new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 160, line: INTERLINEADO },
          children: [
            new TextRun({ text: bloque.etiqueta, bold: true, size: TAM.cuerpo * 2, color: hex(COLORS.text), font: FUENTE }),
            new TextRun({ text: bloque.texto, size: TAM.cuerpo * 2, color: hex(COLORS.text), font: FUENTE })
          ]
        }))
        break
      case 'centrado':
        hijos.push(parrafoTexto(bloque.texto, {
          tamano: bloque.tamano || 11, negrita: bloque.negrita,
          color: bloque.color, alineacion: AlignmentType.CENTER
        }))
        break
      case 'grafica':
        hijos.push(...bloqueGrafica(bloque))
        break
      case 'definiciones':
        hijos.push(...bloqueDefiniciones(bloque))
        break
      case 'dimensiones':
        hijos.push(...bloqueDimensiones(bloque))
        break
      default:
        console.warn('Bloque desconocido en el Word:', bloque.tipo)
    }
  })
  cerrar(enCarreras ? 2 : 1)

  const doc = new Document({
    creator: 'APROVA',
    title: `Reporte Vocacional - ${datos.nombre}`,
    subject: 'Perfil Vocacional',
    description: 'Reporte de Orientación Vocacional generado por APROVA',
    styles: {
      default: {
        document: { run: { font: FUENTE, size: TAM.cuerpo * 2, color: hex(COLORS.text) } }
      }
    },
    numbering: {
      config: [
        {
          reference: VINETA_NORMAL,
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }]
        },
        {
          reference: VINETA_CARRERA,
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: '●',
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 360, hanging: 360 } },
              run: { size: 7 * 2 }
            }
          }]
        }
      ]
    },
    sections: secciones.map((seccion, i) => ({
      properties: {
        page: PAGINA,
        // La primera sección abre el documento; las demás son continuas para que
        // el cambio de número de columnas no provoque un salto de página.
        type: i === 0 ? undefined : SectionType.CONTINUOUS,
        column: seccion.columnas === 2 ? { count: 2, space: 480, equalWidth: true } : undefined
      },
      // El pie solo se declara en la primera sección: las siguientes lo heredan.
      footers: i === 0 ? { default: pieDePagina() } : undefined,
      children: seccion.hijos
    }))
  })

  return Packer.toBuffer(doc)
}

module.exports = { generarReporteWord }
