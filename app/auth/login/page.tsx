'use client';

import { AuthLayout } from '@/components/auth/auth-layout';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
      
      {/* Footer legal en móvil */}
      <div className="lg:hidden text-center text-xs text-neutral/60 mt-8">
        <p>
          También puedes reportar contenido que consideres ilegal en tu país sin iniciar sesión.
        </p>
      </div>
    </AuthLayout>
  );
}

