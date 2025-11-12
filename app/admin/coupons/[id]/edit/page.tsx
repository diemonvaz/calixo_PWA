import { redirect, notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/permissions';
import { db } from '@/db';
import { coupons } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { CouponForm } from '@/components/admin/coupon-form';

export default async function EditCouponPage({
  params,
}: {
  params: { id: string };
}) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) {
    redirect('/admin');
  }

  const couponId = parseInt(params.id);
  if (isNaN(couponId)) {
    notFound();
  }

  const [coupon] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.id, couponId))
    .limit(1);

  if (!coupon) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-dark-navy mb-2">Editar Cupón</h2>
        <p className="text-neutral-gray">
          Modifica los detalles del cupón: {coupon.code}
        </p>
      </div>
      <CouponForm coupon={coupon} />
    </div>
  );
}

