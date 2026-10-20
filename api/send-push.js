const webpush = require('web-push');
const SB_URL = 'https://kmsimclzeitnnbbemeij.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttc2ltY2x6ZWl0bm5iYmVtZWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0Nzc1NzYsImV4cCI6MjA5NTA1MzU3Nn0.w9uNRA5g37SBgB9wvE-iSIrWcYLIU8jcw27cEwAM7mg';

webpush.setVapidDetails(
  'mailto:tomussproduction@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { title, body, icon } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title requis' });

  // Récupère toutes les subscriptions
  const r = await fetch(`${SB_URL}/rest/v1/push_subscriptions?select=endpoint,keys`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
  });
  const subs = await r.json();
  if (!Array.isArray(subs) || subs.length === 0) return res.json({ ok: true, sent: 0 });

  const payload = JSON.stringify({
    title,
    body: body || '',
    icon: icon || '/uploads/Plan de travail 5logotest.png',
    badge: '/uploads/Plan de travail 5logotest.png',
  });

  let sent = 0;
  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload);
        sent++;
      } catch (e) {
        // Supprime les subscriptions expirées
        if (e.statusCode === 410) {
          await fetch(`${SB_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(sub.endpoint)}`, {
            method: 'DELETE',
            headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
          });
        }
      }
    })
  );

  res.json({ ok: true, sent });
};
