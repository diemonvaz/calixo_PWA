import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { userChallenges, challenges, profiles, transactions, feedItems, focusSessions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { updateEnergyOnChallengeComplete } from '@/lib/avatar-energy';

/**
 * POST /api/challenges/complete
 * Complete a challenge and award coins
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
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
    const [userChallenge] = await db
      .select()
      .from(userChallenges)
      .where(
        and(
          eq(userChallenges.id, userChallengeId),
          eq(userChallenges.userId, user.id)
        )
      )
      .limit(1);

    if (!userChallenge) {
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
    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, userChallenge.challengeId))
      .limit(1);

    if (!challenge) {
      return NextResponse.json(
        { error: 'Reto no encontrado' },
        { status: 404 }
      );
    }

    // Update user challenge to completed
    await db
      .update(userChallenges)
      .set({
        status: 'completed',
        completedAt: new Date(),
        sessionData: sessionData || userChallenge.sessionData,
      })
      .where(eq(userChallenges.id, userChallengeId));

    // Award coins to user
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    // Update coins, streak, and avatar energy
    const newCoins = profile.coins + challenge.reward;
    const newStreak = profile.streak + 1;
    const newEnergy = updateEnergyOnChallengeComplete(
      profile.avatarEnergy,
      challenge.type as 'daily' | 'focus' | 'social'
    );

    await db
      .update(profiles)
      .set({
        coins: newCoins,
        streak: newStreak,
        avatarEnergy: newEnergy,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, user.id));

    // Create transaction record
    await db.insert(transactions).values({
      userId: user.id,
      amount: challenge.reward,
      type: 'earn',
      description: `Reto completado: ${challenge.title}`,
      challengeId: challenge.id,
      createdAt: new Date(),
    });

    // Create focus session record if it's a focus challenge
    if (challenge.type === 'focus' && sessionData) {
      await db.insert(focusSessions).values({
        userChallengeId: userChallenge.id,
        durationSeconds: sessionData.durationSeconds || 0,
        interruptions: sessionData.interruptions || 0,
        completedSuccessfully: true,
        createdAt: new Date(),
      });
    }

    // Create feed item if image and note are provided
    let feedItem = null;
    if (imageUrl && note) {
      [feedItem] = await db.insert(feedItems).values({
        userId: user.id,
        userChallengeId: userChallenge.id,
        imageUrl,
        note,
        createdAt: new Date(),
      }).returning();
    }

    return NextResponse.json({
      success: true,
      userChallenge,
      challenge,
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

