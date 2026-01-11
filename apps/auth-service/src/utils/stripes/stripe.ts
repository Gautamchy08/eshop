import stripe from 'stripe';

const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export default stripeClient;