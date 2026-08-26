// Renderiza a Word (.docx) el contenido que arma reporte-contenido.js.
// Comparte estructura con generar-reporte.js (PDF): ambos consumen los mismos
// bloques, así que una sección nueva aparece en los dos formatos sin tocar nada aquí.
const path = require('path')
const fs = require('fs')
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, PageBreak, VerticalAlign
} = require('docx')
const { construirBloques, COLORS } = require('./reporte-contenido')

// docx quiere el color sin '#'
const hex = c => String(c || '').replace('#', '')

// Word mide en twips (1/20 de punto). El ancho útil de una carta con márgenes
// de 1 pulgada es de 9360 twips.
const ANCHO_UTIL = 9360
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
    spacing: { after: opciones.despues != null ? opciones.despues : 120, line: 276 },
    indent: opciones.sangria ? { left: opciones.sangria } : undefined,
    children: [new TextRun({
      text: texto,
      bold: opciones.negrita,
      size: (opciones.tamano || 11) * 2, // docx usa medios puntos
      color: hex(opciones.color || COLORS.text),
      font: 'Arial'
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
      tamano: 10, negrita: true, alineacion: AlignmentType.CENTER, despues: 40
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
    salida.push(parrafoTexto(nombre, { tamano: 11, negrita: true, color: COLORS.primaryDark, despues: 40 }))
    salida.push(parrafoTexto(definicion, { tamano: 10, color: COLORS.textSecondary, despues: 160 }))
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

/**
 * Genera el reporte vocacional en Word
 * @param {Object} datos - Resultados del participante (ver reporte-contenido.js)
 * @returns {Promise<Buffer>} Buffer del .docx generado
 */
async function generarReporteWord(datos) {
  const bloques = construirBloques(datos)
  const hijos = []

  bloques.forEach(bloque => {
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
            text: bloque.titulo, bold: true, size: 44, color: hex(COLORS.primaryDark), font: 'Arial'
          })]
        }))
        break
      case 'subseccion':
        hijos.push(parrafoTexto(bloque.titulo, {
          tamano: 14, negrita: true, color: COLORS.primary, despues: 120
        }))
        break
      case 'subsubtitulo':
        hijos.push(parrafoTexto(bloque.texto, {
          tamano: bloque.tamano || 11, negrita: true, color: COLORS.primaryDark, despues: 60
        }))
        break
      case 'parrafo':
        hijos.push(parrafoTexto(bloque.texto, { alineacion: AlignmentType.JUSTIFIED }))
        break
      case 'destacado':
        hijos.push(parrafoTexto(bloque.texto, { tamano: 10, negrita: true, despues: 80 }))
        break
      case 'vineta':
        hijos.push(new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 60, line: 276 },
          children: [new TextRun({ text: bloque.texto, size: 22, color: hex(COLORS.text), font: 'Arial' })]
        }))
        break
      case 'carrera':
        hijos.push(new Paragraph({
          bullet: { level: 1 },
          spacing: { after: 20 },
          children: [new TextRun({ text: bloque.texto, size: 20, color: hex(COLORS.text), font: 'Arial' })]
        }))
        break
      case 'nota':
        hijos.push(parrafoTexto(bloque.texto, {
          tamano: bloque.tamano || 10, color: COLORS.textSecondary, despues: 80
        }))
        break
      case 'interpretacion':
        hijos.push(new Paragraph({
          spacing: { after: 160, line: 276 },
          children: [
            new TextRun({ text: bloque.etiqueta, bold: true, size: 20, color: hex(COLORS.text), font: 'Arial' }),
            new TextRun({ text: bloque.texto, size: 20, color: hex(COLORS.text), font: 'Arial' })
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

  const doc = new Document({
    creator: 'APROVA',
    title: `Reporte Vocacional - ${datos.nombre}`,
    subject: 'Perfil Vocacional',
    description: 'Reporte de Orientación Vocacional generado por APROVA',
    sections: [{
      properties: {
        page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
      },
      children: hijos
    }]
  })

  return Packer.toBuffer(doc)
}

module.exports = { generarReporteWord }
