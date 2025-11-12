import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/permissions';
import { ConfigForm } from '@/components/admin/config-form';

export default async function AdminConfigPage() {
  const isAdmin = await requireAdmin();
  if (!isAdmin) {
    redirect('/admin');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-dark-navy mb-2">Configuración del Sistema</h2>
        <p className="text-neutral-gray">
          Gestiona los parámetros globales de Calixo
        </p>
      </div>
      <ConfigForm />
    </div>
  );
}

