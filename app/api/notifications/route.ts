import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/notifications
 * Get user notifications
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unseenOnly = searchParams.get('unseenOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unseenOnly) {
      query = query.eq('seen', false);
    }

    const { data: results, error: queryError } = await query;

    if (queryError) {
      throw queryError;
    }

    // Count unseen
    const unseenCount = (results || []).filter(n => !n.seen).length;

    // Collect user IDs from payloads to fetch user names
    const userIds = new Set<string>();
    (results || []).forEach(n => {
      const payload = n.payload || {};
      if (payload.requesterId) userIds.add(payload.requesterId);
      if (payload.followerId) userIds.add(payload.followerId);
      if (payload.likerId) userIds.add(payload.likerId);
      if (payload.commenterId) userIds.add(payload.commenterId);
      if (payload.requestedId) userIds.add(payload.requestedId);
    });

    // Fetch user display names
    let usersMap: Record<string, string> = {};
    if (userIds.size > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, display_name')
        .in('id', Array.from(userIds));

      usersMap = (users || []).reduce((acc, u) => {
        acc[u.id] = u.display_name || 'Usuario';
        return acc;
      }, {} as Record<string, string>);
    }

    // Format results with enriched payload
    const formattedResults = (results || []).map(n => {
      const payload = n.payload || {};
      const enrichedPayload = { ...payload };

      // Add user names to payload
      if (payload.requesterId && usersMap[payload.requesterId]) {
        enrichedPayload.requesterName = usersMap[payload.requesterId];
      }
      if (payload.followerId && usersMap[payload.followerId]) {
        enrichedPayload.followerName = usersMap[payload.followerId];
      }
      if (payload.likerId && usersMap[payload.likerId]) {
        enrichedPayload.likerName = usersMap[payload.likerId];
      }
      if (payload.commenterId && usersMap[payload.commenterId]) {
        enrichedPayload.commenterName = usersMap[payload.commenterId];
      }
      if (payload.requestedId && usersMap[payload.requestedId]) {
        enrichedPayload.requestedName = usersMap[payload.requestedId];
      }

      return {
        id: n.id,
        userId: n.user_id,
        type: n.type,
        title: n.title,
        message: n.message,
        payload: enrichedPayload,
        seen: n.seen,
        createdAt: n.created_at,
      };
    });

    return NextResponse.json({
      notifications: formattedResults,
      unseenCount,
      total: formattedResults.length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Error al obtener notificaciones' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a test notification (for development)
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
    const { type, title, message, payload } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'type, title y message son requeridos' },
        { status: 400 }
      );
    }

    // Create notification
    const { data: notification, error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type,
        title,
        message,
        payload: payload || null,
        seen: false,
      })
      .select()
      .single();

    if (insertError || !notification) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        userId: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        payload: notification.payload,
        seen: notification.seen,
        createdAt: notification.created_at,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Error al crear notificación' },
      { status: 500 }
    );
  }
}






