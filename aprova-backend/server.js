require('dotenv').config()
const express = require('express')
const cors = require('cors')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const nodemailer = require('nodemailer')
const ExcelJS = require('exceljs')

const app = express()

// Configurar transporter de Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
})

// Middleware - permitir todas las conexiones en desarrollo
app.use(cors())
app.use(express.json())

// Productos/Precios de APROVA
const PRODUCTOS = {
  modalidad1: {
    nombre: 'Modalidad 1 - Solo Tests',
    descripcion: 'Tests psicométricos en línea + Perfil vocacional por correo',
    precio: 400000 // $4,000.00 MXN (en centavos)
  },
  modalidad2: {
    nombre: 'Modalidad 2 - Tests + Asesoría Virtual',
    descripcion: 'Tests + Múltiples sesiones virtuales + Coaching personalizado',
    precio: 700000 // $7,000.00 MXN (en centavos)
  }
}

// Crear sesión de checkout
app.post('/api/crear-checkout', async (req, res) => {
  try {
    const { modalidad, email, nombre } = req.body

    if (!PRODUCTOS[modalidad]) {
      return res.status(400).json({ error: 'Modalidad no válida' })
    }

    const producto = PRODUCTOS[modalidad]

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      metadata: {
        nombre: nombre,
        modalidad: modalidad
      },
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: producto.nombre,
              description: producto.descripcion
            },
            unit_amount: producto.precio
          },
          quantity: 1
        }
      ],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}&modalidad=${modalidad}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/servicios`
    })

    res.json({ url: session.url })
  } catch (error) {
    console.error('Error al crear checkout:', error)
    res.status(500).json({ error: 'Error al procesar el pago' })
  }
})

// Verificar sesión de pago y enviar recibo
app.get('/api/verificar-pago/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === 'paid') {
      const modalidad = session.metadata.modalidad || req.query.modalidad
      const nombre = session.metadata.nombre || 'Cliente'
      const email = session.customer_email
      const producto = PRODUCTOS[modalidad]
      const precio = producto ? producto.precio / 100 : 0

      // Enviar correo de confirmación al cliente
      try {
        const mailCliente = {
          from: `"APROVA" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: '¡Gracias por tu compra! - APROVA',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #534AB7; color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0;">¡Gracias por tu compra!</h1>
              </div>

              <div style="padding: 30px; background: #ffffff;">
                <p style="font-size: 16px;">Hola <strong>${nombre}</strong>,</p>
                <p style="font-size: 16px;">Tu pago ha sido procesado exitosamente. Ya tienes acceso a los tests psicométricos de APROVA.</p>

                <div style="background: #EEEDFE; padding: 20px; border-radius: 10px; margin: 20px 0;">
                  <h3 style="color: #26215C; margin-top: 0;">Detalles de tu compra:</h3>
                  <p><strong>Servicio:</strong> ${producto ? producto.nombre : modalidad}</p>
                  <p><strong>Monto:</strong> $${precio.toFixed(2)} MXN</p>
                  <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/tests" style="background: #534AB7; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Comenzar mis tests</a>
                </div>

                <p style="color: #666; font-size: 14px;">Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este correo o por WhatsApp al (449) 911 9192.</p>
              </div>

              <div style="background: #26215C; color: #AFA9EC; padding: 20px; text-align: center; font-size: 12px;">
                <p style="margin: 0;">APROVA - Orientación Vocacional</p>
                <p style="margin: 5px 0 0;">Aguascalientes | Guadalajara | CDMX</p>
              </div>
            </div>
          `
        }

        await transporter.sendMail(mailCliente)
        console.log(`Recibo enviado a: ${email}`)

        // También notificar a APROVA de la nueva venta
        const mailAprova = {
          from: `"APROVA Sistema" <${process.env.GMAIL_USER}>`,
          to: process.env.EMAIL_DESTINO,
          subject: `Nueva venta: ${nombre} - ${producto ? producto.nombre : modalidad}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #22c55e; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">¡Nueva Venta!</h1>
              </div>
              <div style="padding: 20px;">
                <p><strong>Cliente:</strong> ${nombre}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Servicio:</strong> ${producto ? producto.nombre : modalidad}</p>
                <p><strong>Monto:</strong> $${precio.toFixed(2)} MXN</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</p>
              </div>
            </div>
          `
        }

        await transporter.sendMail(mailAprova)
        console.log(`Notificación de venta enviada a APROVA`)

      } catch (emailError) {
        console.error('Error al enviar correos:', emailError)
      }

      res.json({
        pagado: true,
        email: email,
        nombre: nombre,
        modalidad: modalidad
      })
    } else {
      res.json({ pagado: false })
    }
  } catch (error) {
    console.error('Error al verificar pago:', error)
    res.status(500).json({ error: 'Error al verificar el pago' })
  }
})

// Obtener precios
app.get('/api/precios', (req, res) => {
  res.json({
    modalidad1: {
      nombre: PRODUCTOS.modalidad1.nombre,
      precio: PRODUCTOS.modalidad1.precio / 100,
      moneda: 'MXN'
    },
    modalidad2: {
      nombre: PRODUCTOS.modalidad2.nombre,
      precio: PRODUCTOS.modalidad2.precio / 100,
      moneda: 'MXN'
    }
  })
})

// Generar Excel según tipo de test
async function generarExcel({ nombre, email, modalidad, testNombre, respuestas, tipoResultado, datosPersonales }) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'APROVA'
  workbook.created = new Date()

  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF534AB7' } }
  const headerFont = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 }
  const titleFont = { bold: true, size: 14, color: { argb: 'FF26215C' } }

  // Hoja de información del participante
  const infoSheet = workbook.addWorksheet('Información')
  infoSheet.columns = [
    { header: '', key: 'campo', width: 25 },
    { header: '', key: 'valor', width: 45 }
  ]
  infoSheet.addRow({ campo: 'APROVA - Resultados', valor: '' })
  infoSheet.getRow(1).font = titleFont
  infoSheet.addRow({})
  infoSheet.addRow({ campo: 'Nombre', valor: nombre })
  infoSheet.addRow({ campo: 'Email', valor: email })
  infoSheet.addRow({ campo: 'Modalidad', valor: modalidad === 'modalidad2' ? 'Tests + Asesoría Virtual' : 'Solo Tests' })
  infoSheet.addRow({ campo: 'Test', valor: testNombre })
  infoSheet.addRow({ campo: 'Fecha', valor: new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }) })

  // Estilo para campos
  for (let i = 3; i <= 7; i++) {
    infoSheet.getRow(i).getCell(1).font = { bold: true }
  }

  if (tipoResultado === 'terman') {
    const { series, sumatoria, edadMental, ci, rango } = respuestas

    // Tabla de rangos por serie (puntuaciones límite inferior de cada rango)
    const RANGOS_SERIE = {
      I:    { Sobresaliente: 16, Superior: 15, 'Término Medio Alto': 14, 'Término Medio': 12, 'Término Medio Bajo': 10, Inferior: 8, Deficiente: 0 },
      II:   { Sobresaliente: 22, Superior: 20, 'Término Medio Alto': 18, 'Término Medio': 12, 'Término Medio Bajo': 10, Inferior: 8, Deficiente: 0 },
      III:  { Sobresaliente: 29, Superior: 27, 'Término Medio Alto': 23, 'Término Medio': 14, 'Término Medio Bajo': 12, Inferior: 8, Deficiente: 0 },
      IV:   { Sobresaliente: 18, Superior: 16, 'Término Medio Alto': 14, 'Término Medio': 10, 'Término Medio Bajo': 7, Inferior: 6, Deficiente: 0 },
      V:    { Sobresaliente: 24, Superior: 20, 'Término Medio Alto': 16, 'Término Medio': 12, 'Término Medio Bajo': 8, Inferior: 6, Deficiente: 0 },
      VI:   { Sobresaliente: 20, Superior: 18, 'Término Medio Alto': 15, 'Término Medio': 9, 'Término Medio Bajo': 7, Inferior: 5, Deficiente: 0 },
      VII:  { Sobresaliente: 19, Superior: 18, 'Término Medio Alto': 16, 'Término Medio': 9, 'Término Medio Bajo': 6, Inferior: 5, Deficiente: 0 },
      VIII: { Sobresaliente: 17, Superior: 15, 'Término Medio Alto': 13, 'Término Medio': 8, 'Término Medio Bajo': 7, Inferior: 6, Deficiente: 0 },
      IX:   { Sobresaliente: 18, Superior: 17, 'Término Medio Alto': 16, 'Término Medio': 10, 'Término Medio Bajo': 9, Inferior: 7, Deficiente: 0 },
      X:    { Sobresaliente: 20, Superior: 18, 'Término Medio Alto': 16, 'Término Medio': 10, 'Término Medio Bajo': 8, Inferior: 6, Deficiente: 0 }
    }

    const RANGOS_ORDER = ['Sobresaliente', 'Superior', 'Término Medio Alto', 'Término Medio', 'Término Medio Bajo', 'Inferior', 'Deficiente']

    const SERIES_NOMBRES = {
      I: 'Información', II: 'Juicio', III: 'Vocabulario', IV: 'Síntesis',
      V: 'Concentración', VI: 'Análisis', VII: 'Abstracción', VIII: 'Planeación',
      IX: 'Organización', X: 'Atención'
    }

    // Interpretaciones por serie
    const INTERPRETACIONES = {
      I: { nombre: 'Información', alto: 'Nivel de cultura general elevado, ambición de conocimientos, buena capacidad de aprendizaje y memoria remota. Aprovecha la percepción del mundo cotidiano.', bajo: 'Baja información del ambiente, poca capacidad para asociar sucesos y datos. Nivel de cultura general limitado.' },
      II: { nombre: 'Juicio', alto: 'Buen ajuste a normas sociales, pensamiento abstracto, sentido común y buen contacto con la realidad. Comprende y responde adecuadamente.', bajo: 'Pensamiento concreto, dificultad para ajustarse a normas y situaciones prácticas. Puede faltar sentido común.' },
      III: { nombre: 'Vocabulario', alto: 'Riqueza verbal, inteligencia abstracta, nivel de cultura elevado y mayor riqueza en conceptos. Correcta dirección de la atención.', bajo: 'Procesos intelectuales concretos, dificultad para expresarse, bajo nivel de lectura y cultura general.' },
      IV: { nombre: 'Síntesis', alto: 'Correcta formación de conceptos, objetivo en apreciaciones del medio ambiente. Buena capacidad de clasificación y organización lógica.', bajo: 'Tendencia práctica, analiza superficialmente las situaciones. Dificultad para conceptualizar principios básicos.' },
      V: { nombre: 'Concentración', alto: 'Buenos conocimientos numéricos, elevado grado de concentración y atención bajo presión. Experiencia en manejo de operaciones aritméticas.', bajo: 'Dificultad para concentrarse, posible ansiedad bajo presión, problemas con habilidad numérica.' },
      VI: { nombre: 'Análisis', alto: 'Cultura amplia, buena comprensión de información escrita y óptimo contacto con la realidad.', bajo: 'Dificultades en lectura y comprensión de textos. Cultura o información limitada y poco enriquecida.' },
      VII: { nombre: 'Abstracción', alto: 'Facilidad de palabra, utilización adecuada de conceptos, rapidez y efectividad en elección de alternativas.', bajo: 'Capacidad de expresión limitada, dificultad para encontrar conceptos precisos, necesita tiempo para elegir entre alternativas.' },
      VIII: { nombre: 'Planeación', alto: 'Iniciativa, busca soluciones rápidas y creativas. Buena atención a detalles, capacidad de ordenar lo desestructurado. Perfeccionista.', bajo: 'Baja atención a detalles, baja capacidad para percibir la totalidad. Observa los árboles pero no puede ver el bosque. Conformista.' },
      IX: { nombre: 'Organización', alto: 'Hábil en comprensión de significados y conceptos, ágil para encontrar discrepancias y reacomodar situaciones.', bajo: 'Capacidad de conceptualización limitada, problemas para ordenar y jerarquizar prioridades.' },
      X: { nombre: 'Atención', alto: 'Buena capacidad de observación, sintetiza información para analizarla y aplicarla. Actividades básicas para desempeñar una gerencia con éxito.', bajo: 'Dificultad para observar detalles, las presiones provocan ansiedad.' }
    }

    function getRangoSerie(serieKey, puntuacion) {
      const rangos = RANGOS_SERIE[serieKey]
      if (!rangos) return 'Término Medio'
      for (const rng of RANGOS_ORDER) {
        if (puntuacion >= rangos[rng]) return rng
      }
      return 'Deficiente'
    }

    // Colores para cada rango
    const RANGO_COLORS = {
      Sobresaliente: 'FF1E40AF',
      Superior: 'FF3B82F6',
      'Término Medio Alto': 'FF22C55E',
      'Término Medio': 'FFFBBF24',
      'Término Medio Bajo': 'FFF97316',
      Inferior: 'FFEF4444',
      Deficiente: 'FF991B1B'
    }

    // ===== HOJA 1: RESUMEN GENERAL =====
    const resumenSheet = workbook.addWorksheet('Resumen TERMAN')
    resumenSheet.columns = [
      { header: '', key: 'campo', width: 30 },
      { header: '', key: 'valor', width: 25 }
    ]
    resumenSheet.addRow({ campo: 'RESUMEN GENERAL - TEST TERMAN', valor: '' })
    resumenSheet.getRow(1).font = titleFont
    resumenSheet.addRow({})
    resumenSheet.addRow({ campo: 'Coeficiente Intelectual (CI)', valor: ci })
    resumenSheet.addRow({ campo: 'Rango General', valor: rango })
    resumenSheet.addRow({ campo: 'Sumatoria Total', valor: sumatoria })
    resumenSheet.addRow({ campo: 'Edad Mental', valor: edadMental })
    resumenSheet.addRow({})
    resumenSheet.addRow({ campo: 'RESULTADOS POR SERIE', valor: '' })
    resumenSheet.getRow(8).font = titleFont

    // Tabla de resultados por serie con rango
    const serieHeaders = resumenSheet.addRow({ campo: 'Serie', valor: '' })
    resumenSheet.getCell('A9').value = 'Serie'
    resumenSheet.getCell('B9').value = 'Puntuación'
    resumenSheet.getCell('C9').value = 'Rango'
    resumenSheet.getColumn(3).width = 25
    const row9 = resumenSheet.getRow(9)
    row9.fill = headerFill
    row9.font = headerFont

    const SERIES_ORDER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
    SERIES_ORDER.forEach(key => {
      const datos = series[key]
      if (!datos) return
      const rangoSerie = getRangoSerie(key, datos.puntuacion)
      const row = resumenSheet.addRow({})
      row.getCell(1).value = `${key} - ${SERIES_NOMBRES[key] || datos.nombre}`
      row.getCell(2).value = datos.puntuacion
      row.getCell(3).value = rangoSerie
      row.getCell(2).font = { bold: true }
    })

    for (let i = 3; i <= 6; i++) {
      resumenSheet.getRow(i).getCell(1).font = { bold: true }
      resumenSheet.getRow(i).getCell(2).font = { bold: true, size: 13 }
    }

    // ===== HOJA 2: GRÁFICA DE RENDIMIENTO INTELECTUAL =====
    const grafSheet = workbook.addWorksheet('Gráfica Rendimiento')
    grafSheet.addRow(['GRÁFICA DE RENDIMIENTO INTELECTUAL - TERMAN'])
    grafSheet.getRow(1).font = { bold: true, size: 14, color: { argb: 'FF26215C' } }
    grafSheet.mergeCells('A1:I1')
    grafSheet.addRow([`Nombre: ${nombre}`, '', '', '', '', '', '', '', `CI: ${ci} - ${rango}`])
    grafSheet.getRow(2).font = { size: 11, color: { argb: 'FF6B7280' } }
    grafSheet.addRow([])

    // Encabezados de columnas de rango (abreviados)
    const rangoAbrev = ['DEF', 'INF', 'TMB', 'TM', 'TMA', 'SUP', 'SOB']
    const rangoAbrevMap = { 'DEF': 'Deficiente', 'INF': 'Inferior', 'TMB': 'Término Medio Bajo', 'TM': 'Término Medio', 'TMA': 'Término Medio Alto', 'SUP': 'Superior', 'SOB': 'Sobresaliente' }

    grafSheet.getColumn(1).width = 4
    grafSheet.getColumn(2).width = 18
    for (let c = 3; c <= 9; c++) grafSheet.getColumn(c).width = 8

    // Header row
    const hRow = grafSheet.addRow(['', 'SERIE', ...rangoAbrev])
    hRow.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
    hRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26215C' } }
    hRow.alignment = { horizontal: 'center', vertical: 'middle' }
    hRow.height = 22

    // Filas por serie
    SERIES_ORDER.forEach(key => {
      const datos = series[key]
      if (!datos) return
      const rangoSerie = getRangoSerie(key, datos.puntuacion)
      const rangoIndex = RANGOS_ORDER.indexOf(rangoSerie)
      // Invertido: columna 3=DEF(6), 4=INF(5), ..., 9=SOB(0)
      const colIndex = 9 - rangoIndex // columna Excel donde cae

      const row = grafSheet.addRow(['', `${key}. ${SERIES_NOMBRES[key] || datos.nombre}`, '', '', '', '', '', '', ''])
      row.height = 22
      row.getCell(2).font = { bold: true, size: 10 }
      row.alignment = { horizontal: 'center', vertical: 'middle' }

      // Colorear la celda correspondiente al rango
      for (let c = 3; c <= 9; c++) {
        row.getCell(c).border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
        }
      }

      // Colorear celdas desde DEF hasta el rango alcanzado (barra horizontal)
      for (let c = 3; c <= colIndex; c++) {
        const rangoName = rangoAbrevMap[rangoAbrev[c - 3]]
        row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: RANGO_COLORS[rangoName] || 'FF9CA3AF' } }
      }
      // Poner el puntaje en la celda del rango
      row.getCell(colIndex).value = datos.puntuacion
      row.getCell(colIndex).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
    })

    // Fila de CI general
    grafSheet.addRow([])
    const ciRow = grafSheet.addRow(['', 'CI GENERAL', '', '', '', '', '', '', ''])
    ciRow.height = 22
    ciRow.getCell(2).font = { bold: true, size: 10 }
    ciRow.alignment = { horizontal: 'center', vertical: 'middle' }

    // Determinar columna del CI general
    let ciColIndex = 6 // TM por defecto
    if (ci >= 140) ciColIndex = 9
    else if (ci >= 120) ciColIndex = 8
    else if (ci >= 110) ciColIndex = 7
    else if (ci >= 90) ciColIndex = 6
    else if (ci >= 80) ciColIndex = 5
    else if (ci >= 70) ciColIndex = 4
    else ciColIndex = 3

    for (let c = 3; c <= 9; c++) {
      ciRow.getCell(c).border = {
        top: { style: 'medium', color: { argb: 'FF26215C' } },
        bottom: { style: 'medium', color: { argb: 'FF26215C' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
      }
    }
    for (let c = 3; c <= ciColIndex; c++) {
      const rangoName = rangoAbrevMap[rangoAbrev[c - 3]]
      ciRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: RANGO_COLORS[rangoName] || 'FF9CA3AF' } }
    }
    ciRow.getCell(ciColIndex).value = ci
    ciRow.getCell(ciColIndex).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }

    // Leyenda
    grafSheet.addRow([])
    grafSheet.addRow([])
    const legRow = grafSheet.addRow(['', 'Leyenda:'])
    legRow.getCell(2).font = { bold: true, size: 10 }
    const abrevFull = [
      ['DEF', 'Deficiente'], ['INF', 'Inferior'], ['TMB', 'Término Medio Bajo'],
      ['TM', 'Término Medio'], ['TMA', 'Término Medio Alto'], ['SUP', 'Superior'], ['SOB', 'Sobresaliente']
    ]
    abrevFull.forEach(([abr, full]) => {
      const r = grafSheet.addRow(['', `${abr} = ${full}`])
      r.getCell(2).font = { size: 9, color: { argb: 'FF6B7280' } }
    })

    // ===== HOJA 3: INTERPRETACIÓN POR SERIE =====
    const interpSheet = workbook.addWorksheet('Interpretación')
    interpSheet.getColumn(1).width = 20
    interpSheet.getColumn(2).width = 15
    interpSheet.getColumn(3).width = 60

    interpSheet.addRow(['INTERPRETACIÓN DE RESULTADOS POR SERIE'])
    interpSheet.getRow(1).font = titleFont
    interpSheet.mergeCells('A1:C1')
    interpSheet.addRow([])

    const interpHdrRow = interpSheet.addRow(['Serie', 'Rango', 'Interpretación'])
    interpHdrRow.fill = headerFill
    interpHdrRow.font = headerFont

    SERIES_ORDER.forEach(key => {
      const datos = series[key]
      if (!datos) return
      const rangoSerie = getRangoSerie(key, datos.puntuacion)
      const interp = INTERPRETACIONES[key]
      const rangoIdx = RANGOS_ORDER.indexOf(rangoSerie)
      const esAlto = rangoIdx <= 2 // Sobresaliente, Superior, TMA
      const texto = esAlto ? interp.alto : interp.bajo

      const row = interpSheet.addRow([`${key}. ${interp.nombre}`, rangoSerie, texto])
      row.getCell(1).font = { bold: true }
      row.getCell(3).alignment = { wrapText: true }
      row.height = 45
    })

    // Tabla de rangos CI
    interpSheet.addRow([])
    interpSheet.addRow([])
    const ciTitleRow = interpSheet.addRow(['RANGOS DE CI Y CLASIFICACIÓN'])
    ciTitleRow.font = titleFont
    interpSheet.mergeCells(`A${ciTitleRow.number}:C${ciTitleRow.number}`)

    const ciHdr = interpSheet.addRow(['Rango CI', 'Clasificación', ''])
    ciHdr.fill = headerFill
    ciHdr.font = headerFont
    interpSheet.addRow(['140+', 'Sobresaliente'])
    interpSheet.addRow(['120-139', 'Superior'])
    interpSheet.addRow(['110-119', 'Término Medio Alto'])
    interpSheet.addRow(['90-109', 'Normal (Término Medio)'])
    interpSheet.addRow(['80-89', 'Término Medio Bajo'])
    interpSheet.addRow(['70-79', 'Inferior'])
    interpSheet.addRow(['69 o menos', 'Deficiente'])

  } else if (tipoResultado === 'aptitudes') {
    // BRP - Perfil de Aptitudes
    const NIVEL_COLORS = {
      'Muy Alto': 'FF1E40AF',
      'Alto': 'FF22C55E',
      'Medio': 'FFFBBF24',
      'Bajo': 'FFF97316',
      'Muy Bajo': 'FFEF4444'
    }

    // Ordenar aptitudes por puntaje descendente
    const aptOrdenadas = Object.entries(respuestas).sort((a, b) => b[1].puntaje - a[1].puntaje)

    // ===== HOJA 1: PERFIL DE APTITUDES =====
    const perfilSheet = workbook.addWorksheet('Perfil de Aptitudes')
    perfilSheet.addRow(['BRP - PERFIL DE APTITUDES'])
    perfilSheet.getRow(1).font = titleFont
    perfilSheet.mergeCells('A1:E1')
    perfilSheet.addRow([])
    perfilSheet.addRow(['Nombre:', nombre])
    perfilSheet.addRow(['Fecha:', new Date().toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' })])
    perfilSheet.addRow([])

    // Tabla de resultados
    const aptHdr = perfilSheet.addRow(['Aptitud', 'Puntaje', 'Máximo', 'Porcentaje', 'Nivel'])
    aptHdr.fill = headerFill
    aptHdr.font = headerFont
    perfilSheet.getColumn(1).width = 28
    perfilSheet.getColumn(2).width = 12
    perfilSheet.getColumn(3).width = 10
    perfilSheet.getColumn(4).width = 14
    perfilSheet.getColumn(5).width = 14

    aptOrdenadas.forEach(([aptitud, datos]) => {
      const row = perfilSheet.addRow([aptitud, datos.puntaje, datos.maximo || 50, datos.porcentaje + '%', datos.nivel])
      row.getCell(1).font = { bold: true }
      const nivelColor = NIVEL_COLORS[datos.nivel]
      if (nivelColor) {
        row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: nivelColor } }
        row.getCell(5).font = { bold: true, color: { argb: 'FFFFFFFF' } }
      }
    })

    // Leyenda
    perfilSheet.addRow([])
    perfilSheet.addRow([])
    const legTitle = perfilSheet.addRow(['LEYENDA DE NIVELES:'])
    legTitle.getCell(1).font = { bold: true }
    perfilSheet.addRow(['Muy Alto (40-50)'])
    perfilSheet.addRow(['Alto (30-39)'])
    perfilSheet.addRow(['Medio (20-29)'])
    perfilSheet.addRow(['Bajo (10-19)'])
    perfilSheet.addRow(['Muy Bajo (0-9)'])

    // ===== HOJA 2: GRÁFICA DE COLORES =====
    const grafSheet = workbook.addWorksheet('Gráfica Aptitudes')

    // Título
    grafSheet.addRow(['GRÁFICA DE APTITUDES - BRP'])
    grafSheet.getRow(1).font = { bold: true, size: 16, color: { argb: 'FF26215C' } }
    grafSheet.mergeCells('A1:M1')
    grafSheet.addRow([`Nombre: ${nombre}`])
    grafSheet.getRow(2).font = { size: 11, color: { argb: 'FF6B7280' } }
    grafSheet.addRow([`Fecha: ${new Date().toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' })}`])
    grafSheet.getRow(3).font = { size: 11, color: { argb: 'FF6B7280' } }
    grafSheet.addRow([])

    // Configurar anchos de columnas
    grafSheet.getColumn(1).width = 30  // Aptitud
    for (let c = 2; c <= 51; c++) grafSheet.getColumn(c).width = 2.5  // 50 celdas = 50 puntos
    grafSheet.getColumn(52).width = 8   // Puntaje
    grafSheet.getColumn(53).width = 12  // Nivel

    // Leyenda de colores arriba
    const legRow = grafSheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Puntaje', 'Nivel'])
    legRow.getCell(52).font = { bold: true, size: 9 }
    legRow.getCell(53).font = { bold: true, size: 9 }

    // Escala de referencia
    const scaleRow = grafSheet.addRow([])
    scaleRow.getCell(1).value = 'APTITUD'
    scaleRow.getCell(1).font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } }
    scaleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26215C' } }
    // Marcar cada 10 puntos
    const marcas = { 10: '10', 20: '20', 30: '30', 40: '40', 50: '50' }
    for (let c = 2; c <= 51; c++) {
      const punto = c - 1
      scaleRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26215C' } }
      if (marcas[punto]) {
        scaleRow.getCell(c).value = parseInt(marcas[punto])
        scaleRow.getCell(c).font = { bold: true, size: 8, color: { argb: 'FFFFFFFF' } }
      }
      scaleRow.getCell(c).alignment = { horizontal: 'center' }
    }
    scaleRow.height = 16

    // Colores por zona (degradado visual)
    const ZONA_COLORS = {
      muyBajo: 'FFEF4444',   // Rojo
      bajo: 'FFF97316',       // Naranja
      medio: 'FFFBBF24',      // Amarillo
      alto: 'FF22C55E',       // Verde
      muyAlto: 'FF1E40AF'     // Azul
    }

    const getColorForPoint = (punto) => {
      if (punto <= 10) return ZONA_COLORS.muyBajo
      if (punto <= 20) return ZONA_COLORS.bajo
      if (punto <= 30) return ZONA_COLORS.medio
      if (punto <= 40) return ZONA_COLORS.alto
      return ZONA_COLORS.muyAlto
    }

    // Filas de aptitudes con barras de colores
    aptOrdenadas.forEach(([aptitud, datos]) => {
      const row = grafSheet.addRow([])
      row.getCell(1).value = aptitud
      row.getCell(1).font = { bold: true, size: 10 }
      row.getCell(1).alignment = { vertical: 'middle' }
      row.height = 22

      // Dibujar barra - cada celda = 1 punto, color según la zona
      const puntaje = datos.puntaje
      for (let c = 2; c <= 51; c++) {
        const punto = c - 1
        const thinBorder = { style: 'thin', color: { argb: 'FFE5E7EB' } }
        row.getCell(c).border = {
          top: thinBorder, bottom: thinBorder,
          left: thinBorder, right: thinBorder
        }
        if (punto <= puntaje) {
          row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: getColorForPoint(punto) } }
        }
      }

      // Poner el valor numérico sobre la última celda coloreada de la barra
      if (puntaje > 0) {
        const lastCol = Math.min(1 + puntaje, 51)
        row.getCell(lastCol).value = puntaje
        row.getCell(lastCol).font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } }
        row.getCell(lastCol).alignment = { horizontal: 'center', vertical: 'middle' }
      }

      // Puntaje y nivel al final
      row.getCell(52).value = puntaje
      row.getCell(52).font = { bold: true, size: 11 }
      row.getCell(52).alignment = { horizontal: 'center', vertical: 'middle' }

      row.getCell(53).value = datos.nivel
      const nivelColor = NIVEL_COLORS[datos.nivel] || 'FF9CA3AF'
      row.getCell(53).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: nivelColor } }
      row.getCell(53).font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
      row.getCell(53).alignment = { horizontal: 'center', vertical: 'middle' }
    })

    // Espacio y leyenda de zonas
    grafSheet.addRow([])
    grafSheet.addRow([])
    const legTitleRow = grafSheet.addRow(['LEYENDA DE ZONAS:'])
    legTitleRow.getCell(1).font = { bold: true, size: 11 }

    const zonas = [
      { nombre: 'Muy Alto (41-50)', color: ZONA_COLORS.muyAlto },
      { nombre: 'Alto (31-40)', color: ZONA_COLORS.alto },
      { nombre: 'Medio (21-30)', color: ZONA_COLORS.medio },
      { nombre: 'Bajo (11-20)', color: ZONA_COLORS.bajo },
      { nombre: 'Muy Bajo (1-10)', color: ZONA_COLORS.muyBajo }
    ]

    zonas.forEach(zona => {
      const zRow = grafSheet.addRow([])
      // Celda de color
      zRow.getCell(1).value = ''
      zRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zona.color } }
      zRow.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zona.color } }
      zRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zona.color } }
      zRow.getCell(5).value = zona.nombre
      zRow.getCell(5).font = { size: 10 }
    })

  } else if (tipoResultado === 'intereses') {
    // BRP - Inventario de Intereses Ocupacionales
    const NIVEL_COLORS_INT = {
      'Muy Alto': 'FF1E40AF',
      'Alto': 'FF22C55E',
      'Medio': 'FFFBBF24',
      'Bajo': 'FFF97316',
      'Muy Bajo': 'FFEF4444'
    }

    const ZONA_COLORS_INT = {
      muyBajo: 'FFEF4444',
      bajo: 'FFF97316',
      medio: 'FFFBBF24',
      alto: 'FF22C55E',
      muyAlto: 'FF1E40AF'
    }

    const getColorForPointInt = (punto) => {
      if (punto <= 10) return ZONA_COLORS_INT.muyBajo
      if (punto <= 20) return ZONA_COLORS_INT.bajo
      if (punto <= 30) return ZONA_COLORS_INT.medio
      if (punto <= 40) return ZONA_COLORS_INT.alto
      return ZONA_COLORS_INT.muyAlto
    }

    const intOrdenadas = Object.entries(respuestas).sort((a, b) => b[1].puntaje - a[1].puntaje)

    // ===== HOJA 1: PERFIL DE INTERESES =====
    const perfilSheet = workbook.addWorksheet('Perfil de Intereses')
    perfilSheet.addRow(['BRP - INVENTARIO DE INTERESES OCUPACIONALES'])
    perfilSheet.getRow(1).font = titleFont
    perfilSheet.mergeCells('A1:E1')
    perfilSheet.addRow([])
    perfilSheet.addRow(['Nombre:', nombre])
    perfilSheet.addRow(['Fecha:', new Date().toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' })])
    perfilSheet.addRow([])

    const intHdr = perfilSheet.addRow(['Escala de Interés', 'Puntaje', 'Máximo', 'Porcentaje', 'Nivel'])
    intHdr.fill = headerFill
    intHdr.font = headerFont
    perfilSheet.getColumn(1).width = 28
    perfilSheet.getColumn(2).width = 12
    perfilSheet.getColumn(3).width = 10
    perfilSheet.getColumn(4).width = 14
    perfilSheet.getColumn(5).width = 14

    intOrdenadas.forEach(([escala, datos]) => {
      const row = perfilSheet.addRow([escala, datos.puntaje, datos.maximo || 50, datos.porcentaje + '%', datos.nivel])
      row.getCell(1).font = { bold: true }
      const nivelColor = NIVEL_COLORS_INT[datos.nivel]
      if (nivelColor) {
        row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: nivelColor } }
        row.getCell(5).font = { bold: true, color: { argb: 'FFFFFFFF' } }
      }
    })

    perfilSheet.addRow([])
    perfilSheet.addRow([])
    const legTitleInt = perfilSheet.addRow(['LEYENDA DE NIVELES:'])
    legTitleInt.getCell(1).font = { bold: true }
    perfilSheet.addRow(['Muy Alto (41-50)'])
    perfilSheet.addRow(['Alto (31-40)'])
    perfilSheet.addRow(['Medio (21-30)'])
    perfilSheet.addRow(['Bajo (11-20)'])
    perfilSheet.addRow(['Muy Bajo (1-10)'])

    // ===== HOJA 2: GRÁFICA DE COLORES =====
    const grafIntSheet = workbook.addWorksheet('Gráfica Intereses')

    grafIntSheet.addRow(['GRÁFICA DE INTERESES - BRP'])
    grafIntSheet.getRow(1).font = { bold: true, size: 16, color: { argb: 'FF26215C' } }
    grafIntSheet.mergeCells('A1:M1')
    grafIntSheet.addRow([`Nombre: ${nombre}`])
    grafIntSheet.getRow(2).font = { size: 11, color: { argb: 'FF6B7280' } }
    grafIntSheet.addRow([`Fecha: ${new Date().toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' })}`])
    grafIntSheet.getRow(3).font = { size: 11, color: { argb: 'FF6B7280' } }
    grafIntSheet.addRow([])

    grafIntSheet.getColumn(1).width = 30
    for (let c = 2; c <= 51; c++) grafIntSheet.getColumn(c).width = 2.5
    grafIntSheet.getColumn(52).width = 8
    grafIntSheet.getColumn(53).width = 12

    const legRowInt = grafIntSheet.addRow([])
    legRowInt.getCell(52).value = 'Puntaje'
    legRowInt.getCell(52).font = { bold: true, size: 9 }
    legRowInt.getCell(53).value = 'Nivel'
    legRowInt.getCell(53).font = { bold: true, size: 9 }

    const scaleRowInt = grafIntSheet.addRow([])
    scaleRowInt.getCell(1).value = 'ESCALA DE INTERÉS'
    scaleRowInt.getCell(1).font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } }
    scaleRowInt.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26215C' } }
    const marcasInt = { 10: 10, 20: 20, 30: 30, 40: 40, 50: 50 }
    for (let c = 2; c <= 51; c++) {
      scaleRowInt.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26215C' } }
      if (marcasInt[c - 1]) {
        scaleRowInt.getCell(c).value = marcasInt[c - 1]
        scaleRowInt.getCell(c).font = { bold: true, size: 8, color: { argb: 'FFFFFFFF' } }
      }
      scaleRowInt.getCell(c).alignment = { horizontal: 'center' }
    }
    scaleRowInt.height = 16

    intOrdenadas.forEach(([escala, datos]) => {
      const row = grafIntSheet.addRow([])
      row.getCell(1).value = escala
      row.getCell(1).font = { bold: true, size: 10 }
      row.getCell(1).alignment = { vertical: 'middle' }
      row.height = 22

      const puntaje = datos.puntaje
      for (let c = 2; c <= 51; c++) {
        const punto = c - 1
        const thinBorder = { style: 'thin', color: { argb: 'FFE5E7EB' } }
        row.getCell(c).border = {
          top: thinBorder, bottom: thinBorder,
          left: thinBorder, right: thinBorder
        }
        if (punto <= puntaje) {
          row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: getColorForPointInt(punto) } }
        }
      }

      if (puntaje > 0) {
        const lastCol = Math.min(1 + puntaje, 51)
        row.getCell(lastCol).value = puntaje
        row.getCell(lastCol).font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } }
        row.getCell(lastCol).alignment = { horizontal: 'center', vertical: 'middle' }
      }

      row.getCell(52).value = puntaje
      row.getCell(52).font = { bold: true, size: 11 }
      row.getCell(52).alignment = { horizontal: 'center', vertical: 'middle' }

      row.getCell(53).value = datos.nivel
      const nivelColor = NIVEL_COLORS_INT[datos.nivel] || 'FF9CA3AF'
      row.getCell(53).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: nivelColor } }
      row.getCell(53).font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
      row.getCell(53).alignment = { horizontal: 'center', vertical: 'middle' }
    })

    grafIntSheet.addRow([])
    grafIntSheet.addRow([])
    const legTitleGrafInt = grafIntSheet.addRow(['LEYENDA DE ZONAS:'])
    legTitleGrafInt.getCell(1).font = { bold: true, size: 11 }

    const zonasInt = [
      { nombre: 'Muy Alto (41-50)', color: ZONA_COLORS_INT.muyAlto },
      { nombre: 'Alto (31-40)', color: ZONA_COLORS_INT.alto },
      { nombre: 'Medio (21-30)', color: ZONA_COLORS_INT.medio },
      { nombre: 'Bajo (11-20)', color: ZONA_COLORS_INT.bajo },
      { nombre: 'Muy Bajo (1-10)', color: ZONA_COLORS_INT.muyBajo }
    ]

    zonasInt.forEach(zona => {
      const zRow = grafIntSheet.addRow([])
      zRow.getCell(1).value = ''
      zRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zona.color } }
      zRow.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zona.color } }
      zRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zona.color } }
      zRow.getCell(5).value = zona.nombre
      zRow.getCell(5).font = { size: 10 }
    })

  } else if (tipoResultado === 'areas') {
    // Áreas Vocacionales - gráfica por área + subáreas + carreras afines
    const AREA_COLORS = {
      'Preferencias Universitarias': 'FF3498DB',
      'Físico-Matemáticas': 'FFE74C3C',
      'Biológicas': 'FF27AE60',
      'Químicas': 'FF9B59B6',
      'Administrativas': 'FFF39C12',
      'Sociales': 'FF1ABC9C',
      'Humanidades': 'FFE91E63'
    }

    // Carreras por subárea
    const CARRERAS = {"FM":{"Puras":["Licenciatura en Matemáticas","Licenciatura en Física","Licenciatura en Fisicomatemáticos","Ingeniería Física Industrial","Ingeniería en Nanotecnología","Lic. en Física Aplicada","Lic. en Físico","Lic. en Físico Biomédico","Lic. en Matemáticas Aplicadas","Lic. en Matemáticas Educativas","Ingeniería Física","Lic. en Ciencias Físico Matemáticas"],"Artefactos":["Ingeniería en Mecatrónica","Ingeniería en Sonido","Ingeniería en Audio","Ingeniería en Sistemas de Información","Ingeniería en Comunicaciones y Electrónica","Ingeniería Mecánica","Ingeniería Eléctrica","Ingeniero Electricista","Ingeniería en Sistemas Computacionales","Ingeniería en Electrónica y Comunicaciones","Ingeniería en Aeronáutica","Ing. Automotriz","Ingeniería Mecánica Naval","Ingeniería en Sistemas Electrónicos","Ingeniería Mecánica Eléctrica","Ingeniería en Transportes","Ingeniería Biomédica","Ingeniería Biónica","Ingeniería en Video Juegos","Ingeniería en Tecnología de Información"],"Naturaleza":["Ingeniería Geológica","Ingeniería Geológica Marina","Ingeniería Geográfica","Ingeniería Petrolera","Ingeniería en Minas","Ingeniería Hidrológica","Ingeniería en Energía","Ingeniería en Oceanografía","Lic. en Ciencias Atmosféricas","Lic. en Ciencias de la Tierra","Lic. en Geofísica","Lic. en Geología Ambiental","Lic. Geólogo","Lic. en Geoingeniería","Lic. en Geohidrología","Lic. en Hidrología"],"Industria":["Ingeniería Industrial y de Sistemas","Ingeniería Industrial de Procesos","Ingeniería Textil","Ingeniería Industrial","Ingeniería Industrial Administrativa","Lic. en Administración de Operaciones","Ingeniería en Software Industrial","Ingeniería en Gestión y Control de Calidad","Ingeniería en Procesos Organizacionales","Ingeniería en Tecnología de Manufacturas","Ingeniería en Sistemas Logísticos","Lic. en Ciencia de los Materiales"],"Construcción":["Ingeniería Civil","Arquitectura","Ingeniero Urbanista","Ingeniero Civil Arquitecto","Lic. Arquitecto en Planeación","Ingeniero en Planeación y Diseño","Arquitectura y Urbanismo","Ingeniero Civil en Hidráulicas","Ingeniero Civil en Construcción y Estructura","Ingeniero en Edificación","Ingeniería Hidráulica","Ingeniería en Vías Terrestres","Ingeniería Topográfica","Ingeniería Portuaria","Ingeniería Municipal"],"Manejo de datos":["Licenciatura en Actuaría","Lic. en Administración y Actuaría","Lic. en Estadística y Matemática","Licenciatura en Estadística","Lic. en Matemáticas Aplicadas","Actuaría Financiera","Lic. en Calidad y Estadística Aplicada","Lic. en Ciencias en Computación","Lic. en Matemáticas Aplicadas y Computación","Lic. en Matemáticas y Economía"],"Medición Geodésica":["Ingeniería Topográfica y Geodésica","Ingeniería Topográfica e Hidrometría","Ingeniero Topógrafo","Ingeniero Geógrafo","Ingeniero Geodesta","Licenciatura en Geografía","Lic. en Geografía Humana","Lic. en Geoinformática","Lic. en Geomática","Ingeniería Geomática"],"Diseño":["Licenciatura en Diseño Industrial","Ingeniería en Diseño Gráfico","Ingeniería en Innovación y Diseño"]},"B":{"Puras":["Licenciatura en Genómica","Licenciatura en Biología","Licenciatura en Biología Marina","Lic. Biólogo Ecólogo","Biólogo Científico en Botánica","Biólogo Científico en Microbiología","Biólogo Científico en Biofísica","Ingeniería en Biotecnología","Ingeniería en Nanotecnología","Lic. en Biología Experimental","Lic. Biólogo","Lic. Bioquímico","Lic. en Ciencias Biológicas","Lic. en Ciencias Genómicas","Lic. en Ecología","Lic. en Genética","Lic. en Molecular","Lic. en Neurobiología","Lic. en Recursos Naturales"],"Salud Humana":["Licenciatura en Farmacia","Licenciatura en Enfermería","Medicina","Médico Cirujano","Médico Estomatólogo","Medicina Homeopática","Licenciatura en Odontología","Licenciatura en Optometría","Licenciatura en Homeopatía","Licenciatura en Nutrición","Licenciatura en Terapia Física","Licenciatura en Rehabilitación Física","Licenciatura en Cultura Física y del Deporte","Licenciatura en Gerontología","Licenciatura en Biomedicina","Licenciatura en Fisioterapia","Licenciatura en Neurociencias","Ingeniería Biomédica","Lic. en Ciencias Farmacéuticas"],"Salud Animal":["Médico Veterinario y Zootecnista","Ingeniero Zootecnista","Lic. en Producción Animal","Lic. en Producción Animal Tropical","Lic. en Producción Pecuaria","Lic. en Reproducción Bovina","Lic. en Zootecnia","Lic. en Zootecnista Administrador"],"Terrestre":["Ingeniería Agronómica","Ingeniería Agronómica Zootecnista","Ingeniero Agrónomo","Ingeniero Agrónomo en Producción","Ingeniero Agrónomo Administrador","Ingeniero Agrónomo Parasitólogo","Ingeniero Fitosanitario","Ingeniero Fitotecnista","Ingeniero Agroindustrial","Licenciado en Horticultura","Ingeniero Hortícola","Licenciado en Agroecología","Lic. en Administración de Agronegocios","Lic. en Agronegocios","Lic. en Agronomía","Lic. en Desarrollo Rural"],"Silvícola":["Ingeniería en Tecnología de la Madera","Ingeniería Forestal","Guardia Forestal","Licenciado en Sistemas Forestales","Ingeniero Forestal en Sistemas de Producción","Ingeniería Silvícola","Ingeniero Agrónomo en Bosques","Lic. en Ciencias Forestales","Ingeniería en Restauración Forestal","Ingeniería en Manejo de Recursos Naturales","Lic. en Silvicultura y Manejo Forestal"],"Ambientalista":["Ingeniería Ambiental","Ingeniero Civil Ambiental","Ingeniería en Biosistemas","Lic. en Desarrollo Sustentable","Licenciatura en Ecología","Ing. en Recursos Renovables","Ingeniería Agrícola Ambiental","Lic. en Ciencias Ambientales","Lic. en Ciencias de la Sostenibilidad","Lic. en Gestión Ambiental","Ingeniería en Sistemas Ambientales","Ingeniería en Tecnología Ambiental","Lic. en Sustentabilidad Ambiental"],"Marítima":["Biología Marina","Biólogo Pesquero Marino","Biólogo Pesquero","Ingeniería en Tecnología de Alimentos Marinos","Ingeniería en Acuicultura","Ingeniero en Sistemas Acuáticos","Ingeniero en Pesca Industrial","Oceanólogo","Ingeniero Químico Oceanólogo","Ingeniero Pesquero","Lic. Acuacultor","Lic. en Ciencias Marítimas","Lic. en Hidrobiología","Lic. en Oceanografía","Lic. en Ecología Marina"]},"Q":{"Puras":["Ingeniería en Nanotecnología","Licenciatura en Ciencias Química","Lic. en Analítica","Licenciatura en Química","Lic. Químico","Lic. en Química Orgánica","Lic. en Química Industrial"],"Inorgánicas":["Ingeniería Química De Procesos","Ingeniería Química Administrativa","Ingeniería Química Metalúrgica","Ingeniería Químico Industrial","Químico Metalúrgico","Ingeniero Geoquímico"],"Org. Bioq. Alimentos":["Bioquímica en Alimentos","Ingeniería en Bioquímica","Ingeniería Bioquímica Administrador en Servicios Alimentarios","Químico Farmacéutico Biólogo en Alimentos","Bioqu ímico en Procesado de Alimentos","Lic. en Química de los Alimentos","Ingeniero en Industrias Alimentarias","Ingeniero Bioquímico en Productos Naturales","Ingeniero Bioquímico","Ingeniería en Procesos Químicos Alimentarios","Lic. en Alimentos","Lic. en Bromatología"],"Org. Bioq. Farmacología":["Química Fármaco-Biológica","Química Farmacéutica Biológica","Químico Farmaco-biólogo en Farmacia Clínica","Lic. en Farmacia Clínica","Lic. en Farmacia Industrial","Lic. Químico Farmacéutico","Lic. en Ciencias Farmacéuticas","Lic. Químico Farmacéutico Biólogo"],"Químicas Agrícolas":["Química Agrícola","Ingeniería Química en Agroindustria","Lic. Agroquímico","Lic. Químico Agrícola","Lic. Químico Biólogo Agropecuario"],"Org. Petroquímico Industrial":["Ingeniería Química Petrolera","Ingeniería Química de Procesos Petroquímicos","Ingeniería Química de Procesos","Ingeniería Química Industrial","Ingeniería Química Administrativa","Lic. en Orgánica"],"Org. Bioq. Clínica":["Lic. en Ciencias Químicas","Químico Clínico","Químico Parasitólogo","Lic. Químico Clínico","Químico Biólogo en Análisis Clínicos","Lic. en Química en Análisis Clínicos","Químico Biólogo Parasitólogo","Ingeniero Bioquímico","Lic. en Análisis Clínicos","Lic. Bacteriólogo Parasitólogo","Lic. en Microbiología","Lic. Químico Biólogo"]},"A":{"Rec. Instrumentales":["Lic. en Informática","Lic. en Computación","Lic. en Computación Administrativa","Lic. Analista Programador","Lic. en Ciencias de la Información","Lic. en Sistema de Computación","Ing. en Computación Financiera","Ing. en Seguridad Computacional","Lic. en Administración de Tecnología de la Información","Ing. en Software","Transformación Digital de Negocios","Lic. en Ciencias de la Informática","Ingeniería en Informática","Ingeniería en Sistemas Computacionales"],"Rec. Financieros":["Lic. en Contaduría Pública","Lic. en Administración Financiera","Lic. en Economía","Lic. en Banca y Finanzas","Lic. en Administración Bancaria y Finanzas","Lic. en Auditoría","Lic. en Auditoría Gubernamental","Lic. en Contabilidad","Lic. en Contabilidad Financiera","Lic. en Contabilidad y Finanzas","Lic. en Dirección Financiera","Lic. en Economía Financiera","Lic. en Finanzas y Banca","Lic. en Impuestos","Lic. en Valuación"],"Rec. Humanos":["Lic. Administración de Empresas","Lic. Relaciones Industriales","Lic. Administración de Personal","Lic. en Administración Pública y Ciencias Políticas","Lic. en Recursos Humanos","Lic. en Psicología Organizacional","Lic. en Administración del Capital Humano","Lic. en Desarrollo de Personal en las Empresas","Lic. en Desarrollo Organizacional","Lic. en Relaciones Laborales"],"Rec. Comerciales":["Lic. en Logística Empresarial","Lic. en Logística Internacional","Lic. en Mercadotecnia","Lic. en Administración y Mercadotecnia","Lic. en Relaciones Comerciales","Lic. en Comercio Exterior/Internacional","Lic. en Publicidad","Lic. en Comercio Electrónico","Lic. en Comercio y Negocios Internacionales","Lic. en Mercadotecnia Estratégica","Lic. en Mercadotecnia Internacional","Lic. en Mercadotecnia y Publicidad","Lic. en Negocios Internacionales"],"Rec. Turísticos":["Lic. en Administración y Negocios Gastronómicos","Lic. en Gastronomía","Lic. en Turismo y Empresas Turísticas","Lic. en Administración de Hoteles","Lic. en Administración de Eventos","Lic. en Turismo Cultural","Lic. en Hotelería y Turismo","Lic. en Administración de Bares y Restaurantes","Lic. en Gestión Turística","Lic. en Turismo"],"Rec. Públicos":["Lic. en Administración Pública","Lic. en Administración de Empresas Públicas","Lic. en Administración Pública y Ciencias Políticas","Lic. en Ciencias Políticas","Lic. en Ciencias Políticas y Administración Pública","Lic. en Gerencia Pública","Lic. en Gestión Pública","Lic. en Gobierno","Lic. en Gobierno y Administración Pública","Lic. en Políticas Públicas"],"Rec. Educativos":["Lic. en Administración Educativa","Lic. en Planeación y Administración de la Educación","Lic. en Ciencias de la Comunicación Educativa","Lic. en Desarrollo Educativo Institucional","Lic. en Innovación Educativa","Lic. en Intervención Educativa","Lic. en Pedagogía","Lic. en Psicología Educativa","Lic. en Sociología de la Educación","Lic. en Tecnología Educativa"],"Rec. Agrícolas":["Lic. en Administración de Empresas Agrícolas/Agronegocios","Lic. en Administración Agropecuaria","Lic. en Administración Agrícola","Lic. en Administración Agroindustrias","Lic. en Planeación para el desarrollo Agropecuario","Ingeniero Agrónomo Administrador"],"Rec. Mineros":["Lic. en Administración de Empresas Mineras","Lic. en Administración de Empresas"]},"S":{"Principios y Leyes":["Lic. en Sociología","Lic. en Antropología Social","Lic. en Ciencias Sociales","Lic. en Sociología Rural","Lic. en Antropología Social de la Educación","Lic. en Sociología del Trabajo","Lic. en Estudios Humanísticos y Sociales","Lic. en Desarrollo Regional","Lic. en Desarrollo de Comunidades Indígenas","Lic. en Geografía","Lic. en Antropología","Lic. en Ciencias Sociales y Humanidades","Lic. en Demografía","Lic. en Estudios Latinoamericanos","Lic. en Etnología"],"Rel. Asistencial":["Lic. en Trabajo Social","Lic. en Ciencia de la Comunidad","Lic. en Trabajo Social Escolar","Lic. en Trabajo Social Penitenciario","Lic. en Trabajo Social Médico","Lic. en Desarrollo Comunitario"],"Rel. Existencial":["Lic. en Ciencias de la Familia","Lic. en Relaciones Familiares","Lic. en Psicología","Lic. en Psicología Organizacional","Lic. en Criminología","Psicólogo Orientador","Lic. en Psicología Infantil","Lic. en Psicología Clínica","Lic. en Psicología Experimental","Lic. en Desarrollo Humano","Lic. en Psicología Educativa","Lic. en Psicología Social","Lic. en Psicoterapia Psicoanalítica","Lic. en Relaciones Humanas"],"Rel. Legal":["Lic. en Derecho","Lic. en Ciencias Políticas y Administración Pública","Abogado y Notario Público","Lic. en Derecho Político","Lic. en Derecho Laboral","Lic. en Derecho Financiero","Lic. en Derecho Mercantil","Lic. en Derecho y Ciencias Sociales","Lic. en Ciencias Políticas","Lic. en Gobierno y Políticas Públicas","Lic. en Relaciones Internacionales","Lic. en Seguridad Pública","Lic. en Criminología y Criminalística","Lic. en Derecho Corporativo"],"Rel. Educacional":["Lic. en Pedagogía","Lic. en Psicopedagogía","Lic. en Ciencias de La Educación","Lic. en Educación Preescolar","Lic. en Educación Primaria/Secundaria","Lic. en Educación Física y Deporte","Licenciado Normalista","Licenciado en Tecnología Educativa","Licenciado en Educación Especial","Licenciado en Docencia","Lic. en Intervención Educativa","Lic. en Innovación Educativa"],"Rel. Interhumana":["Lic. en Relaciones Públicas","Lic. en Relaciones Humanas","Lic. en Administración del Tiempo Libre","Lic. en Comunicación Humana","Lic. en Comunicación Organizacional","Lic. en Comunicación Turística","Lic. en Gastronomía","Lic. en Relaciones Públicas e Idiomas","Lic. en Clima Organizacional","Lic. en Comunicación y Relaciones Públicas"]},"H":{"Humanidades":["Lic. en Filosofía","Lic. en Teología","Lic. en Ciencias Humanas","Lic. en Humanidades y Filosofía","Lic. en Religión","Lic. en Ciencias Teológica","Lic. en Humanidades","Lic. en Humanidades y Ciencias Sociales"],"Expresión Oral":["Lic. en Artes Escénicas","Lic. en Teatro","Dramaturgia","Dirección Teatral","Actuación","Lic. en Cine y Televisión","Lic. en Comunicación","Lic. en Ciencias de la Comunicación","Lic. en Comunicación Audiovisual","Lic. en Comunicación Social","Lic. en Periodismo y Comunicación","Lic. en Producción de Televisión","Lic. en Televisión"],"Expresión Escrita":["Lic. en Letras Españolas","Lic. en Literatura Iberoamericana","Lic. en Letras Inglesas","Lic. en Lingüística","Lic. en Periodismo y Comunicación Colectiva","Lic. en Lengua y Literatura Modernas","Lic. en Letras Latinoamericanas","Lic. en Lingüística Aplicada","Lic. en Creación Literaria","Lic. en Periodismo"],"Expresión Plástica":["Lic. en Artes Visuales","Escenógrafo","Lic. en Artes en Fotografía","Lic. en Escultura y Grabado","Lic. en Pintura","Lic. en Diseño de Modas","Lic. en Diseño de Interiores","Lic. en Escultura","Lic. en Dibujo Publicitario","Lic. en Artesanías","Lic. en Diseño Gráfico","Arquitectura","Paisajismo","Diseño Industrial","Lic. en Artes Plásticas","Lic. en Diseño y Comunicación Visual"],"Expresión Corporal":["Lic. en Danza Moderna","Lic. en Danza Clásica","Lic. en Artes de Danza Contemporánea","Lic. en Danza Folklórica","Lic. en Coreografía","Folklorista","Lic. en Ciencias del Deporte","Lic. en Cultura Física y Deporte","Lic. en Actividad Física y Deportes","Lic. en Entrenamiento Deportivo"],"Expresión Auditiva":["Ingeniería en Sonido","Licenciatura en Piano","Lic. en Producción de Música","Licenciatura en Canto","Licenciado en Musicología","Licenciado en Etnomúsica","Licenciatura en Composición","Licenciatura en Laudería","Licenciatura en Instrumentación","Lic. en Música y Dir. de Coros","Lic. en Artes Musicales"],"Complementación":["Lic. en Ciencias de la Comunicación","Lic. en Ciencias de la Comunicación en Televisión","Lic. en Ciencias de la Comunicación en Cine","Lic. en Ciencias de la Información","Lic. en Comunicación y Medios Digitales","Lic. en Publicidad e Imagen","Lic. en Publicidad y Relaciones Públicas","Lic. en Periodismo y Medios de Información"],"Idiomas":["Lic. en Interpretación y Traducción","Lic. en Traducción Simultánea","Lic. en Traducción","Lic. en Lenguas y Literatura Inglesa","Lic. en Lenguas Extranjeras","Lic. en Lenguas Modernas","Lic. en Idiomas"],"Combinación":["Arqueología","Lic. en Antropología Física","Licenciatura en Historia","Licenciado en Etnolingüística","Licenciado en Etnología","Lic. en Antropología Cultural","Lic. en Antropología de la Educación","Lic. en Arte y Patrimonio Cultural","Lic. en Restauración y Museos","Historia del Arte","Lic. en Antropología Histórica","Lic. en Etnohistoria","Lic. en Museología y Curaduría"],"Cuidado Cultural":["Licenciatura en Biblioteconomía","Licenciatura en Archivonomía","Lic. en Bibliotecología","Lic. en Bibliotecología e Información","Lic. en Bibliotecología y Estudios de la Información","Lic. en Ciencias de la Información Documental","Lic. en Estudios de la Información"]}}

    // Mapa de area nombre -> area key para buscar carreras
    const AREA_KEY_MAP = {
      'Preferencias Universitarias': 'PU',
      'Físico-Matemáticas': 'FM',
      'Biológicas': 'B',
      'Químicas': 'Q',
      'Administrativas': 'A',
      'Sociales': 'S',
      'Humanidades': 'H'
    }

    const areasOrdenadas = Object.entries(respuestas).sort((a, b) => b[1].porcentaje - a[1].porcentaje)
    const fecha = new Date().toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' })

    // Colores por zona (mismo estilo que aptitudes/intereses)
    const ZONA_COLORS_AREAS = {
      muyBajo: 'FFEF4444',   // Rojo (0-20%)
      bajo: 'FFF97316',       // Naranja (21-40%)
      medio: 'FFFBBF24',      // Amarillo (41-60%)
      alto: 'FF22C55E',       // Verde (61-80%)
      muyAlto: 'FF1E40AF'     // Azul (81-100%)
    }
    const getColorForPercent = (p) => {
      if (p <= 20) return ZONA_COLORS_AREAS.muyBajo
      if (p <= 40) return ZONA_COLORS_AREAS.bajo
      if (p <= 60) return ZONA_COLORS_AREAS.medio
      if (p <= 80) return ZONA_COLORS_AREAS.alto
      return ZONA_COLORS_AREAS.muyAlto
    }

    // ===== HOJA 1: RESUMEN GENERAL CON GRÁFICA =====
    const resSheet = workbook.addWorksheet('Resumen General')
    resSheet.addRow(['TEST DE ÁREAS VOCACIONALES - RESUMEN'])
    resSheet.getRow(1).font = { bold: true, size: 16, color: { argb: 'FF26215C' } }
    resSheet.mergeCells('A1:BB1')
    resSheet.addRow([`Nombre: ${nombre}`])
    resSheet.getRow(2).font = { size: 11, color: { argb: 'FF6B7280' } }
    resSheet.addRow([`Fecha: ${fecha}`])
    resSheet.getRow(3).font = { size: 11, color: { argb: 'FF6B7280' } }
    resSheet.addRow([])

    resSheet.getColumn(1).width = 30
    for (let c = 2; c <= 51; c++) resSheet.getColumn(c).width = 2.5
    resSheet.getColumn(52).width = 10

    // Escala
    const resScale = resSheet.addRow([])
    resScale.getCell(1).value = 'ÁREA'
    resScale.getCell(1).font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } }
    resScale.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26215C' } }
    const porcMarcas = { 10: '20%', 20: '40%', 30: '60%', 40: '80%', 50: '100%' }
    for (let c = 2; c <= 51; c++) {
      resScale.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26215C' } }
      if (porcMarcas[c - 1]) {
        resScale.getCell(c).value = porcMarcas[c - 1]
        resScale.getCell(c).font = { bold: true, size: 8, color: { argb: 'FFFFFFFF' } }
      }
      resScale.getCell(c).alignment = { horizontal: 'center' }
    }
    resScale.getCell(52).value = '%'
    resScale.getCell(52).font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } }
    resScale.getCell(52).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26215C' } }
    resScale.height = 16

    areasOrdenadas.forEach(([area, datos]) => {
      const row = resSheet.addRow([])
      row.getCell(1).value = area
      row.getCell(1).font = { bold: true, size: 10 }
      row.height = 22
      const porc = datos.porcentaje
      // 50 celdas = 100%, cada celda = 2%
      const celdas = Math.round(porc / 2)
      for (let c = 2; c <= 51; c++) {
        const tb = { style: 'thin', color: { argb: 'FFE5E7EB' } }
        row.getCell(c).border = { top: tb, bottom: tb, left: tb, right: tb }
        if (c - 1 <= celdas) {
          // Color según la zona del porcentaje acumulado
          const porcAcum = (c - 1) * 2
          row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: getColorForPercent(porcAcum) } }
        }
      }
      if (celdas > 0) {
        const lc = Math.min(1 + celdas, 51)
        row.getCell(lc).value = porc + '%'
        row.getCell(lc).font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } }
        row.getCell(lc).alignment = { horizontal: 'center', vertical: 'middle' }
      }
      row.getCell(52).value = porc + '%'
      row.getCell(52).font = { bold: true, size: 11 }
      row.getCell(52).alignment = { horizontal: 'center', vertical: 'middle' }
    })

    // ===== HOJAS POR ÁREA: gráfica de subáreas + carreras =====
    areasOrdenadas.forEach(([area, datos]) => {
      if (!datos.subareas) return // PU no tiene subáreas detalladas

      const areaKey = AREA_KEY_MAP[area]
      if (!areaKey || !CARRERAS[areaKey]) return

      const areaColor = AREA_COLORS[area] || 'FF534AB7'
      const sheetName = area.length > 28 ? area.substring(0, 28) : area
      const sheet = workbook.addWorksheet(sheetName)

      // Título
      sheet.addRow([`${area.toUpperCase()} - SUBÁREAS`])
      sheet.getRow(1).font = { bold: true, size: 14, color: { argb: areaColor.replace('FF', 'FF') } }
      sheet.mergeCells('A1:L1')
      sheet.addRow([`Nombre: ${nombre} | Porcentaje general: ${datos.porcentaje}%`])
      sheet.getRow(2).font = { size: 11, color: { argb: 'FF6B7280' } }
      sheet.addRow([])

      // Gráfica de subáreas (50 celdas, colores por zona)
      sheet.getColumn(1).width = 28
      for (let c = 2; c <= 51; c++) sheet.getColumn(c).width = 2.5
      sheet.getColumn(52).width = 10

      const scaleRow = sheet.addRow([])
      scaleRow.getCell(1).value = 'SUBÁREA'
      scaleRow.getCell(1).font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } }
      scaleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: areaColor } }
      for (let c = 2; c <= 51; c++) {
        scaleRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: areaColor } }
        if (porcMarcas[c - 1]) {
          scaleRow.getCell(c).value = porcMarcas[c - 1]
          scaleRow.getCell(c).font = { bold: true, size: 8, color: { argb: 'FFFFFFFF' } }
        }
        scaleRow.getCell(c).alignment = { horizontal: 'center' }
      }
      scaleRow.getCell(52).value = '%'
      scaleRow.getCell(52).font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } }
      scaleRow.getCell(52).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: areaColor } }
      scaleRow.height = 16

      // Subáreas ordenadas por porcentaje
      const subsOrdenadas = Object.entries(datos.subareas).sort((a, b) => b[1].porcentaje - a[1].porcentaje)

      subsOrdenadas.forEach(([sub, subDatos]) => {
        const row = sheet.addRow([])
        row.getCell(1).value = sub
        row.getCell(1).font = { bold: true, size: 10 }
        row.height = 22
        const porc = subDatos.porcentaje
        const celdas = Math.round(porc / 2)
        for (let c = 2; c <= 51; c++) {
          const tb = { style: 'thin', color: { argb: 'FFE5E7EB' } }
          row.getCell(c).border = { top: tb, bottom: tb, left: tb, right: tb }
          if (c - 1 <= celdas) {
            const porcAcum = (c - 1) * 2
            row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: getColorForPercent(porcAcum) } }
          }
        }
        if (celdas > 0) {
          const lc = Math.min(1 + celdas, 51)
          row.getCell(lc).value = porc + '%'
          row.getCell(lc).font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } }
          row.getCell(lc).alignment = { horizontal: 'center', vertical: 'middle' }
        }
        row.getCell(52).value = porc + '%'
        row.getCell(52).font = { bold: true, size: 11 }
        row.getCell(52).alignment = { horizontal: 'center', vertical: 'middle' }
      })

      // Carreras afines - top 3 subáreas
      sheet.addRow([])
      sheet.addRow([])
      const carTitle = sheet.addRow(['CARRERAS AFINES (basadas en tus subáreas más altas)'])
      carTitle.getCell(1).font = { bold: true, size: 12, color: { argb: areaColor.replace('FF', 'FF') } }
      sheet.mergeCells(`A${carTitle.number}:L${carTitle.number}`)
      sheet.addRow([])

      // Mostrar carreras de las top 3 subáreas
      const topSubs = subsOrdenadas.slice(0, 3)
      topSubs.forEach(([sub, subDatos]) => {
        const carreras = CARRERAS[areaKey][sub]
        if (!carreras || carreras.length === 0) return

        const subTitle = sheet.addRow([`${sub} (${subDatos.porcentaje}%)`])
        subTitle.getCell(1).font = { bold: true, size: 11 }
        subTitle.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: areaColor + '30' } }

        carreras.forEach(carrera => {
          const cRow = sheet.addRow(['  • ' + carrera])
          cRow.getCell(1).font = { size: 10, color: { argb: 'FF374151' } }
        })
        sheet.addRow([])
      })
    })

  } else if (tipoResultado === 'razonamiento') {
    const NIVEL_COLORS_RAZ = {
      'Muy Alto': 'FF1E40AF',
      'Alto': 'FF22C55E',
      'Medio Alto': 'FF38BDF8',
      'Medio': 'FFFBBF24',
      'Medio Bajo': 'FFF97316',
      'Bajo': 'FFEF4444',
      'Muy Bajo': 'FFDC2626'
    }

    const getNivelRaz = (centil) => {
      if (centil >= 90) return 'Muy Alto'
      if (centil >= 75) return 'Alto'
      if (centil >= 60) return 'Medio Alto'
      if (centil >= 40) return 'Medio'
      if (centil >= 25) return 'Medio Bajo'
      if (centil >= 10) return 'Bajo'
      return 'Muy Bajo'
    }

    const datosPersonalesRaz = datosPersonales || {}

    // Ordenar secciones por centil descendente
    const seccionesOrdenadas = Object.entries(respuestas).sort((a, b) => (b[1].centil || 0) - (a[1].centil || 0))

    // ===== HOJA 1: RESUMEN =====
    const razSheet = workbook.addWorksheet('Razonamiento')
    razSheet.addRow(['TEST DE RAZONAMIENTO - DAT-5'])
    razSheet.getRow(1).font = titleFont
    razSheet.mergeCells('A1:G1')
    razSheet.addRow([])
    razSheet.addRow(['Nombre:', nombre])
    razSheet.addRow(['Sexo:', datosPersonalesRaz.sexo || ''])
    razSheet.addRow(['Nivel educativo:', datosPersonalesRaz.nivel || ''])
    razSheet.addRow(['Fecha:', new Date().toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' })])
    razSheet.addRow([])

    const razHdr = razSheet.addRow(['Sección', 'PD (Correctas)', 'Total', 'Respondidas', 'Centil', 'Nivel', 'Porcentaje'])
    razHdr.fill = headerFill
    razHdr.font = headerFont
    razSheet.getColumn(1).width = 32
    razSheet.getColumn(2).width = 16
    razSheet.getColumn(3).width = 10
    razSheet.getColumn(4).width = 14
    razSheet.getColumn(5).width = 10
    razSheet.getColumn(6).width = 14
    razSheet.getColumn(7).width = 14

    seccionesOrdenadas.forEach(([key, datos]) => {
      const centil = datos.centil != null ? datos.centil : datos.porcentaje
      const nivel = getNivelRaz(centil)
      const row = razSheet.addRow([datos.nombre, datos.correctas, datos.totalPreguntas, datos.respondidas, centil, nivel, datos.porcentaje + '%'])
      row.getCell(1).font = { bold: true }
      const nivelColor = NIVEL_COLORS_RAZ[nivel]
      if (nivelColor) {
        row.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: nivelColor } }
        row.getCell(6).font = { bold: true, color: { argb: 'FFFFFFFF' } }
      }
    })

    // Total general
    const totalCorrectasRaz = seccionesOrdenadas.reduce((acc, [, d]) => acc + d.correctas, 0)
    const totalPreguntasRaz = seccionesOrdenadas.reduce((acc, [, d]) => acc + d.totalPreguntas, 0)
    const totalPorcRaz = totalPreguntasRaz > 0 ? Math.round((totalCorrectasRaz / totalPreguntasRaz) * 100) : 0
    const centilPromedio = Math.round(seccionesOrdenadas.reduce((acc, [, d]) => acc + (d.centil || 0), 0) / seccionesOrdenadas.length)
    razSheet.addRow([])
    const totalRow = razSheet.addRow(['TOTAL GENERAL', totalCorrectasRaz, totalPreguntasRaz, '', centilPromedio, getNivelRaz(centilPromedio), totalPorcRaz + '%'])
    totalRow.font = { bold: true, size: 12 }
    totalRow.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NIVEL_COLORS_RAZ[getNivelRaz(centilPromedio)] } }
    totalRow.getCell(6).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } }

    // ===== HOJA 2: GRÁFICA =====
    const grafRazSheet = workbook.addWorksheet('Gráfica Razonamiento')
    grafRazSheet.addRow(['GRÁFICA DE RAZONAMIENTO - DAT-5'])
    grafRazSheet.getRow(1).font = { bold: true, size: 16, color: { argb: 'FF26215C' } }
    grafRazSheet.mergeCells('A1:M1')
    grafRazSheet.addRow([`Nombre: ${nombre}  |  Sexo: ${datosPersonalesRaz.sexo || ''}  |  Nivel: ${datosPersonalesRaz.nivel || ''}`])
    grafRazSheet.getRow(2).font = { size: 11, color: { argb: 'FF6B7280' } }
    grafRazSheet.addRow([])

    grafRazSheet.getColumn(1).width = 32
    for (let c = 2; c <= 51; c++) grafRazSheet.getColumn(c).width = 2.5
    grafRazSheet.getColumn(52).width = 10
    grafRazSheet.getColumn(53).width = 12

    // Escala (centil: 50 celdas = centil 99, cada celda ≈ 2)
    const scaleRowRaz = grafRazSheet.addRow([])
    scaleRowRaz.getCell(1).value = 'SECCIÓN'
    scaleRowRaz.getCell(1).font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } }
    scaleRowRaz.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26215C' } }
    const centilMarcas = { 5: '10', 10: '20', 13: '25', 15: '30', 20: '40', 25: '50', 30: '60', 38: '75', 40: '80', 45: '90', 50: '99' }
    for (let c = 2; c <= 51; c++) {
      const idx = c - 1
      scaleRowRaz.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26215C' } }
      if (centilMarcas[idx]) {
        scaleRowRaz.getCell(c).value = centilMarcas[idx]
        scaleRowRaz.getCell(c).font = { bold: true, size: 7, color: { argb: 'FFFFFFFF' } }
      }
      scaleRowRaz.getCell(c).alignment = { horizontal: 'center' }
    }
    scaleRowRaz.getCell(52).value = 'Centil'
    scaleRowRaz.getCell(52).font = { bold: true, size: 9 }
    scaleRowRaz.getCell(53).value = 'Nivel'
    scaleRowRaz.getCell(53).font = { bold: true, size: 9 }
    scaleRowRaz.height = 16

    const ZONA_COLORS_RAZ = {
      muyBajo: 'FFDC2626', bajo: 'FFEF4444', medioBajo: 'FFF97316',
      medio: 'FFFBBF24', medioAlto: 'FF38BDF8', alto: 'FF22C55E', muyAlto: 'FF1E40AF'
    }
    const getColorForCentil = (c) => {
      if (c <= 10) return ZONA_COLORS_RAZ.muyBajo
      if (c <= 25) return ZONA_COLORS_RAZ.bajo
      if (c <= 40) return ZONA_COLORS_RAZ.medioBajo
      if (c <= 60) return ZONA_COLORS_RAZ.medio
      if (c <= 75) return ZONA_COLORS_RAZ.medioAlto
      if (c <= 90) return ZONA_COLORS_RAZ.alto
      return ZONA_COLORS_RAZ.muyAlto
    }

    seccionesOrdenadas.forEach(([key, datos]) => {
      const centil = datos.centil != null ? datos.centil : datos.porcentaje
      const row = grafRazSheet.addRow([])
      row.getCell(1).value = datos.nombre
      row.getCell(1).font = { bold: true, size: 10 }
      row.getCell(1).alignment = { vertical: 'middle' }
      row.height = 22

      const celdas = Math.round(centil / 2) // 50 celdas = centil 99
      for (let c = 2; c <= 51; c++) {
        const idx = c - 1
        const centilPunto = idx * 2
        const thinBorder = { style: 'thin', color: { argb: 'FFE5E7EB' } }
        row.getCell(c).border = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }
        if (idx <= celdas) {
          row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: getColorForCentil(centilPunto) } }
        }
      }

      if (celdas > 0) {
        const lastCol = Math.min(1 + celdas, 51)
        row.getCell(lastCol).value = centil
        row.getCell(lastCol).font = { bold: true, size: 8, color: { argb: 'FFFFFFFF' } }
        row.getCell(lastCol).alignment = { horizontal: 'center', vertical: 'middle' }
      }

      row.getCell(52).value = centil
      row.getCell(52).font = { bold: true, size: 11 }
      row.getCell(52).alignment = { horizontal: 'center', vertical: 'middle' }

      const nivel = getNivelRaz(centil)
      row.getCell(53).value = nivel
      const nivelColor = NIVEL_COLORS_RAZ[nivel] || 'FF9CA3AF'
      row.getCell(53).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: nivelColor } }
      row.getCell(53).font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
      row.getCell(53).alignment = { horizontal: 'center', vertical: 'middle' }
    })

    // Leyenda
    grafRazSheet.addRow([])
    grafRazSheet.addRow([])
    const legTitleRaz = grafRazSheet.addRow(['LEYENDA DE NIVELES:'])
    legTitleRaz.getCell(1).font = { bold: true, size: 11 }
    const zonasRaz = [
      { nombre: 'Muy Alto (centil 90-99)', color: ZONA_COLORS_RAZ.muyAlto },
      { nombre: 'Alto (centil 75-89)', color: ZONA_COLORS_RAZ.alto },
      { nombre: 'Medio Alto (centil 60-74)', color: ZONA_COLORS_RAZ.medioAlto },
      { nombre: 'Medio (centil 40-59)', color: ZONA_COLORS_RAZ.medio },
      { nombre: 'Medio Bajo (centil 25-39)', color: ZONA_COLORS_RAZ.medioBajo },
      { nombre: 'Bajo (centil 10-24)', color: ZONA_COLORS_RAZ.bajo },
      { nombre: 'Muy Bajo (centil 1-9)', color: ZONA_COLORS_RAZ.muyBajo }
    ]
    zonasRaz.forEach(zona => {
      const zRow = grafRazSheet.addRow([])
      zRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zona.color } }
      zRow.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zona.color } }
      zRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zona.color } }
      zRow.getCell(5).value = zona.nombre
      zRow.getCell(5).font = { size: 10 }
    })

  } else {
    // Genérico
    const genSheet = workbook.addWorksheet('Respuestas')
    genSheet.columns = [
      { header: 'Pregunta', key: 'pregunta', width: 50 },
      { header: 'Respuesta', key: 'respuesta', width: 30 }
    ]
    const genHeaderRow = genSheet.getRow(1)
    genHeaderRow.fill = headerFill
    genHeaderRow.font = headerFont

    Object.entries(respuestas).forEach(([pregunta, respuesta]) => {
      genSheet.addRow({ pregunta, respuesta })
    })
  }

  return workbook.xlsx.writeBuffer()
}

// Enviar resultados de tests por correo con archivo Excel adjunto
app.post('/api/enviar-resultados', async (req, res) => {
  try {
    const { email, nombre, testNombre, respuestas, modalidad, tipoResultado, datosPersonales } = req.body

    // Generar archivo Excel
    const excelBuffer = await generarExcel({ nombre, email, modalidad, testNombre, respuestas, tipoResultado, datosPersonales })

    const fecha = new Date().toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' }).replace(/\//g, '-')
    const nombreArchivo = `Resultados_${testNombre.replace(/\s+/g, '_')}_${nombre.replace(/\s+/g, '_')}_${fecha}.xlsx`

    const mailOptions = {
      from: `"APROVA Tests" <${process.env.GMAIL_USER}>`,
      to: process.env.EMAIL_DESTINO,
      subject: `Nuevos resultados de test: ${testNombre} - ${nombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #534AB7; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">APROVA</h1>
            <p style="margin: 5px 0 0;">Resultados de Test Psicométrico</p>
          </div>

          <div style="padding: 20px; background: #f5f5f5;">
            <h2 style="color: #26215C; margin-top: 0;">Información del participante</h2>
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Modalidad:</strong> ${modalidad === 'modalidad2' ? 'Tests + Asesoría Virtual' : 'Solo Tests'}</p>
            <p><strong>Test completado:</strong> ${testNombre}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</p>
          </div>

          <div style="padding: 20px;">
            <p style="font-size: 16px;">Los resultados detallados se encuentran en el <strong>archivo Excel adjunto</strong>.</p>
          </div>

          <div style="background: #26215C; color: #AFA9EC; padding: 15px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">Este correo fue generado automáticamente por el sistema de tests de APROVA.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: nombreArchivo,
          content: excelBuffer,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      ]
    }

    await transporter.sendMail(mailOptions)

    console.log(`Resultados enviados con Excel: ${testNombre} - ${nombre}`)
    res.json({ success: true, message: 'Resultados enviados correctamente' })
  } catch (error) {
    console.error('Error al enviar resultados:', error)
    res.status(500).json({ error: 'Error al enviar los resultados' })
  }
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Servidor APROVA corriendo en puerto ${PORT}`)
})
