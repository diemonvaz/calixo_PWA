import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/store
 * Get store items with filters
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const premiumOnly = searchParams.get('premiumOnly');
    const search = searchParams.get('search');

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

    // Build query for store items
    let query = supabase
      .from('store_items')
      .select('*')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    if (premiumOnly === 'true') {
      query = query.eq('premium_only', true);
    } else if (premiumOnly === 'false') {
      query = query.eq('premium_only', false);
    }

    const { data: items, error: itemsError } = await query;

    if (itemsError) {
      throw itemsError;
    }

    // Apply price filters
    let filteredItems = items || [];
    if (minPrice) {
      const min = parseInt(minPrice);
      filteredItems = filteredItems.filter(item => item.price >= min);
    }

    if (maxPrice) {
      const max = parseInt(maxPrice);
      filteredItems = filteredItems.filter(item => item.price <= max);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.name?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      );
    }

    // Get user's owned items
    const { data: ownedItems } = await supabase
      .from('avatar_customizations')
      .select('item_id')
      .eq('user_id', user.id);

    const ownedItemIds = new Set((ownedItems || []).map(item => item.item_id));

    // Add ownership status to items
    const itemsWithStatus = filteredItems.map(item => ({
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
      owned: ownedItemIds.has(item.item_id),
      canPurchase: !ownedItemIds.has(item.item_id) && 
                   userData.coins >= item.price &&
                   (!item.premium_only || userData.is_premium),
    }));

    // Sort items: unowned first, then by price
    itemsWithStatus.sort((a, b) => {
      if (a.owned !== b.owned) return a.owned ? 1 : -1;
      return a.price - b.price;
    });

    return NextResponse.json({
      items: itemsWithStatus,
      userCoins: userData.coins,
      isPremium: userData.is_premium,
      totalItems: itemsWithStatus.length,
      ownedCount: ownedItemIds.size,
    });
  } catch (error) {
    console.error('Error fetching store items:', error);
    return NextResponse.json(
      { error: 'Error al obtener items de la tienda' },
      { status: 500 }
    );
  }
}






