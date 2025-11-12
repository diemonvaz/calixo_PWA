'use client';

import { ReactNode } from 'react';

interface ScreenReaderOnlyProps {
  children: ReactNode;
  as?: 'span' | 'div' | 'p';
}

/**
 * Component that renders content only for screen readers
 * Visually hidden but accessible to assistive technologies
 */
export function ScreenReaderOnly({
  children,
  as: Component = 'span',
}: ScreenReaderOnlyProps) {
  return (
    <Component className="sr-only">{children}</Component>
  );
}


