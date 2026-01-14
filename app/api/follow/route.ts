import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/follow
 * Follow/unfollow a user
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

    const body = await request.json();
    const { userId: targetUserId, action } = body;

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }

    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: 'No puedes seguirte a ti mismo' },
        { status: 400 }
      );
    }

    // Get target user's profile to check if private
    const { data: targetUser, error: targetUserError } = await supabase
      .from('users')
      .select('is_private')
      .eq('id', targetUserId)
      .single();

    if (targetUserError || !targetUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const isPrivate = targetUser.is_private;

    // Check if already following
    const { data: existing } = await supabase
      .from('followers')
      .select('*')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .single();

    // Check if there's a pending request
    const { data: pendingRequest } = await supabase
      .from('follow_requests')
      .select('*')
      .eq('requester_id', user.id)
      .eq('requested_id', targetUserId)
      .eq('status', 'pending')
      .single();

    if (action === 'follow') {
      if (existing) {
        return NextResponse.json(
          { error: 'Ya sigues a este usuario' },
          { status: 400 }
        );
      }

      if (pendingRequest) {
        return NextResponse.json(
          { error: 'Ya tienes una solicitud pendiente con este usuario' },
          { status: 400 }
        );
      }

      // If profile is private, create a follow request instead
      if (isPrivate) {
        const { data: newRequest, error: requestError } = await supabase
          .from('follow_requests')
          .insert({
            requester_id: user.id,
            requested_id: targetUserId,
            status: 'pending',
          })
          .select()
          .single();

        if (requestError) {
          throw requestError;
        }

        // Create notification for follow request
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: targetUserId,
            type: 'social',
            title: 'Nueva solicitud de seguimiento',
            message: 'Tienes una nueva solicitud de seguimiento',
            payload: {
              type: 'follow_request',
              requesterId: user.id,
              requestId: newRequest.id,
            },
            seen: false,
          });

        if (notifError) {
          console.error('Error creating notification:', notifError);
        }

        return NextResponse.json({
          success: true,
          message: 'Solicitud de seguimiento enviada',
          requiresApproval: true,
          requestId: newRequest.id,
        });
      }

      // Profile is public, follow directly
      const { error: followError } = await supabase
        .from('followers')
        .insert({
          follower_id: user.id,
          following_id: targetUserId,
        });

      if (followError) {
        throw followError;
      }

      // Create notification
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          type: 'social',
          title: 'Nuevo seguidor',
          message: 'Tienes un nuevo seguidor',
          payload: {
            type: 'new_follower',
            followerId: user.id,
          },
          seen: false,
        });

      if (notifError) {
        console.error('Error creating notification:', notifError);
      }

      // Get updated followers count
      const { count: followersCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', targetUserId);

      return NextResponse.json({
        success: true,
        message: 'Ahora sigues a este usuario',
        followersCount: followersCount || 0,
        requiresApproval: false,
      });
    } else if (action === 'unfollow') {
      // Check if there's a pending request to cancel
      if (pendingRequest) {
        const { error: deleteRequestError } = await supabase
          .from('follow_requests')
          .delete()
          .eq('id', pendingRequest.id);

        if (deleteRequestError) {
          throw deleteRequestError;
        }

        return NextResponse.json({
          success: true,
          message: 'Solicitud cancelada',
          cancelledRequest: true,
        });
      }

      // If not following, return error
      if (!existing) {
        return NextResponse.json(
          { error: 'No sigues a este usuario' },
          { status: 400 }
        );
      }

      // Remove follow relationship
      const { error: unfollowError } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

      if (unfollowError) {
        throw unfollowError;
      }

      // Get updated followers count
      const { count: followersCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', targetUserId);

      return NextResponse.json({
        success: true,
        message: 'Dejaste de seguir a este usuario',
        followersCount: followersCount || 0,
      });
    } else {
      return NextResponse.json(
        { error: 'Acción inválida. Usa "follow" o "unfollow"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error following/unfollowing user:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}






