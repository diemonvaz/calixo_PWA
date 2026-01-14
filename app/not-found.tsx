'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir inmediatamente a la raíz
    // Usamos replace en lugar de push para no agregar a la historia
    router.replace('/');
  }, [router]);

  // Mientras redirige, mostrar un mensaje mínimo o nada
  // El componente se desmontará inmediatamente después de la redirección
  return null;
}
