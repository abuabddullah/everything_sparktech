import Stripe from 'stripe';
import { Event } from '../app/modules/event/event.model';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Group } from '../app/modules/group/group.model';
import { stripe } from '../config/stripe';
import { User } from '../app/modules/user/user.model';

// Function for handling a successful payment
export const handlePaymentSucceeded = async (
  session: Stripe.Checkout.Session
) => {
  try {
    const { user, event, amount, creator }: any = session.metadata;

    const isExistTransaction: Stripe.PaymentIntent =
      await stripe.paymentIntents.retrieve(session.payment_intent as string);
    if (isExistTransaction.status !== 'succeeded') {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to join group. Please try again!'
      );
    }

    if (!isExistTransaction) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to join group!');
    }

    const isInGroup = await Group.findOne({
      event: event,
      members: user,
    });
    let result;
    if (!isInGroup) {
      result = await Group.findOneAndUpdate(
        { event: event },
        { $push: { members: user } },
        { new: true }
      );
    }
    const creatorInfo = await User.findById(creator);
    if (!creatorInfo) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Creator not found!');
    }
    const stripeInfo = creatorInfo?.accountInformation?.stripeAccountId;
    if (stripeInfo) {
      await stripe.transfers.create({
        amount: Math.round(amount * 0.9 * 100),
        currency: 'usd',
        destination: stripeInfo?.toString(),
        source_transaction: session.payment_intent as string,
        transfer_group: `${event}_${session.payment_intent}`,
      });
    }

    return result;
  } catch (error) {
    console.error('Error in handlePaymentSucceeded:', error);
  }
};
