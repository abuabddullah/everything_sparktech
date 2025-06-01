import { Request, Response } from 'express';
import Stripe from 'stripe';
import { paymentService } from '../app/modules/app_modules/payment/payment.service';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { ClientModel } from '../app/modules/app_modules/client_modules/client.model';
import config from '../config';
import stripe from '../config/stripe.config';
import { PAYMENT_STATUS } from '../enums/payment';

const webhookHandler = async (req: Request, res: Response): Promise<void> => {
    console.log('Webhook received');
    const sig = req.headers['stripe-signature'] as string;

    // Use the webhook secret from config instead of hardcoded value
    const webhookSecret = config.stripe.webhook_secret as string;
    console.log("webhook secret exists:", !!webhookSecret);

    if (!webhookSecret) {
        console.error('Stripe webhook secret not set');
        res.status(500).send('Webhook secret not configured');
        return;
    }

    if (!sig) {
        console.error('No Stripe signature found in headers');
        res.status(400).send('No signature provided');
        return;
    }

    let event: Stripe.Event;

    try {
        // Debug logging
        console.error('Request body type:', typeof req.body);
        console.error('Request body is Buffer:', Buffer.isBuffer(req.body));
        console.error('Request body length:', req.body?.length || 'undefined');
        console.error('Signature header:', sig);

        // Construct the event using the raw body and the signature
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        console.log('Event verified:', event.type);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Check if the event is valid
    if (!event) {
        console.error('No event constructed');
        res.status(400).send('Invalid event received');
        return;
    }

    console.log("event.type", event.type);

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handlePaymentSucceeded(event.data.object);
                break;
            case 'checkout.session.async_payment_failed':
                await handleSubscriptionUpdated(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
                break;
        }

        // Responding after handling the event
        res.status(200).json({ received: true });
    } catch (err: any) {
        console.error('Error handling the event:', err);
        res.status(500).send(`Internal Server Error: ${err.message}`);
    }
};

export default webhookHandler;

// Function for handling a successful payment
const handlePaymentSucceeded = async (session: Stripe.Checkout.Session) => {
    try {
        const {
            bookingId,
            vehicleId,
            clientId,
            amount,
            paymentMethod,
        }: any = session.metadata;

        console.log('Processing payment succeeded for booking:', bookingId);

        const paymentIntent = session.payment_intent as string;

        if (!paymentIntent) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'No payment intent found in session');
        }

        const isPaymentExist = await paymentService.isPaymentExist(paymentIntent);

        if (isPaymentExist) {
            console.log('Payment already exists for intent:', paymentIntent);
            return; // Don't throw error, just return - this is likely a duplicate webhook
        }

        console.log('Creating new payment record');

        // Find the client using clientId
        const client = await ClientModel.findById(clientId);
        if (!client) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Client not found');
        }

        const stripeCustomerId = client.stripeCustomerId;

        const newPayment = await paymentService.createPaymentService({
            bookingId,
            vehicleId,
            clientId,
            stripeCustomerId,
            amount,
            paymentMethod,
            paymentIntent,
            status: PAYMENT_STATUS.PAID
        });

        console.log('Payment created successfully:', newPayment._id || 'ID not available');

        return newPayment;
    } catch (error) {
        console.error('Error in handlePaymentSucceeded:', error);
        throw error; // Re-throw to be caught by main handler
    }
};

// Function for handling subscription update or payment failure
const handleSubscriptionUpdated = async (session: Stripe.Checkout.Session) => {
    try {
        console.log(
            `Subscription for user ${session.client_reference_id} updated or payment failed`,
        );
        // Update subscription status in your DB
    } catch (error) {
        console.error('Error in handleSubscriptionUpdated:', error);
        throw error;
    }
};