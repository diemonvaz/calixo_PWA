import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { reports } from '@/db/schema';
import { z } from 'zod';

const reportSchema = z.object({
  reportedUserId: z.string().uuid().optional(),
  feedItemId: z.number().int().optional(),
  reason: z.string().min(1).max(500),
  description: z.string().optional(),
});

/**
 * POST /api/reports
 * Create a report (any authenticated user)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = reportSchema.parse(body);

    // At least one of reportedUserId or feedItemId must be provided
    if (!validatedData.reportedUserId && !validatedData.feedItemId) {
      return NextResponse.json(
        { error: 'Must report either a user or a feed item' },
        { status: 400 }
      );
    }

    const [newReport] = await db
      .insert(reports)
      .values({
        reporterId: user.id,
        reportedUserId: validatedData.reportedUserId || null,
        feedItemId: validatedData.feedItemId || null,
        reason: validatedData.reason,
        description: validatedData.description || null,
        status: 'pending',
      })
      .returning();

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

