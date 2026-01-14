'use client';

import Link from 'next/link';

export function AuthFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-8 pt-6 border-t border-neutral/10" role="contentinfo">
      <div className="flex flex-col items-center gap-4">
        {/* Enlaces legales */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-neutral/70">
          <Link 
            href="/legal/politica-privacidad" 
            className="hover:underline"
          >
            Privacidad
          </Link>
          <span className="text-neutral/40">·</span>
          <Link 
            href="/legal/terminos-condiciones" 
            className="hover:underline"
          >
            Condiciones
          </Link>
          <span className="text-neutral/40">·</span>
          <Link 
            href="/legal/politica-cookies" 
            className="hover:underline"
          >
            Cookies
          </Link>
          <span className="text-neutral/40">·</span>
          <Link 
            href="/legal/aviso-legal" 
            className="hover:underline"
          >
            Aviso Legal
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-xs text-neutral/70">
          © {currentYear} CALIXO
        </div>
      </div>
    </footer>
  );
}
