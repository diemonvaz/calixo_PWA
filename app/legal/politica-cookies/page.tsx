import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Cookies - Calixo',
  description: 'Política de cookies de CALIXO SL',
};

export default function PoliticaCookiesPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="card">
        <h1 className="text-3xl font-bold text-text-dark font-serif mb-6">Política de Cookies</h1>
        
        <div className="prose prose-slate max-w-none space-y-6 text-neutral">
          <section>
            <p className="text-sm text-neutral/80 mb-6">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p>
              Esta Política de Cookies explica qué son las cookies, cómo las utilizamos en nuestro sitio web 
              <strong> calixo.com</strong> (el "Sitio"), qué tipos de cookies utilizamos, qué información 
              recopilamos mediante las cookies y cómo se utiliza esa información.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">1. ¿Qué son las Cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo (ordenador, tablet, 
              smartphone) cuando visita un sitio web. Las cookies permiten que el sitio web recuerde sus acciones 
              y preferencias durante un período de tiempo, por lo que no tiene que volver a configurarlas cada vez 
              que regrese al sitio o navega de una página a otra.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">2. ¿Cómo Utilizamos las Cookies?</h2>
            <p>
              Utilizamos cookies para mejorar su experiencia en nuestro Sitio, analizar cómo utiliza nuestro Sitio 
              y personalizar el contenido que le mostramos. Las cookies nos ayudan a:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Recordar sus preferencias y configuraciones</li>
              <li>Mantener su sesión iniciada</li>
              <li>Mejorar la seguridad del sitio</li>
              <li>Entender cómo los visitantes interactúan con nuestro Sitio</li>
              <li>Proporcionar funcionalidades de redes sociales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">3. Tipos de Cookies que Utilizamos</h2>
            
            <h3 className="text-lg font-semibold text-text-dark font-serif mt-6 mb-3">3.1. Cookies Estrictamente Necesarias</h3>
            <p>
              Estas cookies son esenciales para que pueda navegar por el Sitio y utilizar sus funciones. Sin estas 
              cookies, los servicios que ha solicitado no pueden ser proporcionados.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Autenticación:</strong> Para mantener su sesión iniciada</li>
              <li><strong>Seguridad:</strong> Para proteger contra actividades fraudulentas</li>
              <li><strong>Preferencias:</strong> Para recordar sus configuraciones de idioma y región</li>
            </ul>
            <p className="mt-4">
              <strong>Base legal:</strong> Interés legítimo (funcionamiento del sitio web)
            </p>

            <h3 className="text-lg font-semibold text-text-dark font-serif mt-6 mb-3">3.2. Cookies de Rendimiento y Análisis</h3>
            <p>
              Estas cookies nos ayudan a entender cómo los visitantes interactúan con nuestro Sitio recopilando 
              información de forma anónima.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Google Analytics:</strong> Para analizar el tráfico y comportamiento de los usuarios</li>
              <li><strong>Análisis interno:</strong> Para mejorar nuestros servicios</li>
            </ul>
            <p className="mt-4">
              <strong>Base legal:</strong> Consentimiento
            </p>

            <h3 className="text-lg font-semibold text-text-dark font-serif mt-6 mb-3">3.3. Cookies de Funcionalidad</h3>
            <p>
              Estas cookies permiten que el Sitio recuerde las elecciones que hace (como su nombre de usuario, 
              idioma o región) y proporciona características mejoradas y más personales.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Preferencias de usuario:</strong> Idioma, tema, configuración de notificaciones</li>
              <li><strong>Personalización:</strong> Contenido personalizado según sus intereses</li>
            </ul>
            <p className="mt-4">
              <strong>Base legal:</strong> Consentimiento
            </p>

            <h3 className="text-lg font-semibold text-text-dark font-serif mt-6 mb-3">3.4. Cookies de Marketing</h3>
            <p>
              Estas cookies se utilizan para hacer seguimiento de los visitantes a través de diferentes sitios web. 
              La intención es mostrar anuncios que sean relevantes y atractivos para el usuario individual.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Publicidad dirigida:</strong> Para mostrar anuncios relevantes</li>
              <li><strong>Remarketing:</strong> Para recordar sus visitas a nuestro Sitio</li>
            </ul>
            <p className="mt-4">
              <strong>Base legal:</strong> Consentimiento
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">4. Cookies de Terceros</h2>
            <p>
              Algunas cookies son colocadas por servicios de terceros que aparecen en nuestras páginas. No controlamos 
              el establecimiento de estas cookies, por lo que le recomendamos que consulte los sitios web de estos 
              terceros para obtener más información sobre sus cookies y cómo gestionarlas.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Google Analytics:</strong> Análisis de tráfico web</li>
              <li><strong>Stripe:</strong> Procesamiento de pagos</li>
              <li><strong>Supabase:</strong> Autenticación y base de datos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">5. Duración de las Cookies</h2>
            <p>Utilizamos dos tipos de cookies según su duración:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cookies de sesión:</strong> Temporales, se eliminan cuando cierra el navegador</li>
              <li><strong>Cookies persistentes:</strong> Permanecen en su dispositivo durante un período determinado 
              o hasta que las elimine manualmente</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">6. Gestión de Cookies</h2>
            <p>
              Puede controlar y/o eliminar las cookies como desee. Puede eliminar todas las cookies que ya están en 
              su dispositivo y puede configurar la mayoría de los navegadores para evitar que se coloquen.
            </p>
            
            <h3 className="text-lg font-semibold text-text-dark font-serif mt-6 mb-3">6.1. Configuración del Navegador</h3>
            <p>Puede configurar su navegador para rechazar cookies o para avisarle cuando se envíe una cookie:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
              <li><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies</li>
              <li><strong>Safari:</strong> Preferencias → Privacidad → Cookies</li>
              <li><strong>Edge:</strong> Configuración → Privacidad, búsqueda y servicios → Cookies</li>
            </ul>

            <h3 className="text-lg font-semibold text-text-dark font-serif mt-6 mb-3">6.2. Preferencias en nuestro Sitio</h3>
            <p>
              También puede gestionar sus preferencias de cookies directamente en nuestro Sitio a través del banner 
              de cookies que aparece en su primera visita.
            </p>
            <p className="mt-4">
              <strong>Nota:</strong> Si bloquea las cookies estrictamente necesarias, algunas funciones del Sitio 
              pueden no funcionar correctamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">7. Más Información</h2>
            <p>
              Para obtener más información sobre las cookies y cómo funcionan, puede visitar:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                www.allaboutcookies.org
              </a></li>
              <li><a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                www.youronlinechoices.com
              </a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">8. Cambios a esta Política</h2>
            <p>
              Podemos actualizar esta Política de Cookies ocasionalmente para reflejar cambios en las cookies que 
              utilizamos o por otras razones operativas, legales o regulatorias. Le notificaremos cualquier cambio 
              publicando la nueva política en esta página.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">9. Contacto</h2>
            <p>
              Si tiene preguntas sobre nuestra Política de Cookies, puede contactarnos:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Email:</strong> privacidad@calixo.com</li>
              <li><strong>Dirección:</strong> [Dirección completa]</li>
            </ul>
          </section>
        </div>

      </div>
    </main>
  );
}

