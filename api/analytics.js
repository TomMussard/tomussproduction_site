const crypto = require('crypto');

function base64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function getGoogleToken(creds) {
  const now     = Math.floor(Date.now() / 1000);
  const header  = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss:   creds.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600
  }));

  const unsigned  = `${header}.${payload}`;
  const signer    = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  const signature = signer.sign(creds.private_key, 'base64url');

  const res  = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion:  `${unsigned}.${signature}`
    })
  });

  const { access_token, error } = await res.json();
  if (error) throw new Error(error);
  return access_token;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600'); // cache 1h côté Vercel

  if (!process.env.GA4_CREDENTIALS || !process.env.GA4_PROPERTY_ID) {
    return res.status(200).json({ unavailable: true });
  }

  try {
    const creds      = JSON.parse(process.env.GA4_CREDENTIALS);
    const propertyId = process.env.GA4_PROPERTY_ID;
    const token      = await getGoogleToken(creds);

    const gaRes = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRanges:  [{ startDate: '30daysAgo', endDate: 'today' }],
          metrics:     [
            { name: 'sessions' },
            { name: 'activeUsers' },
            { name: 'screenPageViews' }
          ],
          dimensions:  [{ name: 'date' }],
          orderBys:    [{ dimension: { dimensionName: 'date' } }]
        })
      }
    );

    const data = await gaRes.json();
    if (data.error) throw new Error(data.error.message);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
