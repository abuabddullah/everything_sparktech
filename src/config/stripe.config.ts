import Stripe from 'stripe';
import config from '.';

const stripe = new Stripe(config.stripe.stripe_api_secret as string);

export default stripe;
