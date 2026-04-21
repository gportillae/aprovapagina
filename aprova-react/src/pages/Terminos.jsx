import './Privacidad.css'

function Terminos() {
  return (
    <div className="legal-page">
      <section className="legal-hero">
        <h1>Términos y Condiciones</h1>
        <p>Última actualización: Abril 2026</p>
      </section>

      <section className="legal-content">
        <div className="legal-body">
          <h2>1. Aceptación de los términos</h2>
          <p>
            Al acceder y utilizar el sitio web aprovamx.com y/o contratar cualquier servicio de
            APROVA Orientación Vocacional (en adelante "APROVA"), usted acepta los presentes
            Términos y Condiciones en su totalidad. Si no está de acuerdo con alguna de estas
            condiciones, le pedimos que no utilice nuestros servicios.
          </p>

          <h2>2. Descripción del servicio</h2>
          <p>APROVA ofrece servicios de orientación vocacional que incluyen:</p>
          <ul>
            <li><strong>Modalidad 1 (Solo tests):</strong> Aplicación de tests psicométricos en línea y envío de perfil vocacional por correo electrónico.</li>
            <li><strong>Modalidad 2 (Tests + asesoría virtual):</strong> Aplicación de tests psicométricos, sesiones de coaching virtual personalizadas y seguimiento continuo.</li>
          </ul>
          <p>
            Los servicios están diseñados como herramientas de apoyo en la toma de decisiones
            vocacionales. APROVA no garantiza la admisión a ninguna institución educativa ni
            el éxito académico o profesional.
          </p>

          <h2>3. Registro y acceso</h2>
          <p>
            Para acceder a los tests psicométricos, el usuario debe completar el proceso de
            pago correspondiente. Las credenciales de acceso son personales e intransferibles.
            El usuario es responsable de mantener la confidencialidad de su acceso.
          </p>

          <h2>4. Pagos y precios</h2>
          <ul>
            <li>Todos los precios están expresados en Pesos Mexicanos (MXN) e incluyen IVA.</li>
            <li>Los pagos se procesan de forma segura a través de Stripe, Inc.</li>
            <li>APROVA se reserva el derecho de modificar los precios en cualquier momento. Los cambios no afectarán servicios ya contratados.</li>
            <li>Una vez realizado el pago, el acceso a los tests se habilita de forma inmediata.</li>
          </ul>

          <h2>5. Política de reembolso</h2>
          <p>
            Se podrá solicitar reembolso completo dentro de las primeras 48 horas posteriores
            al pago, siempre y cuando no se haya iniciado ningún test psicométrico. Una vez
            iniciado cualquier test, no procederán reembolsos dado que los resultados ya han
            sido generados.
          </p>
          <p>
            Para solicitar un reembolso, envíe un correo a{' '}
            <a href="mailto:contacto@aprovamx.com">contacto@aprovamx.com</a> con su nombre
            completo y comprobante de pago.
          </p>

          <h2>6. Propiedad intelectual</h2>
          <p>
            Todo el contenido del sitio web, incluyendo textos, diseños, logotipos, tests
            psicométricos y materiales de orientación, son propiedad de APROVA y están
            protegidos por las leyes de propiedad intelectual de México. Queda prohibida
            su reproducción, distribución o uso comercial sin autorización escrita.
          </p>

          <h2>7. Uso adecuado del servicio</h2>
          <p>El usuario se compromete a:</p>
          <ul>
            <li>Responder los tests psicométricos de forma honesta y personal.</li>
            <li>No compartir sus credenciales de acceso con terceros.</li>
            <li>No intentar acceder a los tests sin el pago correspondiente.</li>
            <li>No reproducir, copiar o distribuir el contenido de los tests.</li>
          </ul>

          <h2>8. Confidencialidad de resultados</h2>
          <p>
            Los resultados de los tests psicométricos son estrictamente confidenciales. Solo
            el titular del servicio y el especialista APROVA asignado tendrán acceso a los
            resultados. APROVA no compartirá resultados individuales con terceros bajo ninguna
            circunstancia sin el consentimiento expreso del titular.
          </p>

          <h2>9. Limitación de responsabilidad</h2>
          <p>
            APROVA se compromete a brindar un servicio de calidad, sin embargo:
          </p>
          <ul>
            <li>Los resultados de los tests son orientativos y no constituyen un diagnóstico psicológico.</li>
            <li>La decisión final sobre la carrera o trayectoria profesional es responsabilidad del usuario.</li>
            <li>APROVA no se hace responsable por interrupciones del servicio causadas por factores externos (fallas de internet, mantenimiento de servidores, etc.).</li>
          </ul>

          <h2>10. Modificaciones</h2>
          <p>
            APROVA se reserva el derecho de modificar estos Términos y Condiciones en cualquier
            momento. Las modificaciones entrarán en vigor a partir de su publicación en el sitio
            web. El uso continuado del servicio después de publicadas las modificaciones
            constituye la aceptación de las mismas.
          </p>

          <h2>11. Legislación aplicable</h2>
          <p>
            Los presentes Términos y Condiciones se regirán por las leyes vigentes en los
            Estados Unidos Mexicanos. Para cualquier controversia derivada de los mismos,
            las partes se someten a la jurisdicción de los tribunales competentes en la
            ciudad de Aguascalientes, Aguascalientes.
          </p>

          <h2>12. Contacto</h2>
          <p>
            Para cualquier duda sobre estos Términos y Condiciones:
          </p>
          <ul>
            <li>Correo: <a href="mailto:contacto@aprovamx.com">contacto@aprovamx.com</a></li>
            <li>Teléfono: <a href="tel:+524499119192">(449) 911 9192</a></li>
          </ul>
        </div>
      </section>
    </div>
  )
}

export default Terminos
