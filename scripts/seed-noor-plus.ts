import { getUncachableStripeClient } from '../server/billing/stripeClient';

async function seedNoorPlus() {
  console.log('Creating Noor Plus product and price in Stripe...');
  
  const stripe = await getUncachableStripeClient();

  const existingProducts = await stripe.products.search({
    query: "name:'Noor Plus'",
  });

  if (existingProducts.data.length > 0) {
    console.log('Noor Plus product already exists:', existingProducts.data[0].id);
    
    const prices = await stripe.prices.list({
      product: existingProducts.data[0].id,
      active: true,
    });
    
    if (prices.data.length > 0) {
      console.log('Price ID:', prices.data[0].id);
      console.log('\nSet this in your environment:');
      console.log(`STRIPE_PRICE_ID=${prices.data[0].id}`);
    }
    return;
  }

  const product = await stripe.products.create({
    name: 'Noor Plus',
    description: 'Unlimited reflections and full history access for Noor CBT',
    metadata: {
      app: 'noor-cbt',
      tier: 'plus',
    },
  });

  console.log('Created product:', product.id);

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 999,
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    metadata: {
      plan: 'noor-plus-monthly',
    },
  });

  console.log('Created price:', price.id);
  console.log('\nSet this in your environment:');
  console.log(`STRIPE_PRICE_ID=${price.id}`);
}

seedNoorPlus().catch(console.error);
