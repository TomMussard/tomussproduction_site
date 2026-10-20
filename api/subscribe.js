const webpush = require('web-push');

const SB_URL = 'https://kmsimclzeitnnbbemeij.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttc2ltY2x6ZWl0bm5iYmVtZWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0Nzc1NzYsImV4cCI6MjA5NTA1MzU3Nn0.w9uNRA5g37SBgB9wvE-iSIrWcYLIU8jcw27cEwAM7mg';

async function sendPushNotifications(title, body) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.log('[push] VAPID keys manquantes'); return;
  }
  webpush.setVapidDetails(
    'mailto:tomussproduction@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const r = await fetch(`${SB_URL}/rest/v1/push_subscriptions?select=endpoint,keys`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
  });
  const subs = await r.json().catch(() => []);
  console.log('[push] subscriptions trouvées:', Array.isArray(subs) ? subs.length : 0);
  if (!Array.isArray(subs) || subs.length === 0) return;

  const payload = JSON.stringify({ title, body, icon: '/uploads/Plan de travail 5logotest.png' });

  await Promise.allSettled(subs.map(async (sub) => {
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload);
      console.log('[push] envoyé à', sub.endpoint.slice(0, 60));
    } catch (e) {
      console.log('[push] erreur envoi:', e.statusCode, e.message);
      if (e.statusCode === 410) {
        await fetch(`${SB_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(sub.endpoint)}`, {
          method: 'DELETE',
          headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
        });
      }
    }
  }));
}

async function notifyEmail(productLabel, email) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.log('[notify-email] RESEND_API_KEY manquant'); return; }
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Tomuss Production <newsletter@tomussproduction.fr>',
        to: ['tomussproduction@gmail.com'],
        subject: `📦 Nouveau téléchargement — ${productLabel}`,
        html: `<p style="font-family:monospace;font-size:15px">
          <strong>📦 Nouveau téléchargement</strong><br><br>
          <strong>Client :</strong> ${email}<br>
          <strong>Produit :</strong> ${productLabel}<br>
          <strong>Prix :</strong> 0,00 €
        </p>`,
      }),
    });
    console.log('[notify-email] status:', r.status);
  } catch (e) { console.log('[notify-email] erreur:', e.message); }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://tomussproduction.fr');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, source = 'website', product_name } = req.body || {};
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Email invalide' });

  const clean = email.toLowerCase().trim();

  const r = await fetch(`${SB_URL}/rest/v1/newsletter_subscribers`, {
    method: 'POST',
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=ignore-duplicates',
    },
    body: JSON.stringify({ email: clean, source }),
  });

  const sbBody = await r.text().catch(() => '');
  console.log('[subscribe] Supabase status:', r.status, '| body:', sbBody);
  if (!r.ok && r.status !== 409) {
    return res.status(500).json({ error: sbBody || 'Erreur serveur' });
  }

  if (source === 'shop_gratuit' || source === 'achat_merci') {
    const productLabel = product_name || 'Pack gratuit';
    await Promise.all([
      sendPushNotifications('📦 Nouveau téléchargement', `${clean} — ${productLabel} — 0,00 €`),
      notifyEmail(productLabel, clean),
    ]);
  }

  res.json({ ok: true });
};
