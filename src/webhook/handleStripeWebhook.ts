import { Request, Response } from 'express';
import config from '../config';
import Stripe from 'stripe';
import { stripe } from '../config/stripe';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../shared/logger';
import colors from 'colors';
import { handleSubscriptionCreated } from '../handlers/handleSubscriptionCreated';
import { handleSubscriptionUpdated } from '../handlers/handleSubscriptionUpdated';
import { handleSubscriptionDeleted } from '../handlers/handleSubscriptionDeleted';
import { handleAccountUpdatedEvent } from '../handlers/handleAccountUpdatedEvent';
import { handlePaymentSucceeded } from '../handlers/handlePaymentSucceeded';

const handleStripeWebhook = async (req: Request, res: Response) => {
  console.log(
    '🚀 ~ handleStripeWebhook ~ Webhook endpoint hit:',
    new Date().toISOString()
  );
  console.log('Headers:', req.headers);
  console.log('Body type:', typeof req.body);
  console.log('Raw body length:', req.body?.length || 0);

  const signature = req.headers['stripe-signature'] as string;
  const webhookSecret = config.stripe.stripe_webhook_secret as string;

  console.log('🔑 Webhook secret configured:', !!webhookSecret);

  if (!signature) {
    logger.error('No Stripe signature found in webhook request');
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send('No Stripe signature found');
  }

  let event: Stripe.Event;
  try {
    // The raw body is available because we used express.raw() middleware
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    console.log('✅ Webhook signature verified successfully');
  } catch (error: any) {
    logger.error(`Webhook signature verification failed: ${error.message}`);
    console.log(' Raw body:', req.body);
    console.log(' Signature:', signature);
    console.log(' Webhook secret:', webhookSecret);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send(`Webhook Error: ${error.message}`);
  }

  // Check if the event is valid
  if (!event) {
    logger.error('Invalid event received - event object is null or undefined');
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid event received!');
  }

  // Extract event data and type
  const data = event.data.object as Stripe.Subscription | Stripe.Account;
  const eventType = event.type;

  // Log detailed event information
  console.log('🔔 Stripe Event Details:');
  console.log('  Event Type:', eventType);
  console.log('  Event ID:', event.id);
  console.log('  Created:', new Date(event.created * 1000).toISOString());
  console.log('  Livemode:', event.livemode);
  console.log('  Request:', event.request);
  console.log('  Data Object:', JSON.stringify(data, null, 2));

  // Handle the event based on its type
  try {
    console.log('🔄 Routing event for processing...');
    switch (eventType) {
      case 'customer.subscription.created':
        console.log('🔄 Processing customer.subscription.created event');
        await handleSubscriptionCreated(data as Stripe.Subscription);
        console.log(
          '✅ Successfully processed customer.subscription.created event'
        );
        break;
      case 'customer.subscription.updated':
        console.log('🔄 Processing customer.subscription.updated event');
        await handleSubscriptionUpdated(data as Stripe.Subscription);
        console.log(
          '✅ Successfully processed customer.subscription.updated event'
        );
        break;
      case 'customer.subscription.deleted':
        console.log('🔄 Processing customer.subscription.deleted event');
        await handleSubscriptionDeleted(data as Stripe.Subscription);
        console.log(
          '✅ Successfully processed customer.subscription.deleted event'
        );
        break;
      case 'account.updated':
        console.log('🔄 Processing account.updated event');
        await handleAccountUpdatedEvent(data as Stripe.Account);
        console.log('✅ Successfully processed account.updated event');
        break;
      // Additional events that might be relevant during checkout
      case 'checkout.session.completed':
        console.log('🔄 Processing checkout.session.completed event');
        // This event is triggered when a checkout session is completed
        await handlePaymentSucceeded(event.data.object as Stripe.Checkout.Session);
        // We might want to handle this as well for subscription checkouts
        console.log(
          '✅ Successfully processed checkout.session.completed event'
        );
        break;
      case 'invoice.payment_succeeded':
        console.log('🔄 Processing invoice.payment_succeeded event');
        // This event is triggered when an invoice payment succeeds
        // This might be relevant for subscription payments
        console.log(
          '✅ Successfully processed invoice.payment_succeeded event'
        );
        break;

      default:
        // Log unhandled event types
        console.log('⚠️  Unhandled event type received');
        logger.warn(colors.bgGreen.bold(`Unhandled event type: ${eventType}`));
    }
  } catch (error: any) {
    // Handle errors during event processing
    console.log('❌ Error processing webhook event:', error);
    console.log('❌ Error stack:', error.stack);
    logger.error(
      `Error handling event ${eventType}: ${error.message || error}`
    );
    // We should still send a 200 response to Stripe to acknowledge receipt, even if processing failed
    // This prevents Stripe from retrying the webhook
    console.log('⚠️  Sending 200 response to Stripe despite processing error');
    return res.status(200).send(); // Acknowledge receipt to Stripe but indicate internal error
  }

  console.log('✅ Webhook processed successfully for event:', eventType);
  res.sendStatus(200); // Send success response
};

export default handleStripeWebhook;
