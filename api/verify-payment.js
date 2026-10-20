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

    // Les URLs de téléchargement sont stockées dans les metadata au moment du checkout
    let downloads = [];
    try {
      const map = JSON.parse(session.metadata?.downloadUrls || '{}');
      downloads = Object.entries(map).map(([slug, url]) => ({ slug, url })).filter(x => x.url);
    } catch {}

    // Compat legacy (un seul produit)
    if (downloads.length === 0 && session.metadata?.downloadUrl) {
      downloads = [{ slug: session.metadata.productSlug, url: session.metadata.downloadUrl }];
    }

    res.json({ paid: true, downloads });
  } catch (err) {
    console.error('[verify-payment]', err.message);
    res.status(500).json({ error: err.message });
  }
};
