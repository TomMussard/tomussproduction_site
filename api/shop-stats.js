const Stripe = require('stripe');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://tomussproduction.fr');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  // Récupère tous les paiements réussis (max 100 derniers)
  let charges = [];
  let hasMore = true;
  let startingAfter = undefined;

  while (hasMore) {
    const params = { limit: 100, expand: [] };
    if (startingAfter) params.starting_after = startingAfter;
    const result = await stripe.paymentIntents.list(params);
    const succeeded = result.data.filter(pi => pi.status === 'succeeded');
    charges = charges.concat(succeeded);
    hasMore = result.has_more;
    if (result.data.length > 0) startingAfter = result.data[result.data.length - 1].id;
    if (charges.length >= 500) break; // sécurité
  }

  const orders = charges.length;
  const revenue = charges.reduce((sum, pi) => sum + pi.amount_received, 0) / 100;

  res.json({ orders, revenue });
};
