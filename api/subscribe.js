const SB_URL = 'https://kmsimclzeitnnbbemeij.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttc2ltY2x6ZWl0bm5iYmVtZWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0Nzc1NzYsImV4cCI6MjA5NTA1MzU3Nn0.w9uNRA5g37SBgB9wvE-iSIrWcYLIU8jcw27cEwAM7mg';

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

  // Notif push + email à chaque téléchargement
  if (source === 'shop_gratuit' || source === 'achat_merci') {
    const productLabel = product_name || 'Pack gratuit';
    const priceLabel = '0,00 €';
    await Promise.all([
      notifyEmail(productLabel, clean),
      fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'https://tomussproduction.fr'}/api/send-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '📦 Nouveau téléchargement',
          body: `${clean} — ${productLabel} — ${priceLabel}`,
        }),
      }).catch(e => console.log('[send-push] erreur:', e.message)),
    ]);
  }

  res.json({ ok: true });
};
