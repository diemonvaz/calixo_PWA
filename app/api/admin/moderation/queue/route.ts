import { NextRequest, NextResponse } from 'next/server';
import { requireModerator } from '@/lib/permissions';
import { db } from '@/db';
import { reports, users, feedItems } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/admin/moderation/queue
 * Get pending reports (moderator/admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const isModerator = await requireModerator();
    if (!isModerator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const pendingReports = await db
      .select({
        id: reports.id,
        reporterId: reports.reporterId,
        reportedUserId: reports.reportedUserId,
        feedItemId: reports.feedItemId,
        reason: reports.reason,
        description: reports.description,
        status: reports.status,
        createdAt: reports.createdAt,
        reporterEmail: users.email,
      })
      .from(reports)
      .leftJoin(users, eq(reports.reporterId, users.id))
      .where(eq(reports.status, 'pending'))
      .orderBy(reports.createdAt);

    return NextResponse.json(pendingReports);
  } catch (error) {
    console.error('Error fetching moderation queue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moderation queue' },
      { status: 500 }
    );
  }
}

