import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/challenges/cancel
 * Cancel a challenge that is in progress
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
    const { userChallengeId } = body;

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

    // Prepare update data - use 'failed' status since 'canceled' is not in the enum
    // We'll mark it as failed but add cancellation info in session_data
    const updateData: any = {
      status: 'failed', // Using 'failed' since 'canceled' is not in the enum
      failed_at: new Date().toISOString(),
    };

    // Update session_data to indicate it was canceled by user
    if (userChallenge.session_data) {
      updateData.session_data = {
        ...userChallenge.session_data,
        cancellationReason: 'Cancelado por el usuario',
        cancelledAt: new Date().toISOString(),
        wasCanceled: true,
      };
    } else {
      updateData.session_data = {
        cancellationReason: 'Cancelado por el usuario',
        cancelledAt: new Date().toISOString(),
        wasCanceled: true,
      };
    }

    console.log('Updating challenge with data:', updateData);

    const { data: updatedChallenge, error: updateError } = await supabase
      .from('user_challenges')
      .update(updateData)
      .eq('id', userChallengeId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating challenge status:', updateError);
      console.error('Update error details:', JSON.stringify(updateError, null, 2));
      return NextResponse.json(
        { 
          error: 'Error al cancelar el reto',
          details: updateError.message || 'Error desconocido'
        },
        { status: 500 }
      );
    }

    if (!updatedChallenge) {
      console.error('Challenge was not updated - no data returned');
      return NextResponse.json(
        { error: 'No se pudo actualizar el reto' },
        { status: 500 }
      );
    }

    // Verify the status was actually updated to 'failed'
    if (updatedChallenge.status !== 'failed') {
      console.error('Challenge status was not updated to failed. Current status:', updatedChallenge.status);
      return NextResponse.json(
        { error: 'El estado del reto no se actualizó correctamente' },
        { status: 500 }
      );
    }

    console.log('Challenge canceled successfully (marked as failed):', updatedChallenge);

    return NextResponse.json({
      success: true,
      message: 'Reto cancelado exitosamente',
      challenge: updatedChallenge,
    });
  } catch (error: any) {
    console.error('Error canceling challenge:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Error al cancelar el reto',
        details: error.message || 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
