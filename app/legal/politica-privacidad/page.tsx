import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Privacidad - Calixo',
  description: 'Política de privacidad y protección de datos de CALIXO SL',
};

export default function PoliticaPrivacidadPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="card">
        <h1 className="text-3xl font-bold text-dark-navy mb-6">Política de Privacidad</h1>
        
        <div className="prose prose-slate max-w-none space-y-6 text-neutral-gray">
          <section>
            <p className="text-sm text-neutral-gray/80 mb-6">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p>
              En CALIXO SL (en adelante, "Calixo", "nosotros", "nuestro" o "la empresa"), nos comprometemos 
              a proteger y respetar su privacidad. Esta Política de Privacidad explica cómo recopilamos, 
              utilizamos, divulgamos y protegemos su información cuando utiliza nuestro sitio web y servicios 
              (en conjunto, el "Servicio").
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-navy mt-8 mb-4">1. Responsable del Tratamiento</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Denominación social:</strong> CALIXO SL</li>
              <li><strong>NIF:</strong> B-XXXXXXXX</li>
              <li><strong>Domicilio social:</strong> [Dirección completa]</li>
              <li><strong>Email:</strong> privacidad@calixo.com</li>
              <li><strong>Teléfono:</strong> [Teléfono de contacto]</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-navy mt-8 mb-4">2. Información que Recopilamos</h2>
            <p>Recopilamos y procesamos los siguientes tipos de información:</p>
            
            <h3 className="text-lg font-semibold text-dark-navy mt-6 mb-3">2.1. Información que nos proporciona directamente</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Datos de registro:</strong> Nombre de usuario, dirección de correo electrónico y contraseña</li>
              <li><strong>Perfil:</strong> Nombre de visualización, avatar personalizado, configuración de privacidad</li>
              <li><strong>Contenido:</strong> Publicaciones en el feed, imágenes, notas y comentarios</li>
              <li><strong>Información de pago:</strong> Datos de facturación y suscripción (procesados por Stripe)</li>
              <li><strong>Newsletter:</strong> Dirección de correo electrónico para suscripciones</li>
            </ul>

            <h3 className="text-lg font-semibold text-dark-navy mt-6 mb-3">2.2. Información recopilada automáticamente</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Datos de uso:</strong> Cómo interactúa con nuestro Servicio, páginas visitadas, tiempo de permanencia</li>
              <li><strong>Datos técnicos:</strong> Dirección IP, tipo de navegador, sistema operativo, dispositivo</li>
              <li><strong>Cookies y tecnologías similares:</strong> Ver nuestra <Link href="/legal/politica-cookies" className="text-soft-blue hover:underline">Política de Cookies</Link></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-navy mt-8 mb-4">3. Base Legal y Finalidad del Tratamiento</h2>
            <p>Procesamos sus datos personales basándonos en las siguientes bases legales:</p>
            
            <h3 className="text-lg font-semibold text-dark-navy mt-6 mb-3">3.1. Ejecución del contrato</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Crear y gestionar su cuenta de usuario</li>
              <li>Procesar sus retos y desafíos</li>
              <li>Gestionar sus suscripciones premium</li>
              <li>Procesar transacciones y pagos</li>
            </ul>

            <h3 className="text-lg font-semibold text-dark-navy mt-6 mb-3">3.2. Consentimiento</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Enviar comunicaciones de marketing y newsletter</li>
              <li>Usar cookies no esenciales</li>
              <li>Compartir datos con terceros para marketing</li>
            </ul>

            <h3 className="text-lg font-semibold text-dark-navy mt-6 mb-3">3.3. Interés legítimo</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mejorar nuestros servicios y experiencia del usuario</li>
              <li>Prevenir fraudes y garantizar la seguridad</li>
              <li>Análisis y estadísticas</li>
            </ul>

            <h3 className="text-lg font-semibold text-dark-navy mt-6 mb-3">3.4. Cumplimiento de obligaciones legales</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cumplir con obligaciones fiscales y contables</li>
              <li>Responder a solicitudes de autoridades competentes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-navy mt-8 mb-4">4. Compartir Información</h2>
            <p>Podemos compartir su información con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Proveedores de servicios:</strong> Supabase (hosting y base de datos), Stripe (pagos), servicios de análisis</li>
              <li><strong>Autoridades legales:</strong> Cuando sea requerido por ley o para proteger nuestros derechos</li>
              <li><strong>Transferencias empresariales:</strong> En caso de fusión, adquisición o venta de activos</li>
            </ul>
            <p className="mt-4">
              No vendemos ni alquilamos sus datos personales a terceros para fines comerciales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-navy mt-8 mb-4">5. Retención de Datos</h2>
            <p>
              Conservaremos sus datos personales durante el tiempo necesario para cumplir con los fines 
              para los que fueron recopilados, incluyendo cualquier requisito legal, contable o de 
              informes. En general:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Datos de cuenta:</strong> Mientras su cuenta esté activa o según requiera la ley</li>
              <li><strong>Datos de transacciones:</strong> 7 años según obligaciones fiscales</li>
              <li><strong>Newsletter:</strong> Hasta que se dé de baja</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-navy mt-8 mb-4">6. Sus Derechos</h2>
            <p>De acuerdo con el RGPD, usted tiene derecho a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Acceso:</strong> Obtener información sobre sus datos personales que procesamos</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
              <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos ("derecho al olvido")</li>
              <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos</li>
              <li><strong>Limitación:</strong> Limitar el procesamiento en ciertas circunstancias</li>
              <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
              <li><strong>Retirar consentimiento:</strong> En cualquier momento cuando el procesamiento se base en consentimiento</li>
            </ul>
            <p className="mt-4">
              Para ejercer estos derechos, puede contactarnos en <strong>privacidad@calixo.com</strong> 
              o a través de la configuración de su cuenta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-navy mt-8 mb-4">7. Seguridad</h2>
            <p>
              Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos personales 
              contra acceso no autorizado, alteración, divulgación o destrucción. Esto incluye:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cifrado de datos en tránsito y en reposo</li>
              <li>Autenticación segura y control de acceso</li>
              <li>Monitoreo regular de seguridad</li>
              <li>Copias de seguridad regulares</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-navy mt-8 mb-4">8. Transferencias Internacionales</h2>
            <p>
              Sus datos pueden ser transferidos y procesados en países fuera del Espacio Económico Europeo (EEE). 
              Cuando realizamos estas transferencias, nos aseguramos de que existan salvaguardas adecuadas, 
              como cláusulas contractuales estándar aprobadas por la Comisión Europea.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-navy mt-8 mb-4">9. Menores de Edad</h2>
            <p>
              Nuestro Servicio no está dirigido a menores de 16 años. No recopilamos intencionalmente 
              información personal de menores de 16 años. Si descubrimos que hemos recopilado información 
              de un menor sin el consentimiento de los padres, tomaremos medidas para eliminar esa información.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-navy mt-8 mb-4">10. Cambios a esta Política</h2>
            <p>
              Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos cualquier 
              cambio publicando la nueva política en esta página y actualizando la fecha de "Última actualización". 
              Le recomendamos que revise esta política periódicamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-navy mt-8 mb-4">11. Contacto</h2>
            <p>
              Si tiene preguntas sobre esta Política de Privacidad o sobre cómo manejamos sus datos personales, 
              puede contactarnos:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Email:</strong> privacidad@calixo.com</li>
              <li><strong>Dirección:</strong> [Dirección completa]</li>
              <li><strong>Teléfono:</strong> [Teléfono de contacto]</li>
            </ul>
            <p className="mt-4">
              También tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos 
              (AEPD) si considera que el tratamiento de sus datos personales infringe el RGPD.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-gray/20">
          <Link 
            href="/" 
            className="text-soft-blue hover:underline font-medium"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}

