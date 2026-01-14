import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/avatar/equip
 * Equip or unequip an item
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
    const { itemId, equipped } = body;

    if (!itemId || equipped === undefined) {
      return NextResponse.json(
        { error: 'itemId y equipped son requeridos' },
        { status: 400 }
      );
    }

    // Get the customization
    const { data: customization, error: customError } = await supabase
      .from('avatar_customizations')
      .select('*')
      .eq('user_id', user.id)
      .eq('item_id', itemId)
      .single();

    if (customError || !customization) {
      return NextResponse.json(
        { error: 'No tienes este item desbloqueado' },
        { status: 404 }
      );
    }

    // If equipping, unequip other items in the same category
    if (equipped) {
      await supabase
        .from('avatar_customizations')
        .update({ equipped: false })
        .eq('user_id', user.id)
        .eq('category', customization.category);
    }

    // Update the item
    const { error: updateError } = await supabase
      .from('avatar_customizations')
      .update({ equipped })
      .eq('user_id', user.id)
      .eq('item_id', itemId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: equipped ? 'Item equipado' : 'Item desequipado',
    });
  } catch (error) {
    console.error('Error equipping item:', error);
    return NextResponse.json(
      { error: 'Error al equipar item' },
      { status: 500 }
    );
  }
}






