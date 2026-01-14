import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateEnergyOnChallengeComplete } from '@/lib/avatar-energy';

/**
 * POST /api/challenges/complete
 * Complete a challenge and award coins
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
    const { userChallengeId, imageUrl, note, sessionData } = body;

    if (!userChallengeId) {
      return NextResponse.json(
        { error: 'User Challenge ID es requerido' },
        { status: 400 }
      );
    }

    // Get the user challenge
    const { data: userChallenge, error: challengeError } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('id', userChallengeId)
      .eq('user_id', user.id)
      .single();

    if (challengeError || !userChallenge) {
      return NextResponse.json(
        { error: 'Reto no encontrado' },
        { status: 404 }
      );
    }

    if (userChallenge.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Este reto ya no está en progreso' },
        { status: 400 }
      );
    }

    // Get challenge details
    const { data: challenge, error: challengeDetailsError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', userChallenge.challenge_id)
      .single();

    if (challengeDetailsError || !challenge) {
      return NextResponse.json(
        { error: 'Reto no encontrado' },
        { status: 404 }
      );
    }

    // Update user challenge to completed
    const { error: updateChallengeError } = await supabase
      .from('user_challenges')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        session_data: sessionData || userChallenge.session_data,
      })
      .eq('id', userChallengeId);

    if (updateChallengeError) {
      throw updateChallengeError;
    }

    // Get user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Update coins, streak, and avatar energy
    const newCoins = userData.coins + challenge.reward;
    const newStreak = userData.streak + 1;
    const newEnergy = updateEnergyOnChallengeComplete(
      userData.avatar_energy,
      challenge.type as 'daily' | 'focus' | 'social'
    );

    const { error: updateUserError } = await supabase
      .from('users')
      .update({
        coins: newCoins,
        streak: newStreak,
        avatar_energy: newEnergy,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateUserError) {
      throw updateUserError;
    }

    // Create transaction record
    await supabase.from('transactions').insert({
      user_id: user.id,
      amount: challenge.reward,
      type: 'earn',
      description: `Reto completado: ${challenge.title}`,
      challenge_id: challenge.id,
    });

    // Create focus session record if it's a focus challenge
    if (challenge.type === 'focus' && sessionData) {
      await supabase.from('focus_sessions').insert({
        user_challenge_id: userChallenge.id,
        duration_seconds: sessionData.durationSeconds || 0,
        interruptions: sessionData.interruptions || 0,
        completed_successfully: true,
      });
    }

    // Create feed item if note is provided (image is optional)
    let feedItem = null;
    if (note) {
      const { data: newFeedItem, error: feedError } = await supabase
        .from('feed_items')
        .insert({
          user_id: user.id,
          user_challenge_id: userChallenge.id,
          image_url: imageUrl || null,
          note,
        })
        .select()
        .single();

      if (!feedError && newFeedItem) {
        feedItem = {
          id: newFeedItem.id,
          userId: newFeedItem.user_id,
          userChallengeId: newFeedItem.user_challenge_id,
          imageUrl: newFeedItem.image_url,
          note: newFeedItem.note,
          likesCount: newFeedItem.likes_count,
          commentsCount: newFeedItem.comments_count,
          createdAt: newFeedItem.created_at,
        };
      }
    }

    return NextResponse.json({
      success: true,
      userChallenge: {
        id: userChallenge.id,
        userId: userChallenge.user_id,
        challengeId: userChallenge.challenge_id,
        status: 'completed',
        startedAt: userChallenge.started_at,
        completedAt: new Date().toISOString(),
        sessionData: sessionData || userChallenge.session_data,
        createdAt: userChallenge.created_at,
      },
      challenge: {
        id: challenge.id,
        type: challenge.type,
        title: challenge.title,
        description: challenge.description,
        reward: challenge.reward,
        durationMinutes: challenge.duration_minutes,
        isActive: challenge.is_active,
        createdAt: challenge.created_at,
      },
      coinsEarned: challenge.reward,
      newCoins,
      newStreak,
      newEnergy,
      feedItem,
    });
  } catch (error) {
    console.error('Error completing challenge:', error);
    return NextResponse.json(
      { error: 'Error al completar el reto' },
      { status: 500 }
    );
  }
}
