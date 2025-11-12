import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/permissions';
import { UserTable } from '@/components/admin/user-table';

export default async function AdminUsersPage() {
  const isAdmin = await requireAdmin();
  if (!isAdmin) {
    redirect('/admin');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-dark-navy mb-2">Gestión de Usuarios</h2>
        <p className="text-neutral-gray">
          Administra usuarios, permisos y estados
        </p>
      </div>
      <UserTable />
    </div>
  );
}

