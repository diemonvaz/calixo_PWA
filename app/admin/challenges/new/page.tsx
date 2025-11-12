import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/permissions';
import { ChallengeForm } from '@/components/admin/challenge-form';

export default async function NewChallengePage() {
  const isAdmin = await requireAdmin();
  if (!isAdmin) {
    redirect('/admin');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-dark-navy mb-2">Crear Nuevo Reto</h2>
        <p className="text-neutral-gray">
          Añade un nuevo reto al catálogo de Calixo
        </p>
      </div>
      <ChallengeForm />
    </div>
  );
}

