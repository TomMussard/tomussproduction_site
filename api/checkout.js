const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const ORIGIN = 'https://tomussproduction.fr';
const SB_URL = 'https://kmsimclzeitnnbbemeij.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttc2ltY2x6ZWl0bm5iYmVtZWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0Nzc1NzYsImV4cCI6MjA5NTA1MzU3Nn0.w9uNRA5g37SBgB9wvE-iSIrWcYLIU8jcw27cEwAM7mg';

async function getProduct(slug) {
  const res = await fetch(
    `${SB_URL}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`,
    { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
  );
  const rows = await res.json();
  return rows[0] || null;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // Support both single product (legacy) and cart (items array)
    let items = req.body.items;
    if (!items && req.body.productSlug) {
      items = [{ productSlug: req.body.productSlug, productName: req.body.productName }];
    }
    if (!items || items.length === 0) return res.status(400).json({ error: 'Panier vide' });

    const products = await Promise.all(items.map(i => getProduct(i.productSlug)));
    const missing = products.findIndex(p => !p);
    if (missing >= 0) return res.status(404).json({ error: `Produit introuvable : ${items[missing].productSlug}` });

    const missingPrice = products.find(p => !p.stripe_price_id);
    if (missingPrice) {
      return res.status(400).json({ error: `Stripe Price ID manquant pour "${missingPrice.name}". Configure-le dans le dashboard.` });
    }

    const line_items = products.map(p => ({
      price: p.stripe_price_id,
      quantity: 1,
    }));

    const slugs       = products.map(p => p.slug).join(',');
    const downloadMap = Object.fromEntries(products.map(p => [p.slug, p.download_url || '']));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${ORIGIN}/merci.html?sid={CHECKOUT_SESSION_ID}&p=${encodeURIComponent(slugs)}`,
      cancel_url: `${ORIGIN}/shop.html`,
      locale: 'fr',
      metadata: {
        productSlugs: slugs,
        downloadUrls: JSON.stringify(downloadMap),
      }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('[checkout]', err.message);
    res.status(500).json({ error: err.message });
  }
};
