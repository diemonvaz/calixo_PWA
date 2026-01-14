import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Aviso Legal - Calixo',
  description: 'Aviso legal de CALIXO SL',
};

export default function AvisoLegalPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="card">
        <h1 className="text-3xl font-bold text-text-dark font-serif mb-6">Aviso Legal</h1>
        
        <div className="prose prose-slate max-w-none space-y-6 text-neutral">
          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">1. Datos Identificativos</h2>
            <p>
              En cumplimiento con el deber de información recogido en artículo 10 de la Ley 34/2002, 
              de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico, 
              a continuación se reflejan los siguientes datos:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Denominación social:</strong> CALIXO SL</li>
              <li><strong>NIF:</strong> B-XXXXXXXX</li>
              <li><strong>Domicilio social:</strong> [Dirección completa de la empresa]</li>
              <li><strong>Teléfono:</strong> [Teléfono de contacto]</li>
              <li><strong>Email:</strong> legal@calixo.com</li>
              <li><strong>Sitio web:</strong> https://calixo.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">2. Objeto</h2>
            <p>
              El presente aviso legal regula el uso del sitio web <strong>calixo.com</strong> (en adelante, 
              el "Sitio Web"), propiedad de CALIXO SL (en adelante, el "Titular").
            </p>
            <p>
              La navegación por el sitio web de CALIXO SL atribuye la condición de usuario del mismo 
              e implica la aceptación plena y sin reservas de todas y cada una de las disposiciones 
              incluidas en este Aviso Legal, que pueden sufrir modificaciones.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">3. Condiciones de Uso</h2>
            <p>
              El acceso y uso del Sitio Web se rige por la legalidad vigente y por el principio de buena 
              fe comprometiéndose el usuario a realizar un buen uso de la web. No se permite el uso del 
              Sitio Web con fines ilícitos o lesivos, o que, de cualquier forma, puedan causar perjuicio 
              o impedir el normal funcionamiento del sitio web.
            </p>
            <p>
              Quedan expresamente prohibidas las siguientes conductas:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Reproducir, copiar, distribuir, permitir el acceso público a través de cualquier modalidad 
              de comunicación pública, transformar o modificar los contenidos, a menos que se cuente con la 
              autorización del titular de los correspondientes derechos o resulte legalmente permitido.</li>
              <li>Realizar actos de reproducción, distribución y comunicación pública de los contenidos del Sitio Web 
              con fines comerciales, en cualquier soporte y por cualquier medio técnico, sin la autorización del Titular.</li>
              <li>Eliminar, eludir o manipular el copyright y demás datos identificativos de los derechos del Titular 
              incorporados a los contenidos, así como los dispositivos técnicos de protección o cualesquiera mecanismos 
              de información que puedan insertarse en los contenidos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">4. Propiedad Intelectual e Industrial</h2>
            <p>
              Todos los contenidos del Sitio Web, incluyendo, a título enunciativo, los textos, fotografías, gráficos, 
              imágenes, iconos, tecnología, software, así como su diseño gráfico y códigos fuente, constituyen una obra 
              cuya propiedad pertenece a CALIXO SL, sin que puedan entenderse cedidos al usuario ninguno de los derechos 
              de explotación sobre los mismos más allá de lo estrictamente necesario para el correcto uso del Sitio Web.
            </p>
            <p>
              Las marcas, nombres comerciales o signos distintivos de cualquier clase contenidos en el Sitio Web son 
              propiedad de CALIXO SL, sin que pueda entenderse que el uso o acceso al Sitio Web atribuya al usuario derecho 
              alguno sobre los mismos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">5. Responsabilidad</h2>
            <p>
              CALIXO SL no se hace responsable de la información y contenidos almacenados en foros, chats, generadores 
              de blogs, comentarios, redes sociales o cualquier otro medio que permita a terceros publicar contenidos de 
              forma independiente en la página web del prestador.
            </p>
            <p>
              Sin embargo, y en cumplimiento de lo dispuesto en los artículos 11 y 16 de la LSSI-CE, CALIXO SL se compromete 
              a retirar o en su caso impedir el acceso a aquellos contenidos que puedan afectar o contravenir la legislación 
              nacional o internacional, derechos de terceros o la moral y el orden público.
            </p>
            <p>
              CALIXO SL no se responsabiliza de los daños y perjuicios derivados del funcionamiento o la imposibilidad de 
              acceder al Sitio Web, ni de los daños que puedan derivarse de la falta de disponibilidad o continuidad del 
              Sitio Web o del fallo en las expectativas de utilidad que los usuarios hubieren podido atribuir al Sitio Web.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">6. Modificaciones</h2>
            <p>
              CALIXO SL se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en 
              su portal, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se presten a través de la 
              misma como la forma en la que éstos aparezcan presentados o localizados en su portal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">7. Enlaces</h2>
            <p>
              En el caso de que en el Sitio Web se dispusiesen enlaces o hipervínculos hacía otros sitios de Internet, 
              CALIXO SL no ejercerá ningún tipo de control sobre dichos sitios y contenidos. En ningún caso CALIXO SL 
              asumirá responsabilidad alguna por los contenidos de algún enlace perteneciente a un sitio web ajeno, ni 
              garantizará la disponibilidad técnica, calidad, fiabilidad, exactitud, amplitud, veracidad, validez y 
              constitucionalidad de cualquier material o información contenida en ninguno de dichos hipervínculos u otros 
              sitios de Internet.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">8. Legislación Aplicable y Jurisdicción</h2>
            <p>
              Para la resolución de todas las controversias o cuestiones relacionadas con el presente sitio web o de 
              las actividades en él desarrolladas, será de aplicación la legislación española, a la que se someten 
              expresamente las partes, siendo competentes para la resolución de todos los conflictos derivados o 
              relacionados con su uso los Juzgados y Tribunales de [Ciudad], España.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark font-serif mt-8 mb-4">9. Contacto</h2>
            <p>
              Para cualquier consulta o comunicación relacionada con este Aviso Legal, puede contactarnos a través de:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Email:</strong> legal@calixo.com</li>
              <li><strong>Dirección:</strong> [Dirección completa]</li>
            </ul>
          </section>
        </div>

      </div>
    </main>
  );
}

