const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://tomussproduction.fr');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { name, description, price, image_url, existing_stripe_product_id, existing_stripe_price_id, old_price } = req.body;

    if (!name) return res.status(400).json({ error: 'Nom requis' });
    if (!price || price <= 0) return res.status(400).json({ error: 'Prix invalide' });

    let stripeProductId = existing_stripe_product_id;

    // Créer ou mettre à jour le produit Stripe
    if (stripeProductId) {
      await stripe.products.update(stripeProductId, {
        name,
        description: description || undefined,
        images: image_url ? [image_url] : undefined,
      });
    } else {
      const product = await stripe.products.create({
        name,
        description: description || undefined,
        images: image_url ? [image_url] : undefined,
      });
      stripeProductId = product.id;
    }

    let stripePriceId = existing_stripe_price_id;
    const priceChanged = existing_stripe_price_id && old_price && Number(old_price) !== Number(price);

    // Créer un nouveau prix si : nouveau produit OU prix modifié
    if (!existing_stripe_price_id || priceChanged) {
      // Archiver l'ancien prix si le prix a changé
      if (priceChanged && existing_stripe_price_id) {
        await stripe.prices.update(existing_stripe_price_id, { active: false }).catch(() => {});
      }

      const newPrice = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: Math.round(Number(price) * 100), // centimes
        currency: 'eur',
      });
      stripePriceId = newPrice.id;
    }

    res.json({ stripe_product_id: stripeProductId, stripe_price_id: stripePriceId });
  } catch (err) {
    console.error('[create-stripe-product]', err.message);
    res.status(500).json({ error: err.message });
  }
};
