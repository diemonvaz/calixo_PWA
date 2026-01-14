import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Términos y Condiciones - Calixo',
  description: 'Términos y condiciones de uso de CALIXO SL',
};

export default function TerminosCondicionesPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="card">
        <h1 className="text-3xl font-bold text-text-dark font-serif mb-6">Términos y Condiciones de Uso</h1>
        
        <div className="prose prose-slate max-w-none space-y-6 text-neutral">
          <section>
            <p className="text-sm text-neutral/80 mb-6">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p>
              Bienvenido a Calixo. Estos Términos y Condiciones de Uso (en adelante, los "Términos") rigen su acceso 
              y uso de la plataforma Calixo, incluyendo nuestro sitio web, aplicación móvil y servicios relacionados 
              (en conjunto, el "Servicio"), proporcionados por CALIXO SL (en adelante, "Calixo", "nosotros", "nuestro" o "la empresa").
            </p>
            <p>
              Al acceder o utilizar nuestro Servicio, usted acepta estar sujeto a estos Términos. Si no está de acuerdo 
              con alguna parte de estos términos, no debe utilizar nuestro Servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">1. Aceptación de los Términos</h2>
            <p>
              Al crear una cuenta, acceder o utilizar el Servicio, usted confirma que:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tiene al menos 16 años de edad</li>
              <li>Tiene la capacidad legal para celebrar estos Términos</li>
              <li>Proporcionará información precisa y completa</li>
              <li>Mantendrá la seguridad de su cuenta y contraseña</li>
              <li>Acepta cumplir con todas las leyes y regulaciones aplicables</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">2. Descripción del Servicio</h2>
            <p>
              Calixo es una plataforma social de gamificación para la desconexión digital que permite a los usuarios:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Aceptar y completar retos de desconexión digital</li>
              <li>Personalizar un avatar virtual (CALI)</li>
              <li>Ganar monedas virtuales al completar retos</li>
              <li>Comprar items para personalizar su avatar</li>
              <li>Compartir su progreso en un feed social</li>
              <li>Interactuar con otros usuarios</li>
              <li>Suscribirse a planes premium con beneficios adicionales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">3. Cuenta de Usuario</h2>
            
            <h3 className="text-lg font-semibold text-text-dark font-serif mt-6 mb-3">3.1. Creación de Cuenta</h3>
            <p>
              Para utilizar ciertas funciones del Servicio, debe crear una cuenta proporcionando información precisa 
              y completa. Usted es responsable de mantener la confidencialidad de su contraseña y de todas las 
              actividades que ocurran bajo su cuenta.
            </p>

            <h3 className="text-lg font-semibold text-text-dark font-serif mt-6 mb-3">3.2. Responsabilidades del Usuario</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantener la seguridad de su cuenta</li>
              <li>Notificarnos inmediatamente de cualquier uso no autorizado</li>
              <li>Ser responsable de todas las actividades bajo su cuenta</li>
              <li>No compartir su cuenta con terceros</li>
            </ul>

            <h3 className="text-lg font-semibold text-text-dark font-serif mt-6 mb-3">3.3. Suspensión y Terminación</h3>
            <p>
              Nos reservamos el derecho de suspender o terminar su cuenta en cualquier momento si viola estos Términos 
              o si tenemos motivos razonables para creer que su uso del Servicio es perjudicial para otros usuarios o 
              para nosotros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">4. Uso Aceptable</h2>
            <p>Usted se compromete a NO:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usar el Servicio para fines ilegales o no autorizados</li>
              <li>Violar cualquier ley local, estatal, nacional o internacional</li>
              <li>Transmitir cualquier contenido que sea difamatorio, obsceno, ofensivo o ilegal</li>
              <li>Acosar, abusar, dañar o perjudicar a otros usuarios</li>
              <li>Suplantar la identidad de otra persona o entidad</li>
              <li>Intentar obtener acceso no autorizado al Servicio o sistemas relacionados</li>
              <li>Interferir o interrumpir el funcionamiento del Servicio</li>
              <li>Usar bots, scripts o métodos automatizados para acceder al Servicio</li>
              <li>Copiar, modificar o distribuir el contenido del Servicio sin autorización</li>
              <li>Realizar ingeniería inversa o intentar extraer el código fuente</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">5. Contenido del Usuario</h2>
            
            <h3 className="text-lg font-semibold text-text-dark font-serif mt-6 mb-3">5.1. Propiedad</h3>
            <p>
              Usted conserva todos los derechos sobre el contenido que publique en el Servicio. Al publicar contenido, 
              nos otorga una licencia mundial, no exclusiva, libre de regalías para usar, reproducir, modificar, adaptar 
              y distribuir su contenido en relación con el funcionamiento y promoción del Servicio.
            </p>

            <h3 className="text-lg font-semibold text-text-dark font-serif mt-6 mb-3">5.2. Responsabilidad</h3>
            <p>
              Usted es el único responsable del contenido que publique. Nos reservamos el derecho de eliminar cualquier 
              contenido que viole estos Términos o que consideremos inapropiado.
            </p>

            <h3 className="text-lg font-semibold text-text-dark font-serif mt-6 mb-3">5.3. Moderación</h3>
            <p>
              Nos reservamos el derecho de moderar, editar o eliminar cualquier contenido sin previo aviso. Podemos 
              suspender o terminar cuentas que publiquen contenido inapropiado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">6. Suscripciones y Pagos</h2>
            
            <h3 className="text-lg font-semibold text-text-dark font-serif mt-6 mb-3">6.1. Planes Premium</h3>
            <p>
              Ofrecemos planes de suscripción premium con beneficios adicionales. Los precios, características y 
              términos de las suscripciones se muestran en el Servicio y pueden cambiar con previo aviso.
            </p>

            <h3 className="text-lg font-semibold text-text-dark font-serif mt-6 mb-3">6.2. Pagos</h3>
            <p>
              Los pagos se procesan a través de Stripe. Usted acepta proporcionar información de pago precisa y 
              autoriza a Calixo a cargar su método de pago según corresponda.
            </p>

            <h3 className="text-lg font-semibold text-text-dark font-serif mt-6 mb-3">6.3. Renovación y Cancelación</h3>
            <p>
              Las suscripciones se renuevan automáticamente a menos que las cancele antes del final del período de 
              facturación. Puede cancelar su suscripción en cualquier momento a través de la configuración de su cuenta.
            </p>

            <h3 className="text-lg font-semibold text-text-dark font-serif mt-6 mb-3">6.4. Reembolsos</h3>
            <p>
              Los reembolsos se manejan caso por caso según nuestra política de reembolsos. En general, no ofrecemos 
              reembolsos por suscripciones ya utilizadas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">7. Propiedad Intelectual</h2>
            <p>
              El Servicio y su contenido original, características y funcionalidad son propiedad de CALIXO SL y están 
              protegidos por leyes internacionales de derechos de autor, marcas registradas, patentes y otras leyes de 
              propiedad intelectual.
            </p>
            <p>
              Nuestras marcas comerciales y logotipos no pueden ser utilizados sin nuestro consentimiento previo por escrito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">8. Limitación de Responsabilidad</h2>
            <p>
              EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY, CALIXO SL NO SERÁ RESPONSABLE DE DAÑOS INDIRECTOS, INCIDENTALES, 
              ESPECIALES, CONSECUENTES O PUNITIVOS, INCLUYENDO PERO NO LIMITADO A PÉRDIDA DE BENEFICIOS, DATOS, USO, 
              BUENA VOLUNTAD U OTRAS PÉRDIDAS INTANGIBLES.
            </p>
            <p>
              Nuestra responsabilidad total hacia usted por cualquier reclamo relacionado con el Servicio no excederá 
              la cantidad que haya pagado a Calixo en los últimos 12 meses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">9. Indemnización</h2>
            <p>
              Usted acepta indemnizar y eximir de responsabilidad a CALIXO SL, sus afiliados, directores, empleados y 
              agentes de cualquier reclamo, daño, obligación, pérdida, responsabilidad, costo o deuda, y gastos 
              (incluyendo honorarios de abogados) que surjan de su uso del Servicio o violación de estos Términos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">10. Modificaciones del Servicio</h2>
            <p>
              Nos reservamos el derecho de modificar, suspender o discontinuar el Servicio (o cualquier parte del mismo) 
              en cualquier momento, con o sin previo aviso. No seremos responsables ante usted ni ante ningún tercero 
              por cualquier modificación, suspensión o discontinuación del Servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">11. Modificaciones de los Términos</h2>
            <p>
              Podemos modificar estos Términos en cualquier momento. Le notificaremos cualquier cambio publicando los 
              nuevos Términos en esta página y actualizando la fecha de "Última actualización". Su uso continuado del 
              Servicio después de cualquier cambio constituye su aceptación de los nuevos Términos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">12. Ley Aplicable y Jurisdicción</h2>
            <p>
              Estos Términos se regirán e interpretarán de acuerdo con las leyes de España, sin tener en cuenta sus 
              disposiciones sobre conflictos de leyes. Cualquier disputa relacionada con estos Términos será sometida 
              a la jurisdicción exclusiva de los tribunales de [Ciudad], España.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">13. Disposiciones Generales</h2>
            
            <h3 className="text-lg font-semibold text-text-dark font-serif mt-6 mb-3">13.1. Acuerdo Completo</h3>
            <p>
              Estos Términos constituyen el acuerdo completo entre usted y Calixo respecto al uso del Servicio.
            </p>

            <h3 className="text-lg font-semibold text-text-dark font-serif mt-6 mb-3">13.2. Divisibilidad</h3>
            <p>
              Si alguna disposición de estos Términos se considera inválida o inaplicable, las disposiciones restantes 
              permanecerán en pleno vigor y efecto.
            </p>

            <h3 className="text-lg font-semibold text-text-dark font-serif mt-6 mb-3">13.3. Renuncia</h3>
            <p>
              El hecho de que no ejerzamos algún derecho o disposición de estos Términos no constituirá una renuncia 
              a tal derecho o disposición.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">14. Contacto</h2>
            <p>
              Si tiene preguntas sobre estos Términos, puede contactarnos:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Email:</strong> legal@calixo.com</li>
              <li><strong>Dirección:</strong> [Dirección completa]</li>
              <li><strong>Teléfono:</strong> [Teléfono de contacto]</li>
            </ul>
          </section>
        </div>

      </div>
    </main>
  );
}

