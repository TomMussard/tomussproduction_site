const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Ajoute ici les liens de téléchargement une fois les produits créés
// Format: 'product-slug': 'https://lien-direct-vers-fichier.zip'
const DOWNLOAD_URLS = {
  // 'sfx-pack-vol1': 'https://drive.google.com/...',
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://tomussproduction.fr');
  if (req.method !== 'GET') return res.status(405).end();

  const { sid, p } = req.query;
  if (!sid) return res.status(400).json({ error: 'Session manquante' });

  try {
    const session = await stripe.checkout.sessions.retrieve(sid);

    if (session.payment_status !== 'paid') {
      return res.status(403).json({ paid: false });
    }

    const url = DOWNLOAD_URLS[p] || null;
    res.json({ paid: true, product: p, url });
  } catch (err) {
    console.error('[verify-payment]', err.message);
    res.status(500).json({ error: err.message });
  }
};
