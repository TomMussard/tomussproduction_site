const SB_URL = 'https://kmsimclzeitnnbbemeij.supabase.co';
const SB_KEY = 'sb_publishable_paPXvSuTkEudJ9kjL39C4w_F3Jnt75G';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://tomussproduction.fr');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, source = 'website' } = req.body || {};
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Email invalide' });

  const r = await fetch(`${SB_URL}/rest/v1/newsletter_subscribers`, {
    method: 'POST',
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=ignore-duplicates',
    },
    body: JSON.stringify({ email: email.toLowerCase().trim(), source }),
  });

  if (!r.ok && r.status !== 409) {
    const err = await r.json().catch(() => ({}));
    return res.status(500).json({ error: err.message || 'Erreur serveur' });
  }

  res.json({ ok: true });
};
