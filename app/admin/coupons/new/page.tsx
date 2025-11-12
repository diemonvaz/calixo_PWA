import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/permissions';
import { CouponForm } from '@/components/admin/coupon-form';

export default async function NewCouponPage() {
  const isAdmin = await requireAdmin();
  if (!isAdmin) {
    redirect('/admin');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-dark-navy mb-2">Crear Nuevo Cupón</h2>
        <p className="text-neutral-gray">
          Genera un código de descuento para usuarios
        </p>
      </div>
      <CouponForm />
    </div>
  );
}

