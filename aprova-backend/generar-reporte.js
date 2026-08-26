// Renderiza a PDF el contenido que arma reporte-contenido.js.
// La estructura del reporte NO vive aquí: este archivo solo sabe dibujar bloques.
const PDFDocument = require('pdfkit')
const path = require('path')
const fs = require('fs')
const { construirBloques, COLORS } = require('./reporte-contenido')

// ===== HELPERS DE DIBUJO =====
function addSectionTitle(doc, text) {
  doc.addPage()
  doc.fontSize(22).font('Helvetica-Bold').fillColor(COLORS.primaryDark).text(text)
  doc.moveDown(0.5)
  // Línea decorativa
  doc.save()
  doc.moveTo(doc.x, doc.y).lineTo(doc.x + 200, doc.y).lineWidth(3).strokeColor(COLORS.primary).stroke()
  doc.restore()
  doc.moveDown(1)
}

function addSubsectionTitle(doc, text) {
  doc.moveDown(0.5)
  doc.fontSize(14).font('Helvetica-Bold').fillColor(COLORS.primary).text(text)
  doc.moveDown(0.3)
}
// Lista de definiciones: cada entrada es { nombre, definicion }.
// Se usa para explicar qué mide cada apartado de razonamiento y cada aptitud.
function addDefinitionList(doc, entradas) {
  entradas.forEach(({ nombre, definicion }) => {
    if (!definicion) return
    checkPageSpace(doc, 60)
    doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.primaryDark)
    doc.text(nombre)
    doc.moveDown(0.2)
    doc.fontSize(10).font('Helvetica').fillColor(COLORS.textSecondary)
    doc.text(definicion, { lineGap: 3 })
    doc.moveDown(0.6)
  })
}
function addBodyText(doc, text) {
  doc.fontSize(11).font('Helvetica').fillColor(COLORS.text).text(text, { lineGap: 4, align: 'justify' })
  doc.moveDown(0.5)
}

function addBulletPoint(doc, text) {
  const x = doc.x
  doc.fontSize(11).font('Helvetica').fillColor(COLORS.primary).text('•', { continued: true })
  doc.fillColor(COLORS.text).text('  ' + text, { lineGap: 3 })
}

function checkPageSpace(doc, needed) {
  if (doc.y + needed > doc.page.height - 80) {
    doc.addPage()
  }
}

function drawBarChart(doc, items, maxValue, barWidth) {
  const barHeight = 20
  const labelWidth = 170
  const startX = 60
  const chartWidth = barWidth || 250
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right

  items.forEach(item => {
    checkPageSpace(doc, barHeight + 10)
    const y = doc.y

    // Label (no avanzar cursor)
    doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.text)
    doc.text(item.label, startX, y + 3, { width: labelWidth - 10, lineBreak: false, ellipsis: true })

    // Background bar
    const barX = startX + labelWidth
    doc.save()
    doc.rect(barX, y, chartWidth, barHeight).fillColor('#E5E7EB').fill()

    // Value bar
    const pct = Math.min(item.value / maxValue, 1)
    const filledWidth = chartWidth * pct
    if (filledWidth > 0) {
      doc.rect(barX, y, filledWidth, barHeight).fillColor(item.color || COLORS.primary).fill()
    }
    doc.restore()

    // Value text inside or outside bar
    const valText = item.displayValue || String(item.value)
    if (filledWidth > 50) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.white)
      doc.text(valText, barX + 6, y + 5, { width: filledWidth - 12, lineBreak: false })
    } else if (filledWidth > 0) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.text)
      doc.text(valText, barX + filledWidth + 4, y + 5, { width: 60, lineBreak: false })
    }

    // Level text to the right
    if (item.level) {
      doc.fontSize(8).font('Helvetica').fillColor(COLORS.textSecondary)
      doc.text(item.level, barX + chartWidth + 6, y + 5, { width: 70, lineBreak: false })
    }

    doc.x = startX
    doc.y = y + barHeight + 4
  })
}

// ===== RENDERIZADO POR BLOQUE =====
function dibujarPortada(doc, bloque) {
  doc.rect(0, 0, doc.page.width, doc.page.height).fillColor(COLORS.primaryDark).fill()

  doc.fontSize(36).font('Helvetica-Bold').fillColor(COLORS.white)
  doc.text(bloque.nombre, 60, 200, { align: 'center', width: doc.page.width - 120 })

  doc.moveDown(2)
  doc.fontSize(18).font('Helvetica').fillColor(COLORS.primaryLight)
  doc.text('Reporte de Orientación Vocacional', { align: 'center', width: doc.page.width - 120 })

  doc.moveDown(4)
  const logoPath = path.join(__dirname, 'logo-aprova.png')
  if (fs.existsSync(logoPath)) {
    const logoW = 280
    doc.image(logoPath, (doc.page.width - logoW) / 2, doc.y, { width: logoW })
  }

  doc.moveDown(4)
  doc.fontSize(12).fillColor(COLORS.primaryLight)
  doc.text(bloque.fecha, { align: 'center', width: doc.page.width - 120 })
}

function dibujarCierre(doc, bloque) {
  doc.addPage()
  doc.rect(0, 0, doc.page.width, doc.page.height).fillColor(COLORS.primaryDark).fill()

  doc.fontSize(28).font('Helvetica-Bold').fillColor(COLORS.white)
  doc.text('APROVA', 60, 250, { align: 'center', width: doc.page.width - 120 })

  doc.moveDown(1)
  doc.fontSize(16).font('Helvetica').fillColor(COLORS.primaryLight)
  doc.text('Orientación Vocacional', { align: 'center', width: doc.page.width - 120 })

  doc.moveDown(2)
  doc.fontSize(12).fillColor(COLORS.primaryLight)
  doc.text('Este reporte fue generado automáticamente por el sistema APROVA.', { align: 'center', width: doc.page.width - 120 })
  doc.moveDown(0.5)
  doc.text('Los resultados deben ser interpretados por un profesional calificado.', { align: 'center', width: doc.page.width - 120 })

  doc.moveDown(2)
  doc.fontSize(11).fillColor(COLORS.primaryLight)
  doc.text(bloque.fecha, { align: 'center', width: doc.page.width - 120 })
}

function dibujarImagenPagina(doc, bloque) {
  doc.addPage()
  const maxW = doc.page.width - 120
  const maxH = doc.page.height - 120
  const proporcion = 1.25 // proporción aproximada de la imagen
  const altoDeseado = maxW * proporcion
  const finalH = Math.min(altoDeseado, maxH)
  const finalW = finalH < altoDeseado ? finalH / proporcion : maxW
  doc.image(bloque.ruta, (doc.page.width - finalW) / 2, (doc.page.height - finalH) / 2, { width: finalW, height: finalH })
}

function dibujarDimensiones(doc, bloque) {
  bloque.filas.forEach(fila => {
    checkPageSpace(doc, 30)
    doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.text)
    doc.text(fila.etiqueta, { align: 'center' })

    const barY = doc.y + 2
    const barX = 150
    const barW = 300
    const w = Math.round((fila.pct1 / 100) * barW)
    doc.save()
    doc.rect(barX, barY, w, 8).fillColor(COLORS.primary).fill()
    doc.rect(barX + w, barY, barW - w, 8).fillColor(COLORS.primaryLight).fill()
    doc.restore()
    doc.y = barY + 16
  })
  doc.moveDown(1)
}


/**
 * Genera el PDF del reporte vocacional
 * @param {Object} datos - Resultados del participante (ver reporte-contenido.js)
 * @returns {Promise<Buffer>} Buffer del PDF generado
 */
async function generarReportePDF(datos) {
  const bloques = construirBloques(datos)

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 60, bottom: 60, left: 60, right: 60 },
      info: {
        Title: `Reporte Vocacional - ${datos.nombre}`,
        Author: 'APROVA - Orientación Vocacional',
        Subject: 'Perfil Vocacional',
        Creator: 'APROVA'
      }
    })

    const chunks = []
    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    bloques.forEach(bloque => {
      switch (bloque.tipo) {
        case 'portada':
          dibujarPortada(doc, bloque)
          break
        case 'cierre':
          dibujarCierre(doc, bloque)
          break
        case 'imagenPagina':
          dibujarImagenPagina(doc, bloque)
          break
        case 'seccion':
          addSectionTitle(doc, bloque.titulo)
          break
        case 'subseccion':
          if (bloque.espacioMin) checkPageSpace(doc, bloque.espacioMin)
          addSubsectionTitle(doc, bloque.titulo)
          break
        case 'subsubtitulo':
          if (bloque.espacioMin) checkPageSpace(doc, bloque.espacioMin)
          doc.fontSize(bloque.tamano || 11).font('Helvetica-Bold').fillColor(COLORS.primaryDark)
          doc.text(bloque.texto)
          doc.moveDown(0.2)
          break
        case 'parrafo':
          if (bloque.espacioMin) checkPageSpace(doc, bloque.espacioMin)
          addBodyText(doc, bloque.texto)
          break
        case 'destacado':
          if (bloque.espacioMin) checkPageSpace(doc, bloque.espacioMin)
          doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.text)
          doc.text(bloque.texto, { lineGap: 3 })
          doc.moveDown(0.3)
          break
        case 'vineta':
          if (bloque.espacioMin) checkPageSpace(doc, bloque.espacioMin)
          addBulletPoint(doc, bloque.texto)
          break
        case 'carrera':
          if (bloque.espacioMin) checkPageSpace(doc, bloque.espacioMin)
          doc.fontSize(10).font('Helvetica').fillColor(COLORS.text)
          doc.text(`  • ${bloque.texto}`)
          break
        case 'nota':
          doc.fontSize(bloque.tamano || 10).font('Helvetica').fillColor(COLORS.textSecondary)
          doc.text(bloque.texto, { lineGap: 3 })
          doc.moveDown(0.3)
          break
        case 'interpretacion':
          checkPageSpace(doc, 40)
          doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.text)
          doc.text(bloque.etiqueta, { continued: true })
          doc.font('Helvetica').text(bloque.texto, { lineGap: 3 })
          doc.moveDown(0.8)
          break
        case 'centrado':
          doc.fontSize(bloque.tamano || 11)
            .font(bloque.negrita ? 'Helvetica-Bold' : 'Helvetica')
            .fillColor(bloque.color || COLORS.text)
          doc.text(bloque.texto, { align: 'center' })
          doc.moveDown(0.5)
          break
        case 'dimensiones':
          dibujarDimensiones(doc, bloque)
          break
        case 'grafica':
          drawBarChart(doc, bloque.items, bloque.maxValue)
          doc.moveDown(0.5)
          break
        case 'definiciones':
          addDefinitionList(doc, bloque.entradas)
          break
        default:
          console.warn('Bloque desconocido en el PDF:', bloque.tipo)
      }
    })

    doc.end()
  })
}

module.exports = { generarReportePDF }
