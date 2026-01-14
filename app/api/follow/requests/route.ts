import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/follow/requests
 * Get follow requests (sent or received)
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
    const type = searchParams.get('type') || 'received'; // 'received' or 'sent'

    let query = supabase
      .from('follow_requests')
      .select(`
        id,
        requester_id,
        requested_id,
        status,
        created_at,
        updated_at,
        requester:requester_id (
          id,
          display_name
        ),
        requested:requested_id (
          id,
          display_name
        )
      `)
      .eq('status', 'pending');

    if (type === 'received') {
      query = query.eq('requested_id', user.id);
    } else {
      query = query.eq('requester_id', user.id);
    }

    const { data: requests, error: requestsError } = await query.order('created_at', { ascending: false });

    if (requestsError) {
      throw requestsError;
    }

    // Format requests
    const formattedRequests = (requests || []).map((req: any) => ({
      id: req.id,
      requesterId: req.requester_id,
      requestedId: req.requested_id,
      requesterName: req.requester?.display_name || 'Usuario',
      requestedName: req.requested?.display_name || 'Usuario',
      status: req.status,
      createdAt: req.created_at,
      updatedAt: req.updated_at,
    }));

    return NextResponse.json({
      requests: formattedRequests,
      type,
    });
  } catch (error) {
    console.error('Error fetching follow requests:', error);
    return NextResponse.json(
      { error: 'Error al obtener las solicitudes' },
      { status: 500 }
    );
  }
}
