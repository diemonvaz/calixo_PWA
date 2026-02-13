'use client';

import Image from 'next/image';

interface PremiumBadgeProps {
  className?: string;
  size?: number;
}

export function PremiumBadge({ className = '', size = 20 }: PremiumBadgeProps) {
  return (
    <span
      className={`relative inline-flex items-center justify-center group ${className}`}
      role="img"
      aria-label="Usuario verificado"
      title="Usuario verificado"
    >
      <Image
        src="/icons/icon.svg"
        alt=""
        width={size}
        height={size}
        className="object-contain"
      />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        Usuario verificado
      </span>
    </span>
  );
}
