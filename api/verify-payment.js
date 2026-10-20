const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://tomussproduction.fr');
  if (req.method !== 'GET') return res.status(405).end();

  const { sid } = req.query;
  if (!sid) return res.status(400).json({ error: 'Session manquante' });

  try {
    const session = await stripe.checkout.sessions.retrieve(sid);

    if (session.payment_status !== 'paid') {
      return res.status(403).json({ paid: false });
    }

    // L'URL de téléchargement est stockée dans les metadata au moment du checkout
    const url = session.metadata?.downloadUrl || null;
    res.json({ paid: true, product: session.metadata?.productSlug, url });
  } catch (err) {
    console.error('[verify-payment]', err.message);
    res.status(500).json({ error: err.message });
  }
};
