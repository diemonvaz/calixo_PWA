'use client';

import Link from 'next/link';

/**
 * Skip to main content link for keyboard navigation
 * Helps screen readers and keyboard users skip navigation
 */
export function SkipLink() {
  return (
    <Link
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    >
      Saltar al contenido principal
    </Link>
  );
}


