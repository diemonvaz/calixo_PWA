import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/permissions';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * PUT /api/admin/users/[id]/premium
 * Toggle premium status for a user (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const userId = id;
    const body = await request.json();
    const { isPremium } = body;

    const [updatedProfile] = await db
      .update(profiles)
      .set({ isPremium })
      .where(eq(profiles.userId, userId))
      .returning();

    if (!updatedProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating premium status:', error);
    return NextResponse.json(
      { error: 'Failed to update premium status' },
      { status: 500 }
    );
  }
}

