import Stripe from 'stripe';
import config from '.';
export const stripe = new Stripe(config.stripe.stripe_secret_key as string, {
  apiVersion: '2025-01-27.acacia',
});
