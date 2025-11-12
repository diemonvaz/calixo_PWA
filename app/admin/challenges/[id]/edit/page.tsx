import { redirect, notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/permissions';
import { db } from '@/db';
import { challenges } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ChallengeForm } from '@/components/admin/challenge-form';

export default async function EditChallengePage({
  params,
}: {
  params: { id: string };
}) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) {
    redirect('/admin');
  }

  const challengeId = parseInt(params.id);
  if (isNaN(challengeId)) {
    notFound();
  }

  const [challenge] = await db
    .select()
    .from(challenges)
    .where(eq(challenges.id, challengeId))
    .limit(1);

  if (!challenge) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-dark-navy mb-2">Editar Reto</h2>
        <p className="text-neutral-gray">
          Modifica los detalles del reto: {challenge.title}
        </p>
      </div>
      <ChallengeForm challenge={challenge} />
    </div>
  );
}

