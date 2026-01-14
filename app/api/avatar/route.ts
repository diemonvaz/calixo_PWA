import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/avatar
 * Get user's avatar customizations and available items
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
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

    // Get user's customizations
    const { data: customizations, error: customizationsError } = await supabase
      .from('avatar_customizations')
      .select('*')
      .eq('user_id', user.id);

    if (customizationsError) {
      throw customizationsError;
    }

    // Get all available store items
    const { data: items, error: itemsError } = await supabase
      .from('store_items')
      .select('*')
      .eq('is_active', true);

    if (itemsError) {
      throw itemsError;
    }

    // Calculate energy level
    const avatarEnergy = userData.avatar_energy || 100;
    const energyLevel = avatarEnergy >= 70
      ? 'alta'
      : avatarEnergy >= 40
      ? 'media'
      : 'baja';

    // Format customizations
    const formattedCustomizations = (customizations || []).map(c => ({
      id: c.id,
      userId: c.user_id,
      category: c.category,
      itemId: c.item_id,
      unlockedAt: c.unlocked_at,
      equipped: c.equipped,
    }));

    // Group customizations by category
    const customizationsByCategory = formattedCustomizations.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, typeof formattedCustomizations>);

    // Get equipped items per category
    const equippedItems = formattedCustomizations
      .filter(c => c.equipped)
      .reduce((acc, item) => {
        acc[item.category] = item.itemId;
        return acc;
      }, {} as Record<string, string>);

    // Calculate unlocked categories
    const unlockedCategories = Object.keys(customizationsByCategory);

    // Format items
    const formattedItems = (items || []).map(item => ({
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
    }));

    return NextResponse.json({
      profile: {
        avatarEnergy,
        energyLevel,
        coins: userData.coins,
        isPremium: userData.is_premium,
      },
      customizations: customizationsByCategory,
      equippedItems,
      unlockedCategories,
      availableItems: formattedItems,
    });
  } catch (error) {
    console.error('Error fetching avatar data:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos del avatar' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/avatar
 * Unlock a new item (requires purchase from store)
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
      .eq('item_id', itemId)
      .eq('is_active', true)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Item no encontrado' },
        { status: 404 }
      );
    }

    // Check if user already has this item
    const { data: existing } = await supabase
      .from('avatar_customizations')
      .select('*')
      .eq('user_id', user.id)
      .eq('item_id', itemId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Ya tienes este item' },
        { status: 400 }
      );
    }

    // Add to user's customizations (unlocked but not equipped)
    const { data: newCustomization, error: insertError } = await supabase
      .from('avatar_customizations')
      .insert({
        user_id: user.id,
        category: item.category,
        item_id: item.item_id,
        equipped: false,
      })
      .select()
      .single();

    if (insertError || !newCustomization) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      customization: {
        id: newCustomization.id,
        userId: newCustomization.user_id,
        category: newCustomization.category,
        itemId: newCustomization.item_id,
        equipped: newCustomization.equipped,
        unlockedAt: newCustomization.unlocked_at,
      },
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
    });
  } catch (error) {
    console.error('Error unlocking item:', error);
    return NextResponse.json(
      { error: 'Error al desbloquear item' },
      { status: 500 }
    );
  }
}






