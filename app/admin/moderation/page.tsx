import { redirect } from 'next/navigation';
import { requireModerator } from '@/lib/permissions';
import { ModerationQueue } from '@/components/admin/moderation-queue';

export default async function AdminModerationPage() {
  const isModerator = await requireModerator();
  if (!isModerator) {
    redirect('/admin');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-dark-navy mb-2">Cola de Moderación</h2>
        <p className="text-neutral-gray">
          Revisa y resuelve reportes de contenido
        </p>
      </div>
      <ModerationQueue />
    </div>
  );
}

