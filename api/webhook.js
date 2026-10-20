const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const SB_URL = 'https://kmsimclzeitnnbbemeij.supabase.co';
const SB_KEY = 'sb_publishable_paPXvSuTkEudJ9kjL39C4w_F3Jnt75G';

async function addToNewsletter(email) {
  if (!email) return;
  try {
    await fetch(`${SB_URL}/rest/v1/newsletter_subscribers`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=ignore-duplicates',
      },
      body: JSON.stringify({ email: email.toLowerCase().trim(), source: 'achat' }),
    });
  } catch (e) {
    console.warn('[webhook] addToNewsletter:', e.message);
  }
}

// Collecte le corps brut (nécessaire pour la vérification Stripe)
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function notify(title, body, tags = 'bell') {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return;
  try {
    await fetch(`https://ntfy.sh/${topic}`, {
      method: 'POST',
      headers: {
        Title: title,
        Tags: tags,
        Priority: 'high',
        'Content-Type': 'text/plain'
      },
      body
    });
  } catch (e) {
    console.warn('[ntfy]', e.message);
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[webhook] signature invalide:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object;
    const product = s.metadata?.productName || 'Produit inconnu';
    const amount  = ((s.amount_total || 0) / 100).toFixed(2);
    const email   = s.customer_details?.email || 'client anonyme';

    await Promise.all([
      notify(`💰 Vente — ${amount} €`, `${product}\n${email}`, 'money_with_wings,tada'),
      addToNewsletter(s.customer_details?.email),
    ]);
  }

  if (event.type === 'checkout.session.expired') {
    // Panier abandonné — info silencieuse
  }

  res.json({ received: true });
};
