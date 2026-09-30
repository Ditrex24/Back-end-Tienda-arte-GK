import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 });
  }

  // Calculate expiration time (15 minutes ago)
  const expirationTime = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  try {
    // 1. Fetch pending orders older than 15 minutes
    const ordersRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?status=eq.pending&created_at=lt.${expirationTime}&select=id`,
      {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        }
      }
    );
    if (!ordersRes.ok) throw new Error('Error fetching orders');
    const expiredOrders: { id: string }[] = await ordersRes.json();

    if (expiredOrders.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No expired orders found.',
        cancelled_orders: 0, 
        restored_items: 0 
      });
    }

    let restoredItemsCount = 0;

    // Process each expired order
    for (const order of expiredOrders) {
      // 2. Fetch order items for this order
      const itemsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/order_items?order_id=eq.${order.id}&select=artwork_id,quantity`,
        {
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`
          }
        }
      );
      if (!itemsRes.ok) continue;
      const orderItems: { artwork_id: string; quantity: number }[] = await itemsRes.json();

      // 3. Restore stock for each artwork sequentially
      for (const item of orderItems) {
        // Fetch current stock
        const artRes = await fetch(
          `${SUPABASE_URL}/rest/v1/artworks?id=eq.${item.artwork_id}&select=stock`,
          {
            headers: {
              'apikey': SERVICE_KEY,
              'Authorization': `Bearer ${SERVICE_KEY}`
            }
          }
        );
        if (!artRes.ok) continue;
        const artData = await artRes.json();
        if (!artData || artData.length === 0) continue;

        const currentStock = artData[0].stock;
        
        // Patch new stock
        await fetch(
          `${SUPABASE_URL}/rest/v1/artworks?id=eq.${item.artwork_id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SERVICE_KEY,
              'Authorization': `Bearer ${SERVICE_KEY}`
            },
            body: JSON.stringify({ stock: currentStock + item.quantity })
          }
        );
        restoredItemsCount += item.quantity;
      }

      // 4. Mark order as cancelled
      await fetch(
        `${SUPABASE_URL}/rest/v1/orders?id=eq.${order.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`
          },
          body: JSON.stringify({ status: 'cancelled' })
        }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Stock successfully released.',
      cancelled_orders: expiredOrders.length,
      restored_items: restoredItemsCount
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error processing stock release';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
