import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db, profiles } from '@/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Schema for updating profile
const updateProfileSchema = z.object({
  displayName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50, 'El nombre no puede exceder 50 caracteres').optional(),
  isPrivate: z.boolean().optional(),
});

/**
 * GET /api/profile
 * Get the current user's profile
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Get profile from database
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profile: {
        userId: profile.userId,
        displayName: profile.displayName,
        avatarEnergy: profile.avatarEnergy,
        isPrivate: profile.isPrivate,
        isPremium: profile.isPremium,
        coins: profile.coins,
        streak: profile.streak,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Error al obtener el perfil' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile
 * Update the current user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedFields = updateProfileSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: validatedFields.error.errors[0].message },
        { status: 400 }
      );
    }

    const updateData = validatedFields.data;

    // Update profile
    const [updatedProfile] = await db
      .update(profiles)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, user.id))
      .returning();

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Error al actualizar el perfil' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Perfil actualizado exitosamente',
      profile: {
        userId: updatedProfile.userId,
        displayName: updatedProfile.displayName,
        avatarEnergy: updatedProfile.avatarEnergy,
        isPrivate: updatedProfile.isPrivate,
        isPremium: updatedProfile.isPremium,
        coins: updatedProfile.coins,
        streak: updatedProfile.streak,
        updatedAt: updatedProfile.updatedAt,
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el perfil' },
      { status: 500 }
    );
  }
}

