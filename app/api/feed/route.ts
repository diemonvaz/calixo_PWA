import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/feed
 * Get feed items (global or from followed users)
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'following'; // 'following' or 'global'
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let userIds: string[] = [];

    if (type === 'following') {
      // Get users the current user follows
      const { data: following, error: followingError } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', user.id);

      if (followingError) {
        throw followingError;
      }

      const followingIds = (following || []).map(f => f.following_id);
      
      // Only include followed users posts (exclude own posts)
      userIds = followingIds;

      if (userIds.length === 0) {
        return NextResponse.json({
          feedItems: [],
          hasMore: false,
          total: 0,
        });
      }
    } else {
      // Global feed - all public posts
      const { data: publicUsers, error: publicUsersError } = await supabase
        .from('users')
        .select('id')
        .eq('is_private', false);

      if (publicUsersError) {
        throw publicUsersError;
      }

      // Exclude own posts from global feed
      userIds = (publicUsers || []).map(u => u.id).filter(id => id !== user.id);

      if (userIds.length === 0) {
        return NextResponse.json({
          feedItems: [],
          hasMore: false,
          total: 0,
        });
      }
    }

    // Get feed items (exclude own posts)
    const { data: feedItems, error: feedError } = await supabase
      .from('feed_items')
      .select('*')
      .in('user_id', userIds)
      .neq('user_id', user.id) // Explicitly exclude own posts
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (feedError) {
      throw feedError;
    }

    if (!feedItems || feedItems.length === 0) {
      return NextResponse.json({
        feedItems: [],
        hasMore: false,
        total: 0,
      });
    }

    // Get unique user IDs and challenge IDs
    const uniqueUserIds = [...new Set(feedItems.map(fi => fi.user_id))];
    const uniqueUserChallengeIds = [...new Set(
      feedItems
        .map(fi => fi.user_challenge_id)
        .filter((id): id is number => id != null && id !== undefined)
    )];

    // Fetch related data in parallel
    const [usersResult, userChallengesResult] = await Promise.all([
      supabase
        .from('users')
        .select('*')
        .in('id', uniqueUserIds),
      uniqueUserChallengeIds.length > 0
        ? supabase
            .from('user_challenges')
            .select('*')
            .in('id', uniqueUserChallengeIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (usersResult.error) {
      throw usersResult.error;
    }
    if (userChallengesResult.error) {
      throw userChallengesResult.error;
    }

    const usersMap = new Map((usersResult.data || []).map(u => [u.id, u]));
    const userChallengesMap = new Map((userChallengesResult.data || []).map(uc => [uc.id, uc]));

    // Get unique challenge IDs
    const uniqueChallengeIds = [...new Set(
      (userChallengesResult.data || []).map(uc => uc.challenge_id).filter(Boolean)
    )];

    // Fetch challenges
    const { data: challenges, error: challengesError } = uniqueChallengeIds.length > 0
      ? await supabase
          .from('challenges')
          .select('*')
          .in('id', uniqueChallengeIds)
      : { data: [], error: null };

    if (challengesError) {
      throw challengesError;
    }

    const challengesMap = new Map((challenges || []).map(c => [c.id, c]));

    // Format results
    const formattedResults = feedItems.map((feedItem: any) => {
      const user = usersMap.get(feedItem.user_id);
      const userChallenge = feedItem.user_challenge_id 
        ? userChallengesMap.get(feedItem.user_challenge_id)
        : null;
      const challenge = userChallenge?.challenge_id
        ? challengesMap.get(userChallenge.challenge_id)
        : null;

      return {
        feedItem: {
          id: feedItem.id,
          userId: feedItem.user_id,
          userChallengeId: feedItem.user_challenge_id,
          imageUrl: feedItem.image_url,
          note: feedItem.note,
          likesCount: feedItem.likes_count,
          commentsCount: feedItem.comments_count,
          createdAt: feedItem.created_at,
        },
        profile: user ? {
          userId: user.id,
          displayName: user.display_name,
          avatarEnergy: user.avatar_energy,
          isPrivate: user.is_private,
          isPremium: user.is_premium,
          coins: user.coins,
          streak: user.streak,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        } : null,
        userChallenge: userChallenge ? {
          id: userChallenge.id,
          userId: userChallenge.user_id,
          challengeId: userChallenge.challenge_id,
          status: userChallenge.status,
          startedAt: userChallenge.started_at,
          completedAt: userChallenge.completed_at,
          failedAt: userChallenge.failed_at,
          sessionData: userChallenge.session_data,
          createdAt: userChallenge.created_at,
        } : null,
        challenge: challenge ? {
          id: challenge.id,
          type: challenge.type,
          title: challenge.title,
          description: challenge.description,
          reward: challenge.reward,
          durationMinutes: challenge.duration_minutes,
          isActive: challenge.is_active,
          createdAt: challenge.created_at,
        } : null,
      };
    });

    const hasMore = formattedResults.length === limit;

    return NextResponse.json({
      feedItems: formattedResults,
      hasMore,
      total: formattedResults.length,
    });
  } catch (error: any) {
    console.error('Error fetching feed:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener el feed',
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/feed
 * Create a new feed post (already handled in challenges/complete, this is for manual posts)
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
    const { userChallengeId, imageUrl, note } = body;

    if (!userChallengeId || !imageUrl || !note) {
      return NextResponse.json(
        { error: 'userChallengeId, imageUrl y note son requeridos' },
        { status: 400 }
      );
    }

    // Verify the user challenge belongs to this user
    const { data: userChallenge, error: challengeError } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('id', userChallengeId)
      .eq('user_id', user.id)
      .single();

    if (challengeError || !userChallenge) {
      return NextResponse.json(
        { error: 'Reto no encontrado o no autorizado' },
        { status: 404 }
      );
    }

    // Create feed item
    const { data: feedItem, error: insertError } = await supabase
      .from('feed_items')
      .insert({
        user_id: user.id,
        user_challenge_id: userChallengeId,
        image_url: imageUrl,
        note,
      })
      .select()
      .single();

    if (insertError || !feedItem) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      feedItem: {
        id: feedItem.id,
        userId: feedItem.user_id,
        userChallengeId: feedItem.user_challenge_id,
        imageUrl: feedItem.image_url,
        note: feedItem.note,
        likesCount: feedItem.likes_count,
        commentsCount: feedItem.comments_count,
        createdAt: feedItem.created_at,
      },
    });
  } catch (error) {
    console.error('Error creating feed post:', error);
    return NextResponse.json(
      { error: 'Error al crear el post' },
      { status: 500 }
    );
  }
}
