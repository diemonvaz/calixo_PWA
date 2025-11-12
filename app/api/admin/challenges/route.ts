import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/permissions';
import { db } from '@/db';
import { challenges } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const challengeSchema = z.object({
  type: z.enum(['daily', 'focus', 'social']),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  reward: z.number().int().min(0),
  durationMinutes: z.number().int().min(1).optional(),
  isActive: z.boolean().default(true),
});

/**
 * GET /api/admin/challenges
 * List all challenges (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const isActive = searchParams.get('isActive');

    let query = db.select().from(challenges);

    if (isActive !== null) {
      query = query.where(eq(challenges.isActive, isActive === 'true'));
    }

    const allChallenges = await query.orderBy(challenges.createdAt);

    return NextResponse.json(allChallenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/challenges
 * Create a new challenge (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = challengeSchema.parse(body);

    const [newChallenge] = await db
      .insert(challenges)
      .values(validatedData)
      .returning();

    return NextResponse.json(newChallenge, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating challenge:', error);
    return NextResponse.json(
      { error: 'Failed to create challenge' },
      { status: 500 }
    );
  }
}

