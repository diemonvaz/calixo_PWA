import { NextRequest, NextResponse } from 'next/server';
import { requireModerator } from '@/lib/permissions';
import { db } from '@/db';
import { reports, feedItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const resolveSchema = z.object({
  status: z.enum(['reviewed', 'resolved']),
  action: z.enum(['approve', 'reject', 'delete']).optional(),
});

/**
 * PUT /api/admin/moderation/[id]/resolve
 * Resolve a report (moderator/admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isModerator = await requireModerator();
    if (!isModerator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const reportId = parseInt(params.id);
    if (isNaN(reportId)) {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = resolveSchema.parse(body);

    // Get the report
    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1);

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // If action is delete and there's a feedItemId, delete the feed item
    if (validatedData.action === 'delete' && report.feedItemId) {
      await db
        .delete(feedItems)
        .where(eq(feedItems.id, report.feedItemId));
    }

    // Update report status
    const [updatedReport] = await db
      .update(reports)
      .set({ status: validatedData.status })
      .where(eq(reports.id, reportId))
      .returning();

    return NextResponse.json({
      success: true,
      report: updatedReport,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error resolving report:', error);
    return NextResponse.json(
      { error: 'Failed to resolve report' },
      { status: 500 }
    );
  }
}

