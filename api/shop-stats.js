const Stripe = require('stripe');

const SB_URL = 'https://kmsimclzeitnnbbemeij.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttc2ltY2x6ZWl0bm5iYmVtZWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0Nzc1NzYsImV4cCI6MjA5NTA1MzU3Nn0.w9uNRA5g37SBgB9wvE-iSIrWcYLIU8jcw27cEwAM7mg';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://tomussproduction.fr');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const now = new Date();
  const todayStr  = now.toISOString().split('T')[0];
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // ── Fetch all completed checkout sessions (up to 500) ──────────────────────
  let sessions = [];
  let hasMore = true;
  let startingAfter = undefined;
  while (hasMore && sessions.length < 500) {
    const params = { limit: 100, status: 'complete' };
    if (startingAfter) params.starting_after = startingAfter;
    const result = await stripe.checkout.sessions.list(params);
    sessions = sessions.concat(result.data);
    hasMore = result.has_more;
    if (result.data.length > 0) startingAfter = result.data[result.data.length - 1].id;
  }

  // ── Aggregate stats ────────────────────────────────────────────────────────
  let ordersTotal = 0, revenueTotal = 0;
  let todayCount = 0, todayRevenue = 0;
  let monthCount = 0, monthRevenue = 0;
  const perProduct = {};   // { slug: { paid: n, revenue: n } }
  const recent = [];

  for (const s of sessions) {
    if (!s.amount_total) continue;
    const amount = s.amount_total / 100;
    const created = new Date(s.created * 1000);
    const dateStr = created.toISOString().split('T')[0];

    ordersTotal++;
    revenueTotal += amount;

    if (dateStr === todayStr)             { todayCount++; todayRevenue += amount; }
    if (created >= monthStart)            { monthCount++; monthRevenue += amount; }

    // Per-product from metadata
    const slugs = (s.metadata?.productSlugs || '').split(',').map(x => x.trim()).filter(Boolean);
    for (const slug of slugs) {
      if (!perProduct[slug]) perProduct[slug] = { paid: 0, revenue: 0 };
      perProduct[slug].paid++;
      perProduct[slug].revenue += (amount / Math.max(slugs.length, 1));
    }

    // Recent sales (last 20)
    if (recent.length < 20) {
      recent.push({
        date: created.toLocaleDateString('fr-FR'),
        product: slugs.join(', ') || (s.metadata?.productName || '—'),
        amount,
        email: s.customer_details?.email || '—',
      });
    }
  }

  // ── Free downloads from Supabase newsletter_subscribers ───────────────────
  let freePerProduct = {};
  let freeTotalCount = 0;
  try {
    const r = await fetch(
      `${SB_URL}/rest/v1/newsletter_subscribers?source=like.shop_gratuit*&select=source`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    );
    const rows = await r.json();
    if (Array.isArray(rows)) {
      freeTotalCount = rows.length;
      for (const row of rows) {
        // source is either 'shop_gratuit' (old) or 'shop_gratuit:SLUG' (new)
        const parts = (row.source || '').split(':');
        const slug = parts[1] || '_free_';
        if (!freePerProduct[slug]) freePerProduct[slug] = 0;
        freePerProduct[slug]++;
      }
    }
  } catch (_) {}

  res.json({
    orders: ordersTotal,
    revenue: revenueTotal,
    free: freeTotalCount,
    today:  { count: todayCount,  revenue: todayRevenue },
    month:  { count: monthCount,  revenue: monthRevenue },
    recent,
    per_product: perProduct,
    per_product_free: freePerProduct,
  });
};
