import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/store/purchase
 * Comprar un cupón de la tienda
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
    const { couponId } = body;

    if (!couponId) {
      return NextResponse.json(
        { error: 'couponId es requerido' },
        { status: 400 }
      );
    }

    // Obtener el cupón
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', couponId)
      .eq('is_active', true)
      .single();

    if (couponError || !coupon) {
      return NextResponse.json(
        { error: 'Cupón no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el cupón no haya expirado
    const now = new Date();
    const validUntil = new Date(coupon.valid_until);
    if (validUntil < now) {
      return NextResponse.json(
        { error: 'Este cupón ha expirado' },
        { status: 400 }
      );
    }

    // Obtener usuario
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

    // Verificar si el usuario ya tiene este cupón
    const { data: existingPurchase } = await supabase
      .from('user_coupons')
      .select('*')
      .eq('user_id', user.id)
      .eq('coupon_id', couponId)
      .single();

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'Ya tienes este cupón' },
        { status: 400 }
      );
    }

    // Verificar que el usuario tenga suficientes monedas
    if (userData.coins < coupon.price) {
      return NextResponse.json(
        { error: 'No tienes suficientes monedas' },
        { status: 400 }
      );
    }

    // Deduct coins
    const newCoins = userData.coins - coupon.price;
    const { error: updateError } = await supabase
      .from('users')
      .update({
        coins: newCoins,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    // Crear registro de transacción
    await supabase.from('transactions').insert({
      user_id: user.id,
      amount: -coupon.price,
      type: 'spend',
      description: `Comprado cupón: ${coupon.code} - ${coupon.partner_name}`,
      coupon_code: coupon.code,
    });

    // Registrar la compra del cupón
    const { data: userCoupon, error: userCouponError } = await supabase
      .from('user_coupons')
      .insert({
        user_id: user.id,
        coupon_id: coupon.id,
      })
      .select()
      .single();

    if (userCouponError || !userCoupon) {
      throw userCouponError;
    }

    return NextResponse.json({
      success: true,
      newCoins,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountPercent: coupon.discount_percent,
        partnerName: coupon.partner_name,
        description: coupon.description,
        price: coupon.price,
        validUntil: coupon.valid_until,
      },
      purchase: {
        id: userCoupon.id,
        purchasedAt: userCoupon.purchased_at,
      },
    });
  } catch (error) {
    console.error('Error purchasing coupon:', error);
    return NextResponse.json(
      { error: 'Error al comprar cupón' },
      { status: 500 }
    );
  }
}
