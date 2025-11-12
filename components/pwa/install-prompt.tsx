'use client';

import { ScreenReaderOnly } from '@/components/a11y/ScreenReaderOnly';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // Don't show if already installed
    if (checkInstalled()) {
      return;
    }

    // Check if user dismissed before
    const dismissed = localStorage.getItem('install-prompt-dismissed');
    const dismissedDate = dismissed ? new Date(dismissed) : null;
    const daysSinceDismissed = dismissedDate 
      ? Math.floor((Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Show again after 7 days
    if (daysSinceDismissed !== null && daysSinceDismissed < 7) {
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('[Install] beforeinstallprompt event fired');
      
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Show install prompt after a short delay (don't annoy user immediately)
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      console.log('[Install] App installed successfully');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show install prompt
    await deferredPrompt.prompt();

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[Install] User choice:', outcome);

    if (outcome === 'accepted') {
      console.log('[Install] User accepted the install prompt');
    } else {
      console.log('[Install] User dismissed the install prompt');
      // Remember that user dismissed
      localStorage.setItem('install-prompt-dismissed', new Date().toISOString());
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('install-prompt-dismissed', new Date().toISOString());
  };

  // Don't render if not showing or already installed
  if (!showInstallPrompt || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5">
      <Card className="border-2 border-soft-blue shadow-xl">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📱</div>
              <div>
                <CardTitle className="text-lg">¡Instala Calixo!</CardTitle>
                <CardDescription className="text-sm">
                  Accede más rápido y usa la app offline
                </CardDescription>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-neutral-gray hover:text-dark-navy transition-colors"
              aria-label="Cerrar prompt de instalación"
              type="button"
            >
              <ScreenReaderOnly>Cerrar</ScreenReaderOnly>
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            <ul className="text-sm text-neutral-gray space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-accent-green">✓</span>
                Acceso rápido desde tu pantalla de inicio
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-green">✓</span>
                Funciona sin conexión
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-green">✓</span>
                Notificaciones de retos y logros
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-green">✓</span>
                Experiencia de app nativa
              </li>
            </ul>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleInstallClick}
                className="flex-1"
                size="sm"
              >
                📥 Instalar
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
              >
                Ahora no
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


