import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { adminUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type AdminRole = 'admin' | 'moderator';

export interface AdminPermission {
  isAdmin: boolean;
  isModerator: boolean;
  role: AdminRole | null;
}

/**
 * Check if the current user has admin permissions
 * Returns the role if admin, null otherwise
 */
export async function checkAdminPermissions(): Promise<AdminPermission> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { isAdmin: false, isModerator: false, role: null };
    }

    const adminUser = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.userId, user.id))
      .limit(1);

    if (adminUser.length === 0) {
      return { isAdmin: false, isModerator: false, role: null };
    }

    const role = adminUser[0].role as AdminRole;
    return {
      isAdmin: role === 'admin',
      isModerator: role === 'moderator' || role === 'admin',
      role,
    };
  } catch (error) {
    console.error('Error checking admin permissions:', error);
    return { isAdmin: false, isModerator: false, role: null };
  }
}

/**
 * Check if user has admin role (not just moderator)
 */
export async function requireAdmin(): Promise<boolean> {
  const permissions = await checkAdminPermissions();
  return permissions.isAdmin;
}

/**
 * Check if user has moderator or admin role
 */
export async function requireModerator(): Promise<boolean> {
  const permissions = await checkAdminPermissions();
  return permissions.isModerator;
}

/**
 * Export AdminRole type for use in components
 */
export type { AdminRole };

