const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const ORIGIN   = 'https://tomussproduction.fr';
const SB_URL   = 'https://kmsimclzeitnnbbemeij.supabase.co';
const SB_KEY   = 'sb_publishable_paPXvSuTkEudJ9kjL39C4w_F3Jnt75G';

async function getProduct(slug) {
  const res = await fetch(
    `${SB_URL}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}&active=eq.true&select=*&limit=1`,
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
    const { productSlug, productName } = req.body;
    if (!productSlug) return res.status(400).json({ error: 'Paramètres manquants' });

    const product = await getProduct(productSlug);
    if (!product) return res.status(404).json({ error: 'Produit introuvable' });
    if (!product.price) return res.status(400).json({ error: 'Produit gratuit' });
    if (!product.stripe_price_id) return res.status(400).json({ error: 'Prix Stripe non configuré' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: product.stripe_price_id, quantity: 1 }],
      mode: 'payment',
      success_url: `${ORIGIN}/merci.html?sid={CHECKOUT_SESSION_ID}&p=${productSlug}`,
      cancel_url: `${ORIGIN}/shop.html`,
      locale: 'fr',
      metadata: {
        productSlug,
        productName: productName || product.name,
        downloadUrl: product.download_url || ''
      }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('[checkout]', err.message);
    res.status(500).json({ error: err.message });
  }
};
