import { redirect } from 'next/navigation';
import { checkAdminPermissions } from '@/lib/permissions';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { ModeToggle } from '@/components/admin/mode-toggle';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const permissions = await checkAdminPermissions();

  if (!permissions.isModerator) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-beige">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar role={permissions.role!} />

        {/* Main Content */}
        <div className="flex-1 ml-64">
          {/* Top Bar */}
          <div className="bg-white border-b border-neutral-gray/20 px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-dark-navy">Panel de Administración</h1>
            <ModeToggle currentRole={permissions.role!} />
          </div>

          {/* Page Content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

