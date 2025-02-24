import { StatusCodes } from 'http-status-codes';
import { stripe } from '../config/stripe';
import ApiError from '../errors/ApiError';

export const createSubscriptionPackage = async (payload: any) => {
  const subscription = await stripe.products.create({
    name: payload.name,
    default_price_data: {
      currency: 'usd',
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      unit_amount: payload.price * 100,
    },
  });
  if (!subscription)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create package!');
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: subscription.default_price as string,
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    payment_method_types: ['card'],
    after_completion: {
      type: 'redirect',
      redirect: {
        url: 'http://medspaceconnect.com',
      },
    },
  });
  return {
    subscription: subscription.id,
    priceId: subscription.default_price,
    paymentLink: paymentLink.url,
  };
};

export const createPaymentIntent = async (payload: any) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: payload.amount * 100,
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
  });
  if (!paymentIntent)
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create payment intent!'
    );
  return {
    paymentIntent: paymentIntent.id,
    client_secret: paymentIntent.client_secret,
  };
};
