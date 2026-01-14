import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/permissions';
import { db } from '@/db';
import { coupons } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const couponUpdateSchema = z.object({
  code: z.string().min(1).max(50).optional(),
  discountPercent: z.number().int().min(1).max(100).optional(),
  maxUses: z.number().int().min(1).optional().nullable(),
  validUntil: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

/**
 * PUT /api/admin/coupons/[id]
 * Update a coupon (admin only)
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
    const couponId = parseInt(id);
    if (isNaN(couponId)) {
      return NextResponse.json({ error: 'Invalid coupon ID' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = couponUpdateSchema.parse(body);

    const updateData: any = {};
    if (validatedData.code) updateData.code = validatedData.code.toUpperCase();
    if (validatedData.discountPercent !== undefined) updateData.discountPercent = validatedData.discountPercent;
    if (validatedData.maxUses !== undefined) updateData.maxUses = validatedData.maxUses;
    if (validatedData.validUntil) updateData.validUntil = new Date(validatedData.validUntil);
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

    const [updatedCoupon] = await db
      .update(coupons)
      .set(updateData)
      .where(eq(coupons.id, couponId))
      .returning();

    if (!updatedCoupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCoupon);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/coupons/[id]
 * Delete/expire a coupon (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const couponId = parseInt(id);
    if (isNaN(couponId)) {
      return NextResponse.json({ error: 'Invalid coupon ID' }, { status: 400 });
    }

    // Mark as inactive instead of deleting
    await db
      .update(coupons)
      .set({ isActive: false })
      .where(eq(coupons.id, couponId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { error: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}

