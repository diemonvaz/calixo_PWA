import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/server';

/**
 * POST /api/stripe/checkout
 * Create a Stripe checkout session for subscription
 * En PRE mode, activa premium directamente sin pasar por Stripe
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
    const { priceId, plan } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'priceId es requerido' },
        { status: 400 }
      );
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    if (userData.is_premium) {
      return NextResponse.json(
        { error: 'Ya tienes una subscripción activa' },
        { status: 400 }
      );
    }

    const appEnv = process.env.APP_ENV || 'PRO';

    if (appEnv === 'PRE') {
      console.log('🔧 PRE MODE: Activando premium sin Stripe');

      await supabase
        .from('users')
        .update({
          is_premium: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      const now = new Date();
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

      await supabase.from('subscriptions').insert({
        user_id: user.id,
        stripe_subscription_id: `pre_${user.id}_${Date.now()}`,
        status: 'active',
        plan: plan || 'premium',
        current_period_start: now.toISOString(),
        current_period_end: oneYearLater.toISOString(),
        cancel_at_period_end: false,
      });

      console.log('PRE MODE: Premium activado para usuario', user.id);

      return NextResponse.json({
        sessionId: 'pre_mode_session',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/success?session_id=pre_mode`,
        preMode: true,
      });
    }

    console.log('💳 PRO MODE: Creando sesión de Stripe');

    const email = user.email;

    if (!email) {
      return NextResponse.json(
        { error: 'Email no encontrado' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
      metadata: {
        userId: user.id,
        plan: plan || 'premium',
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan: plan || 'premium',
        },
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      preMode: false,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error al crear la sesión de pago' },
      { status: 500 }
    );
  }
}
