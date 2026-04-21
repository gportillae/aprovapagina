import './Privacidad.css'

function Privacidad() {
  return (
    <div className="legal-page">
      <section className="legal-hero">
        <h1>Aviso de Privacidad</h1>
        <p>Última actualización: Abril 2026</p>
      </section>

      <section className="legal-content">
        <div className="legal-body">
          <h2>1. Identidad del responsable</h2>
          <p>
            APROVA Orientación Vocacional (en adelante "APROVA"), con domicilio en la ciudad de
            Aguascalientes, Aguascalientes, México, es responsable del tratamiento de los datos
            personales que nos proporcione, los cuales serán protegidos conforme a lo dispuesto por
            la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)
            y demás normatividad aplicable.
          </p>

          <h2>2. Datos personales que recabamos</h2>
          <p>Para las finalidades señaladas en este aviso, podemos recabar los siguientes datos personales:</p>
          <ul>
            <li>Nombre completo</li>
            <li>Correo electrónico</li>
            <li>Número telefónico</li>
            <li>Ciudad de residencia</li>
            <li>Edad y nivel educativo</li>
            <li>Resultados de tests psicométricos</li>
            <li>Información de pago (procesada por Stripe, Inc.)</li>
          </ul>

          <h2>3. Finalidades del tratamiento</h2>
          <p>Los datos personales que recabamos serán utilizados para las siguientes finalidades:</p>
          <h3>Finalidades primarias (necesarias):</h3>
          <ul>
            <li>Prestación del servicio de orientación vocacional contratado</li>
            <li>Aplicación e interpretación de tests psicométricos</li>
            <li>Elaboración y envío de perfiles vocacionales</li>
            <li>Procesamiento de pagos y emisión de comprobantes</li>
            <li>Comunicación relacionada con el servicio contratado</li>
          </ul>
          <h3>Finalidades secundarias (no necesarias):</h3>
          <ul>
            <li>Envío de información promocional sobre nuestros servicios</li>
            <li>Realización de encuestas de satisfacción</li>
            <li>Elaboración de estadísticas internas (datos anonimizados)</li>
          </ul>
          <p>
            Si no desea que sus datos sean tratados para las finalidades secundarias, puede enviar
            un correo a <a href="mailto:contacto@aprovamx.com">contacto@aprovamx.com</a> indicando
            su negativa.
          </p>

          <h2>4. Transferencia de datos</h2>
          <p>
            Sus datos personales no serán transferidos a terceros sin su consentimiento, salvo las
            excepciones previstas en la LFPDPPP. La información de pago es procesada directamente
            por Stripe, Inc., quien cuenta con sus propias políticas de privacidad y seguridad.
          </p>

          <h2>5. Derechos ARCO</h2>
          <p>
            Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus
            datos personales (derechos ARCO). Para ejercer estos derechos, envíe un correo
            electrónico a <a href="mailto:contacto@aprovamx.com">contacto@aprovamx.com</a> con
            los siguientes datos:
          </p>
          <ul>
            <li>Nombre completo del titular</li>
            <li>Descripción clara del derecho que desea ejercer</li>
            <li>Documentos que acrediten su identidad (copia de identificación oficial)</li>
          </ul>
          <p>
            Responderemos su solicitud en un plazo máximo de 20 días hábiles contados a partir
            de la recepción de la solicitud.
          </p>

          <h2>6. Medidas de seguridad</h2>
          <p>
            APROVA implementa medidas de seguridad administrativas, técnicas y físicas para
            proteger sus datos personales contra daño, pérdida, alteración, destrucción, uso,
            acceso o tratamiento no autorizado. Los resultados de tests psicométricos se almacenan
            de forma segura y solo son accesibles por el titular y su especialista asignado.
          </p>

          <h2>7. Uso de cookies</h2>
          <p>
            Nuestro sitio web utiliza almacenamiento local (localStorage) para gestionar el acceso
            a los tests contratados. No utilizamos cookies de rastreo de terceros con fines
            publicitarios.
          </p>

          <h2>8. Modificaciones al aviso de privacidad</h2>
          <p>
            APROVA se reserva el derecho de modificar este aviso de privacidad. Cualquier
            modificación será publicada en nuestro sitio web <strong>aprovamx.com</strong>.
          </p>

          <h2>9. Contacto</h2>
          <p>
            Para cualquier duda o aclaración respecto a este aviso de privacidad, puede
            contactarnos en:
          </p>
          <ul>
            <li>Correo: <a href="mailto:contacto@aprovamx.com">contacto@aprovamx.com</a></li>
            <li>Teléfono: <a href="tel:+524499119192">(449) 911 9192</a></li>
            <li>WhatsApp: <a href="https://wa.me/524499119192" target="_blank" rel="noopener noreferrer">(449) 911 9192</a></li>
          </ul>
        </div>
      </section>
    </div>
  )
}

export default Privacidad
