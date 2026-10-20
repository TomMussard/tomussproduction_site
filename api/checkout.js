const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const ORIGIN = 'https://tomussproduction.fr';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { priceId, productSlug, productName } = req.body;
    if (!priceId || !productSlug) return res.status(400).json({ error: 'Paramètres manquants' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${ORIGIN}/merci.html?sid={CHECKOUT_SESSION_ID}&p=${productSlug}`,
      cancel_url: `${ORIGIN}/shop.html`,
      locale: 'fr',
      metadata: { productSlug, productName: productName || productSlug }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('[checkout]', err.message);
    res.status(500).json({ error: err.message });
  }
};
