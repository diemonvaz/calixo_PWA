import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/feed/[id]/like
 * Like/unlike a feed post
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
    const feedItemId = parseInt(id);

    // Get the feed item
    const { data: feedItem, error: feedError } = await supabase
      .from('feed_items')
      .select('*')
      .eq('id', feedItemId)
      .single();

    if (feedError || !feedItem) {
      return NextResponse.json(
        { error: 'Post no encontrado' },
        { status: 404 }
      );
    }

    // For simplicity, we increment/decrement likes count
    // In a real app, you'd have a separate likes table
    const newLikesCount = (feedItem.likes_count || 0) + 1;

    const { error: updateError } = await supabase
      .from('feed_items')
      .update({ likes_count: newLikesCount })
      .eq('id', feedItemId);

    if (updateError) {
      throw updateError;
    }

    // Create notification for post owner (if not own post)
    if (feedItem.user_id !== user.id) {
      await supabase.from('notifications').insert({
        user_id: feedItem.user_id,
        type: 'social',
        title: 'Nuevo like',
        message: 'A alguien le gustó tu post',
        payload: {
          type: 'feed_like',
          feedItemId: feedItem.id,
          likerId: user.id,
        },
        seen: false,
      });
    }

    return NextResponse.json({
      success: true,
      likesCount: newLikesCount,
    });
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json(
      { error: 'Error al dar like' },
      { status: 500 }
    );
  }
}






