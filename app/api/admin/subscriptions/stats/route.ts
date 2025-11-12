import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/permissions';
import { db } from '@/db';
import { subscriptions } from '@/db/schema';
import { eq, count, sql } from 'drizzle-orm';

/**
 * GET /api/admin/subscriptions/stats
 * Get subscription statistics (admin only)
 */
export async function GET() {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [
      totalActive,
      totalCanceled,
      monthlySubs,
      annualSubs,
      mrr,
    ] = await Promise.all([
      db
        .select({ count: count() })
        .from(subscriptions)
        .where(eq(subscriptions.status, 'active')),
      db
        .select({ count: count() })
        .from(subscriptions)
        .where(eq(subscriptions.status, 'canceled')),
      db
        .select({ count: count() })
        .from(subscriptions)
        .where(
          sql`${subscriptions.status} = 'active' AND ${subscriptions.plan} = 'monthly'`
        ),
      db
        .select({ count: count() })
        .from(subscriptions)
        .where(
          sql`${subscriptions.status} = 'active' AND ${subscriptions.plan} = 'annual'`
        ),
      // Calculate MRR (Monthly Recurring Revenue)
      db
        .select({
          mrr: sql<number>`SUM(CASE 
            WHEN ${subscriptions.plan} = 'monthly' THEN 4.99
            WHEN ${subscriptions.plan} = 'annual' THEN 49.99 / 12
            ELSE 0
          END)`,
        })
        .from(subscriptions)
        .where(eq(subscriptions.status, 'active')),
    ]);

    const stats = {
      totalActive: totalActive[0]?.count || 0,
      totalCanceled: totalCanceled[0]?.count || 0,
      monthlySubs: monthlySubs[0]?.count || 0,
      annualSubs: annualSubs[0]?.count || 0,
      mrr: parseFloat(mrr[0]?.mrr || '0'),
      arr: parseFloat(mrr[0]?.mrr || '0') * 12,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription stats' },
      { status: 500 }
    );
  }
}

