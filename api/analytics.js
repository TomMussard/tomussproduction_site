async function getAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      client_id:     process.env.GA4_CLIENT_ID,
      client_secret: process.env.GA4_CLIENT_SECRET,
      refresh_token: process.env.GA4_REFRESH_TOKEN,
      grant_type:    'refresh_token'
    })
  });
  const { access_token, error } = await res.json();
  if (error) throw new Error(error);
  return access_token;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600');

  const needed = ['GA4_CLIENT_ID', 'GA4_CLIENT_SECRET', 'GA4_REFRESH_TOKEN', 'GA4_PROPERTY_ID'];
  if (needed.some(k => !process.env[k])) {
    return res.status(200).json({ unavailable: true });
  }

  try {
    const token      = await getAccessToken();
    const propertyId = process.env.GA4_PROPERTY_ID;

    const gaRes = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          metrics:    [
            { name: 'sessions' },
            { name: 'activeUsers' },
            { name: 'screenPageViews' }
          ],
          dimensions: [{ name: 'date' }],
          orderBys:   [{ dimension: { dimensionName: 'date' } }]
        })
      }
    );

    const data = await gaRes.json();
    if (data.error) throw new Error(data.error.message);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
