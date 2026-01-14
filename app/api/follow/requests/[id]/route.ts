import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/follow/requests/[id]
 * Accept or reject a follow request
 */
export async function PATCH(
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
    const requestId = parseInt(id);

    const body = await request.json();
    const { action } = body; // 'accept' or 'reject'

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Acción inválida. Usa "accept" o "reject"' },
        { status: 400 }
      );
    }

    // Get the follow request
    const { data: followRequest, error: requestError } = await supabase
      .from('follow_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !followRequest) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    // Verify that the current user is the one who received the request
    if (followRequest.requested_id !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado para esta acción' },
        { status: 403 }
      );
    }

    // Check if request is already processed
    if (followRequest.status !== 'pending') {
      return NextResponse.json(
        { error: `Esta solicitud ya fue ${followRequest.status === 'accepted' ? 'aceptada' : 'rechazada'}` },
        { status: 400 }
      );
    }

    // Update request status
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const { data: updatedRequest, error: updateError } = await supabase
      .from('follow_requests')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Mark the notification as read (for both accept and reject)
    // Find notification by requestId in payload - search all notifications
    // Use a more direct approach: search for notifications with the specific requestId
    const { data: allNotifications, error: notifSearchError } = await supabase
      .from('notifications')
      .select('id, payload, seen')
      .eq('user_id', user.id)
      .eq('type', 'social');

    if (!notifSearchError && allNotifications && allNotifications.length > 0) {
      // Find the notification with matching requestId
      const matchingNotification = allNotifications.find(
        (n: any) => {
          const payload = n.payload || {};
          return payload.type === 'follow_request' && payload.requestId === requestId;
        }
      );

      if (matchingNotification && !matchingNotification.seen) {
        const { error: updateNotifError } = await supabase
          .from('notifications')
          .update({ seen: true })
          .eq('id', matchingNotification.id);

        if (updateNotifError) {
          console.error('Error marking notification as read:', updateNotifError);
        } else {
          console.log(`Notification ${matchingNotification.id} marked as read for request ${requestId}`);
        }
      }
    }

    // If accepted, the trigger will automatically create the follow relationship
    // But we need to get the updated followers count
    let followersCount = 0;
    if (action === 'accept') {
      const { count } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);
      followersCount = count || 0;

      // Create notification for requester
      await supabase.from('notifications').insert({
        user_id: followRequest.requester_id,
        type: 'social',
        title: 'Solicitud aceptada',
        message: 'Tu solicitud de seguimiento fue aceptada',
        payload: {
          type: 'follow_request_accepted',
          requestedId: user.id,
        },
        seen: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: action === 'accept' 
        ? 'Solicitud aceptada' 
        : 'Solicitud rechazada',
      status: newStatus,
      followersCount: action === 'accept' ? followersCount : undefined,
    });
  } catch (error) {
    console.error('Error processing follow request:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/follow/requests/[id]
 * Cancel a pending follow request (only by requester)
 */
export async function DELETE(
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
    const requestId = parseInt(id);

    // Get the follow request
    const { data: followRequest, error: requestError } = await supabase
      .from('follow_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !followRequest) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    // Verify that the current user is the requester
    if (followRequest.requester_id !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado para cancelar esta solicitud' },
        { status: 403 }
      );
    }

    // Only allow canceling pending requests
    if (followRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Solo se pueden cancelar solicitudes pendientes' },
        { status: 400 }
      );
    }

    // Delete the request
    const { error: deleteError } = await supabase
      .from('follow_requests')
      .delete()
      .eq('id', requestId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitud cancelada',
    });
  } catch (error) {
    console.error('Error canceling follow request:', error);
    return NextResponse.json(
      { error: 'Error al cancelar la solicitud' },
      { status: 500 }
    );
  }
}
