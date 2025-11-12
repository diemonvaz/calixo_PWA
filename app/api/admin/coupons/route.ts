import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/permissions';
import { db } from '@/db';
import { coupons } from '@/db/schema';
import { z } from 'zod';

const couponSchema = z.object({
  code: z.string().min(1).max(50),
  discountPercent: z.number().int().min(1).max(100),
  maxUses: z.number().int().min(1).optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime(),
  isActive: z.boolean().default(true),
});

/**
 * GET /api/admin/coupons
 * List all coupons (admin only)
 */
export async function GET() {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const allCoupons = await db.select().from(coupons).orderBy(coupons.createdAt);

    return NextResponse.json(allCoupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/coupons
 * Create a new coupon (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = couponSchema.parse(body);

    const [newCoupon] = await db
      .insert(coupons)
      .values({
        code: validatedData.code.toUpperCase(),
        discountPercent: validatedData.discountPercent,
        maxUses: validatedData.maxUses || null,
        validFrom: validatedData.validFrom ? new Date(validatedData.validFrom) : new Date(),
        validUntil: new Date(validatedData.validUntil),
        isActive: validatedData.isActive,
      })
      .returning();

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}

