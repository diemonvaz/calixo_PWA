import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/notifications/[id]/read
 * Mark notification as read
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const notificationId = parseInt(id);

    // Update notification
    const { data: updated, error: updateError } = await supabase
      .from('notifications')
      .update({ seen: true })
      .eq('id', notificationId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { error: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      notification: {
        id: updated.id,
        userId: updated.user_id,
        type: updated.type,
        title: updated.title,
        message: updated.message,
        payload: updated.payload,
        seen: updated.seen,
        createdAt: updated.created_at,
      },
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Error al marcar notificación' },
      { status: 500 }
    );
  }
}






