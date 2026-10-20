const SB_URL = 'https://kmsimclzeitnnbbemeij.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttc2ltY2x6ZWl0bm5iYmVtZWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0Nzc1NzYsImV4cCI6MjA5NTA1MzU3Nn0.w9uNRA5g37SBgB9wvE-iSIrWcYLIU8jcw27cEwAM7mg';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://tomussproduction.fr');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { subject, html, preview_text, test_only } = req.body || {};
  if (!subject || !html) return res.status(400).json({ error: 'Sujet et contenu requis' });

  let emails;
  if (test_only) {
    emails = ['tomussproduction@gmail.com'];
  } else {
    const sbRes = await fetch(
      `${SB_URL}/rest/v1/newsletter_subscribers?active=eq.true&select=email`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    );
    const subscribers = await sbRes.json();
    if (!Array.isArray(subscribers) || subscribers.length === 0) {
      return res.status(400).json({ error: 'Aucun abonné actif' });
    }
    emails = subscribers.map(s => s.email);
  }

  // Envoi via Resend (batch)
  const resendRes = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(
      emails.map(to => ({
        from: 'Tomuss Production <newsletter@tomussproduction.fr>',
        to,
        subject,
        html: html + `<br/><br/><hr style="border:none;border-top:1px solid #333;margin:32px 0"/><p style="color:#666;font-size:12px;text-align:center">Tu reçois ce mail car tu es abonné à la newsletter Tomuss Production.<br/><a href="https://tomussproduction.fr/unsubscribe?email=${encodeURIComponent(to)}" style="color:#666">Se désabonner</a></p>`,
        ...(preview_text ? { headers: { 'X-Preview-Text': preview_text } } : {}),
      }))
    ),
  });

  if (!resendRes.ok) {
    const err = await resendRes.json().catch(() => ({}));
    console.error('[send-newsletter] Resend error:', err);
    return res.status(500).json({ error: err.message || 'Erreur Resend' });
  }

  res.json({ ok: true, count: emails.length });
};
