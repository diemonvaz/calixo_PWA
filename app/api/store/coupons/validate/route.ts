import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/store/coupons/validate
 * Validar un código de descuento
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
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Código de descuento requerido' },
        { status: 400 }
      );
    }

    // Buscar el cupón
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single();

    if (couponError || !coupon) {
      return NextResponse.json(
        { error: 'Código de descuento no válido o expirado' },
        { status: 404 }
      );
    }

    // Verificar que el cupón no haya expirado
    const now = new Date();
    const validUntil = new Date(coupon.valid_until);
    
    if (validUntil < now) {
      return NextResponse.json(
        { error: 'Este código de descuento ha expirado' },
        { status: 400 }
      );
    }

    // Verificar límite de usos si existe
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return NextResponse.json(
        { error: 'Este código de descuento ha alcanzado su límite de usos' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountPercent: coupon.discount_percent,
        partnerName: coupon.partner_name,
        description: coupon.description,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { error: 'Error al validar código de descuento' },
      { status: 500 }
    );
  }
}
