const SB_URL = 'https://kmsimclzeitnnbbemeij.supabase.co';
const SB_KEY = 'sb_publishable_paPXvSuTkEudJ9kjL39C4w_F3Jnt75G';

async function notify(title, body) {
  const topic = process.env.NTFY_TOPIC;
  console.log('[ntfy] topic:', topic, '| title:', title);
  if (!topic) { console.log('[ntfy] NTFY_TOPIC manquant'); return; }
  try {
    const r = await fetch(`https://ntfy.sh/${topic}`, {
      method: 'POST',
      headers: { Title: title, Tags: 'arrow_down', Priority: 'default', 'Content-Type': 'text/plain' },
      body,
    });
    console.log('[ntfy] status:', r.status);
  } catch (e) { console.log('[ntfy] erreur fetch:', e.message); }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://tomussproduction.fr');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, source = 'website' } = req.body || {};
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

  if (!r.ok && r.status !== 409) {
    const err = await r.json().catch(() => ({}));
    return res.status(500).json({ error: err.message || 'Erreur serveur' });
  }

  // Notif iPhone pour les téléchargements gratuits (shop ou merci)
  if (source === 'shop_gratuit' || source === 'achat_merci') {
    await notify('📦 Nouveau téléchargement', `${clean} a téléchargé un fichier (${source})`);
  }

  res.json({ ok: true });
};
