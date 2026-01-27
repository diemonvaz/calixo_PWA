import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/store/coupons
 * Obtener todos los códigos de descuento activos disponibles
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Obtener todos los cupones activos y válidos
    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('id, code, discount_percent, partner_name, description, valid_until')
      .eq('is_active', true)
      .gt('valid_until', new Date().toISOString())
      .order('partner_name', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      coupons: coupons || [],
      total: coupons?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'Error al obtener códigos de descuento' },
      { status: 500 }
    );
  }
}
