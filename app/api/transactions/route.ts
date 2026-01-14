import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/transactions
 * Get user's transaction history
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
    const type = searchParams.get('type'); // 'earn' or 'spend'
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get user's transactions with related data
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select(`
        *,
        store_items:store_items(*),
        challenges:challenges(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (transactionsError) {
      throw transactionsError;
    }

    // Filter by type if specified
    let filteredResults = transactions || [];
    if (type) {
      filteredResults = filteredResults.filter(t => t.type === type);
    }

    // Calculate totals
    const totalEarned = (transactions || [])
      .filter(r => r.type === 'earn')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalSpent = (transactions || [])
      .filter(r => r.type === 'spend')
      .reduce((sum, r) => sum + Math.abs(r.amount), 0);

    // Format results to match expected structure
    const formattedResults = filteredResults.map(t => ({
      transaction: {
        id: t.id,
        userId: t.user_id,
        type: t.type,
        amount: t.amount,
        itemId: t.item_id,
        challengeId: t.challenge_id,
        description: t.description,
        createdAt: t.created_at,
      },
      item: t.store_items ? {
        id: t.store_items.id,
        name: t.store_items.name,
        category: t.store_items.category,
        itemId: t.store_items.item_id,
        price: t.store_items.price,
        premiumOnly: t.store_items.premium_only,
        imageUrl: t.store_items.image_url,
        description: t.store_items.description,
        isActive: t.store_items.is_active,
        createdAt: t.store_items.created_at,
      } : null,
      challenge: t.challenges ? {
        id: t.challenges.id,
        type: t.challenges.type,
        title: t.challenges.title,
        description: t.challenges.description,
        reward: t.challenges.reward,
        durationMinutes: t.challenges.duration_minutes,
        isActive: t.challenges.is_active,
        createdAt: t.challenges.created_at,
      } : null,
    }));

    return NextResponse.json({
      transactions: formattedResults,
      totals: {
        earned: totalEarned,
        spent: totalSpent,
        net: totalEarned - totalSpent,
      },
      count: formattedResults.length,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Error al obtener transacciones' },
      { status: 500 }
    );
  }
}






