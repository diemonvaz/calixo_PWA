'use client';

import { AuthHeroSection } from './auth-hero-section';
import { AuthFooter } from './auth-footer';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-stretch">
        <AuthHeroSection />
        
        {/* Sección derecha con formulario */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-white">
          <div className="w-full max-w-lg flex-1 flex flex-col justify-center">
            {children}
          </div>
          <AuthFooter />
        </div>
      </div>
    </div>
  );
}
