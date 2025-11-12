import { NextResponse } from 'next/server';
import { checkAdminPermissions } from '@/lib/permissions';

/**
 * GET /api/admin/check
 * Check if the current user has admin permissions
 */
export async function GET() {
  try {
    const permissions = await checkAdminPermissions();

    return NextResponse.json({
      ...permissions,
    });
  } catch (error) {
    console.error('Error checking admin permissions:', error);
    return NextResponse.json(
      { error: 'Failed to check admin permissions' },
      { status: 500 }
    );
  }
}

