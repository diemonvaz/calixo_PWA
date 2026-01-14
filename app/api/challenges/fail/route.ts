import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/challenges/fail
 * Mark a challenge as failed (e.g., due to interruption)
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
    const { userChallengeId, reason, sessionData } = body;

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

    // Update user challenge to failed
    const updatedSessionData = {
      ...(userChallenge.session_data || {}),
      ...sessionData,
      failureReason: reason,
    };

    const { error: updateError } = await supabase
      .from('user_challenges')
      .update({
        status: 'failed',
        failed_at: new Date().toISOString(),
        session_data: updatedSessionData,
      })
      .eq('id', userChallengeId);

    if (updateError) {
      throw updateError;
    }

    // Create focus session record if it's a focus challenge
    if (sessionData) {
      await supabase.from('focus_sessions').insert({
        user_challenge_id: userChallenge.id,
        duration_seconds: sessionData.durationSeconds || 0,
        interruptions: sessionData.interruptions || 0,
        completed_successfully: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Reto marcado como fallido',
    });
  } catch (error) {
    console.error('Error failing challenge:', error);
    return NextResponse.json(
      { error: 'Error al marcar el reto como fallido' },
      { status: 500 }
    );
  }
}
