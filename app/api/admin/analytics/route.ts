import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/permissions';
import { db } from '@/db';
import {
  users,
  userChallenges,
  feedItems,
  transactions,
  storeItems,
  profiles,
} from '@/db/schema';
import { eq, count, sql, gte, and } from 'drizzle-orm';

/**
 * GET /api/admin/analytics
 * Get analytics data (admin only)
 */
export async function GET() {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // DAU, WAU, MAU
    const [dau, wau, mau] = await Promise.all([
      db
        .select({ count: count() })
        .from(profiles)
        .where(gte(profiles.updatedAt, today)),
      db
        .select({ count: count() })
        .from(profiles)
        .where(gte(profiles.updatedAt, weekAgo)),
      db
        .select({ count: count() })
        .from(profiles)
        .where(gte(profiles.updatedAt, monthAgo)),
    ]);

    // Challenges completed by type
    const challengesByType = await db
      .select({
        type: userChallenges.status,
        count: count(),
      })
      .from(userChallenges)
      .where(eq(userChallenges.status, 'completed'))
      .groupBy(userChallenges.status);

    // Total coins earned vs spent
    const [coinsEarned, coinsSpent] = await Promise.all([
      db
        .select({
          total: sql<number>`SUM(${transactions.amount})`,
        })
        .from(transactions)
        .where(eq(transactions.type, 'earn')),
      db
        .select({
          total: sql<number>`SUM(${transactions.amount})`,
        })
        .from(transactions)
        .where(eq(transactions.type, 'spend')),
    ]);

    // Most purchased items
    const topItems = await db
      .select({
        itemId: transactions.itemId,
        count: count(),
      })
      .from(transactions)
      .where(eq(transactions.type, 'spend'))
      .groupBy(transactions.itemId)
      .orderBy(sql`count DESC`)
      .limit(10);

    // Most liked posts
    const topPosts = await db
      .select({
        id: feedItems.id,
        likesCount: feedItems.likesCount,
      })
      .from(feedItems)
      .orderBy(sql`${feedItems.likesCount} DESC`)
      .limit(10);

    const analytics = {
      users: {
        dau: dau[0]?.count || 0,
        wau: wau[0]?.count || 0,
        mau: mau[0]?.count || 0,
      },
      challenges: {
        completedByType: challengesByType,
      },
      coins: {
        earned: parseFloat(coinsEarned[0]?.total || '0'),
        spent: parseFloat(coinsSpent[0]?.total || '0'),
        net: parseFloat(coinsEarned[0]?.total || '0') - parseFloat(coinsSpent[0]?.total || '0'),
      },
      topItems: topItems,
      topPosts: topPosts,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

