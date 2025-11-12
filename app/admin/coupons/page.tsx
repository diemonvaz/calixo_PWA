import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/permissions';
import { db } from '@/db';
import { coupons } from '@/db/schema';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function AdminCouponsPage() {
  const isAdmin = await requireAdmin();
  if (!isAdmin) {
    redirect('/admin');
  }

  const allCoupons = await db.select().from(coupons).orderBy(coupons.createdAt);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-dark-navy mb-2">Gestión de Cupones</h2>
          <p className="text-neutral-gray">
            Crea y gestiona códigos de descuento
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/coupons/new">Crear Nuevo Cupón</Link>
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {allCoupons.length === 0 ? (
            <p className="text-neutral-gray text-center py-8">
              No hay cupones. Crea el primero.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-gray/20">
                    <th className="text-left py-3 px-4 font-medium text-dark-navy">Código</th>
                    <th className="text-left py-3 px-4 font-medium text-dark-navy">Descuento</th>
                    <th className="text-left py-3 px-4 font-medium text-dark-navy">Usos</th>
                    <th className="text-left py-3 px-4 font-medium text-dark-navy">Válido Hasta</th>
                    <th className="text-left py-3 px-4 font-medium text-dark-navy">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-dark-navy">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {allCoupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b border-neutral-gray/10">
                      <td className="py-3 px-4 font-mono font-medium text-dark-navy">
                        {coupon.code}
                      </td>
                      <td className="py-3 px-4">{coupon.discountPercent}%</td>
                      <td className="py-3 px-4">
                        {coupon.maxUses
                          ? `${coupon.usedCount}/${coupon.maxUses}`
                          : `${coupon.usedCount} (ilimitado)`}
                      </td>
                      <td className="py-3 px-4 text-neutral-gray">
                        {new Date(coupon.validUntil).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-3 px-4">
                        {coupon.isActive &&
                        new Date(coupon.validUntil) > new Date() ? (
                          <span className="px-2 py-1 bg-accent-green/10 text-accent-green rounded-lg text-sm">
                            Activo
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-neutral-gray/10 text-neutral-gray rounded-lg text-sm">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/coupons/${coupon.id}/edit`}
                          className="text-soft-blue hover:underline text-sm"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

