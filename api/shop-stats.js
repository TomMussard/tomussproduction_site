const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const now = Math.floor(Date.now() / 1000);
    const d   = new Date();
    const startOfDay   = Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 1000);
    const startOfMonth = Math.floor(new Date(d.getFullYear(), d.getMonth(), 1).getTime() / 1000);

    const [today, month] = await Promise.all([
      stripe.checkout.sessions.list({ created: { gte: startOfDay  }, status: 'complete', limit: 100 }),
      stripe.checkout.sessions.list({ created: { gte: startOfMonth }, status: 'complete', limit: 100 })
    ]);

    const sum = list => list.data.reduce((a, s) => a + (s.amount_total || 0), 0) / 100;

    res.json({
      today:  { count: today.data.length,  revenue: sum(today).toFixed(2)  },
      month:  { count: month.data.length,  revenue: sum(month).toFixed(2)  },
      recent: month.data.slice(0, 15).map(s => ({
        id:      s.id,
        product: s.metadata?.productName || 'Produit',
        amount:  ((s.amount_total || 0) / 100).toFixed(2),
        email:   s.customer_details?.email || '',
        date:    new Date(s.created * 1000).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })
      }))
    });
  } catch (err) {
    console.error('[shop-stats]', err.message);
    res.status(500).json({ error: err.message });
  }
};
