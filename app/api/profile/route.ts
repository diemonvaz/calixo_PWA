import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema for updating profile
const updateProfileSchema = z.object({
  displayName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50, 'El nombre no puede exceder 50 caracteres').optional(),
  isPrivate: z.boolean().optional(),
});

/**
 * GET /api/profile
 * Get the current user's profile
 * Creates profile automatically if it doesn't exist
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

    // Get user from database using Supabase
    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    // If user doesn't exist, create it automatically
    if (userError || !userData) {
      // Get display name from user metadata or use email prefix as fallback
      const displayName = 
        (user.user_metadata?.display_name as string) ||
        user.email?.split('@')[0] ||
        'Usuario';

      // Create user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          display_name: displayName,
          avatar_energy: 100,
          is_private: false,
          is_premium: false,
          coins: 0,
          streak: 0,
        })
        .select()
        .single();

      if (createError || !newUser) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { error: 'Error al crear el usuario' },
          { status: 500 }
        );
      }

      userData = newUser;
    }

    // Get profile photo URL if exists
    let profilePhotoUrl: string | null = null;
    if (userData.profile_photo_path) {
      const pathParts = userData.profile_photo_path.split('/');
      if (pathParts.length > 1) {
        const bucket = pathParts[0];
        const filePath = pathParts.slice(1).join('/');
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);
        profilePhotoUrl = publicUrl;
      }
    }

    return NextResponse.json({
      profile: {
        userId: userData.id,
        displayName: userData.display_name,
        avatarEnergy: userData.avatar_energy,
        isPrivate: userData.is_private,
        isPremium: userData.is_premium,
        coins: userData.coins,
        streak: userData.streak,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
        profilePhotoUrl: profilePhotoUrl,
        profilePhotoPath: userData.profile_photo_path || null,
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

    const updateData: Record<string, any> = {};
    if (validatedFields.data.displayName !== undefined) {
      updateData.display_name = validatedFields.data.displayName;
    }
    if (validatedFields.data.isPrivate !== undefined) {
      updateData.is_private = validatedFields.data.isPrivate;
    }
    updateData.updated_at = new Date().toISOString();

    // Update user using Supabase
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError || !updatedUser) {
      return NextResponse.json(
        { error: 'Error al actualizar el perfil' },
        { status: 500 }
      );
    }

    // Get profile photo URL if exists
    let profilePhotoUrl: string | null = null;
    if (updatedUser.profile_photo_path) {
      const pathParts = updatedUser.profile_photo_path.split('/');
      if (pathParts.length > 1) {
        const bucket = pathParts[0];
        const filePath = pathParts.slice(1).join('/');
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);
        profilePhotoUrl = publicUrl;
      }
    }

    return NextResponse.json({
      message: 'Perfil actualizado exitosamente',
      profile: {
        userId: updatedUser.id,
        displayName: updatedUser.display_name,
        avatarEnergy: updatedUser.avatar_energy,
        isPrivate: updatedUser.is_private,
        isPremium: updatedUser.is_premium,
        coins: updatedUser.coins,
        streak: updatedUser.streak,
        updatedAt: updatedUser.updated_at,
        profilePhotoUrl: profilePhotoUrl,
        profilePhotoPath: updatedUser.profile_photo_path || null,
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

