import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/permissions';
import { db } from '@/db';
import { users, profiles } from '@/db/schema';
import { ilike, or, eq } from 'drizzle-orm';

/**
 * GET /api/admin/users
 * List all users with filters (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const isPremium = searchParams.get('isPremium');

    let query = db
      .select({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
        displayName: profiles.displayName,
        isPremium: profiles.isPremium,
        coins: profiles.coins,
        streak: profiles.streak,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId));

    if (search) {
      query = query.where(
        or(
          ilike(users.email, `%${search}%`),
          ilike(profiles.displayName, `%${search}%`)
        ) as any
      );
    }

    if (isPremium !== null) {
      query = query.where(eq(profiles.isPremium, isPremium === 'true'));
    }

    const allUsers = await query.orderBy(users.createdAt);

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

