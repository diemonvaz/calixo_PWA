import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/store/purchase
 * Purchase an item from the store
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
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: 'itemId es requerido' },
        { status: 400 }
      );
    }

    // Get the store item
    const { data: item, error: itemError } = await supabase
      .from('store_items')
      .select('*')
      .eq('id', itemId)
      .eq('is_active', true)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Item no encontrado' },
        { status: 404 }
      );
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

    // Check if user has enough coins
    if (userData.coins < item.price) {
      return NextResponse.json(
        { error: 'No tienes suficientes monedas' },
        { status: 400 }
      );
    }

    // Check premium requirement
    if (item.premium_only && !userData.is_premium) {
      return NextResponse.json(
        { error: 'Este item requiere cuenta Premium' },
        { status: 400 }
      );
    }

    // Check if user already has this item
    const { data: existing } = await supabase
      .from('avatar_customizations')
      .select('*')
      .eq('user_id', user.id)
      .eq('item_id', item.item_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Ya tienes este item' },
        { status: 400 }
      );
    }

    // Deduct coins
    const newCoins = userData.coins - item.price;
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

    // Create transaction record
    await supabase.from('transactions').insert({
      user_id: user.id,
      amount: -item.price,
      type: 'spend',
      item_id: item.id,
      description: `Comprado: ${item.name}`,
    });

    // Unlock the item
    const { data: customization, error: customizationError } = await supabase
      .from('avatar_customizations')
      .insert({
        user_id: user.id,
        category: item.category,
        item_id: item.item_id,
        equipped: false,
      })
      .select()
      .single();

    if (customizationError || !customization) {
      throw customizationError;
    }

    return NextResponse.json({
      success: true,
      newCoins,
      item: {
        id: item.id,
        name: item.name,
        category: item.category,
        itemId: item.item_id,
        price: item.price,
        premiumOnly: item.premium_only,
        imageUrl: item.image_url,
        description: item.description,
        isActive: item.is_active,
        createdAt: item.created_at,
      },
      customization: {
        id: customization.id,
        userId: customization.user_id,
        category: customization.category,
        itemId: customization.item_id,
        equipped: customization.equipped,
        unlockedAt: customization.unlocked_at,
      },
    });
  } catch (error) {
    console.error('Error purchasing item:', error);
    return NextResponse.json(
      { error: 'Error al comprar item' },
      { status: 500 }
    );
  }
}
