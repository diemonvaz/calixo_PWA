'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface FocusModeBannerProps {
  isPremium: boolean;
  focusChallenge: { id: number; title: string; description?: string; type: string } | null;
  onOpenModal: () => void;
}

const FocusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

export function FocusModeBanner({ isPremium, focusChallenge, onOpenModal }: FocusModeBannerProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (!isPremium) return;
    onOpenModal();
  };

  // Usuario no premium: banner con CTA para upgrade
  if (!isPremium) {
    return (
      <Link href="/pricing">
        <div
          className={cn(
            'group relative overflow-hidden rounded-2xl p-6 md:p-8',
            'bg-white border border-neutral/15 shadow-sm',
            'cursor-pointer transition-all duration-300',
            'hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20'
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-complementary-emerald/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-0 right-0 w-48 h-48 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FocusIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-text-dark font-serif">
                  Modo Focus
                </h3>
                <p className="text-sm text-neutral mt-0.5">
                  Concéntrate hasta 5 horas sin interrupciones
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Premium
              </span>
              <span className="text-sm font-medium text-neutral">
                Desbloquear
              </span>
              <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Usuario premium: banner clickeable para abrir modal
  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 md:p-8',
        'bg-white border border-neutral/15 shadow-sm',
        'cursor-pointer transition-all duration-300',
        isHovered && 'shadow-lg shadow-primary/10 border-primary/20'
      )}
    >
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-complementary-emerald/5 transition-opacity duration-300',
        isHovered ? 'opacity-100' : 'opacity-0'
      )} />
      <div className="absolute top-0 right-0 w-56 h-56 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FocusIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-text-dark font-serif">
              Modo Focus
            </h3>
            <p className="text-sm text-neutral mt-0.5">
              Hasta 5 horas • 1 moneda/hora + 2 al compartir
            </p>
          </div>
        </div>
        <Button
          className="bg-primary text-white hover:bg-primary-dark font-semibold shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          Iniciar
        </Button>
      </div>
    </div>
  );
}
