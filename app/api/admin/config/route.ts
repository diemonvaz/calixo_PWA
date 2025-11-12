import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/permissions';
import { db } from '@/db';
import { config } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/admin/config
 * Get all configuration (admin only)
 */
export async function GET() {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const allConfig = await db.select().from(config);
    
    // Convert to object format
    const configObject: Record<string, any> = {};
    allConfig.forEach((item) => {
      configObject[item.key] = item.value;
    });

    return NextResponse.json(configObject);
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch config' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/config
 * Update configuration (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const updates = body as Record<string, any>;

    // Update each config key
    const results = [];
    for (const [key, value] of Object.entries(updates)) {
      const [updated] = await db
        .update(config)
        .set({ value, updatedAt: new Date() })
        .where(eq(config.key, key))
        .returning();
      
      if (!updated) {
        // Create if doesn't exist
        await db.insert(config).values({
          key,
          value,
          updatedAt: new Date(),
        });
      }
      results.push({ key, value });
    }

    return NextResponse.json({ success: true, updates: results });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    );
  }
}

