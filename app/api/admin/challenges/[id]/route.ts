import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/permissions';
import { db } from '@/db';
import { challenges } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const challengeUpdateSchema = z.object({
  type: z.enum(['daily', 'focus', 'social']).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  reward: z.number().int().min(0).optional(),
  durationMinutes: z.number().int().min(1).optional().nullable(),
  isActive: z.boolean().optional(),
});

/**
 * PUT /api/admin/challenges/[id]
 * Update a challenge (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const challengeId = parseInt(params.id);
    if (isNaN(challengeId)) {
      return NextResponse.json({ error: 'Invalid challenge ID' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = challengeUpdateSchema.parse(body);

    const [updatedChallenge] = await db
      .update(challenges)
      .set(validatedData)
      .where(eq(challenges.id, challengeId))
      .returning();

    if (!updatedChallenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    return NextResponse.json(updatedChallenge);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating challenge:', error);
    return NextResponse.json(
      { error: 'Failed to update challenge' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/challenges/[id]
 * Delete a challenge (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const challengeId = parseInt(params.id);
    if (isNaN(challengeId)) {
      return NextResponse.json({ error: 'Invalid challenge ID' }, { status: 400 });
    }

    // Check if challenge exists
    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Instead of deleting, mark as inactive (safer)
    await db
      .update(challenges)
      .set({ isActive: false })
      .where(eq(challenges.id, challengeId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    return NextResponse.json(
      { error: 'Failed to delete challenge' },
      { status: 500 }
    );
  }
}

