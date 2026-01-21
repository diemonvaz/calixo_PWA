import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/profile/photo
 * Upload profile photo to Supabase Storage and update user record
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no válido. Solo JPG, PNG o WEBP' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Máximo 5MB' },
        { status: 400 }
      );
    }

    // Get current user data to check if there's an existing photo
    const { data: currentUser } = await supabase
      .from('users')
      .select('profile_photo_path')
      .eq('id', user.id)
      .single();

    // Delete old photo if exists
    if (currentUser?.profile_photo_path) {
      const oldPath = currentUser.profile_photo_path;
      // Extract bucket and path from the stored path
      // Assuming format: bucket-name/path/to/file
      const pathParts = oldPath.split('/');
      if (pathParts.length > 1) {
        const bucket = pathParts[0];
        const filePath = pathParts.slice(1).join('/');
        await supabase.storage
          .from(bucket)
          .remove([filePath]);
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const filename = `${user.id}/profile-${timestamp}-${randomString}.${extension}`;

    // Convert File to ArrayBuffer for Supabase
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage (bucket: profile-photos)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      
      // Provide more specific error messages
      if (uploadError.message?.includes('Bucket not found') || uploadError.statusCode === '404') {
        return NextResponse.json(
          { error: 'El bucket de almacenamiento no existe. Por favor, crea el bucket "profile-photos" en Supabase Storage.' },
          { status: 500 }
        );
      }
      
      if (uploadError.message?.includes('row-level security') || uploadError.statusCode === '403') {
        return NextResponse.json(
          { error: 'Error de permisos. Verifica que las políticas RLS estén configuradas correctamente en Supabase Storage.' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: `Error al subir la imagen: ${uploadError.message || 'Error desconocido'}` },
        { status: 500 }
      );
    }

    // Store the path as bucket/path format
    const storagePath = `profile-photos/${uploadData.path}`;

    // Update user record with the photo path
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        profile_photo_path: storagePath,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating user:', updateError);
      // Try to delete the uploaded file if update fails
      await supabase.storage
        .from('profile-photos')
        .remove([uploadData.path]);
      
      return NextResponse.json(
        { error: 'Error al actualizar el perfil' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(uploadData.path);

    return NextResponse.json({
      url: publicUrl,
      path: storagePath,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Error al procesar la imagen' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/photo
 * Delete profile photo
 */
export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Get current user data
    const { data: currentUser } = await supabase
      .from('users')
      .select('profile_photo_path')
      .eq('id', user.id)
      .single();

    if (!currentUser?.profile_photo_path) {
      return NextResponse.json(
        { error: 'No hay foto de perfil para eliminar' },
        { status: 404 }
      );
    }

    // Delete photo from storage
    const oldPath = currentUser.profile_photo_path;
    const pathParts = oldPath.split('/');
    if (pathParts.length > 1) {
      const bucket = pathParts[0];
      const filePath = pathParts.slice(1).join('/');
      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (deleteError) {
        console.error('Error deleting photo:', deleteError);
        // Continue anyway to update the database
      }
    }

    // Update user record
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        profile_photo_path: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Error al actualizar el perfil' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Foto de perfil eliminada exitosamente',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la foto' },
      { status: 500 }
    );
  }
}
