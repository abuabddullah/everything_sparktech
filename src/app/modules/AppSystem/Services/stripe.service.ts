/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from 'stripe';
import config from '../../../config';
import { User } from '../../User/user.model';
import AppError from '../../../errors/AppError';
import httpStatus from 'http-status';
import { investMoney, raisedMoney } from './invest.service';
import { paymentSuccessQuery } from '../Interfaces/schema.interface';
import { JwtPayload } from 'jsonwebtoken';
import { TUser } from '../../User/user.interface';
import { StripeAccount, Withdrawal } from '../Models/stripe.model';
import { io } from '../../../../app';
import { successHTMLstripeConnection } from '../Constants/app.constant';

const stripe = new Stripe(config.stripe_secret_key as string);

const checkoutPayment = async (
  userId: string,
  amount: number,
  host: string,
  protocol: string,
) => {
  if (amount <= 0 || !Number.isFinite(amount)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid payment amount');
  }

  const user = (await User.findById(userId).select(
    'stripeCustomerId email name _id gender',
  )) as TUser | null;

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
    });
    if (!customer) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create Stripe customer',
      );
    }
    await User.findOneAndUpdate(
      { _id: userId },
      { stripeCustomerId: customer.id },
    );
    user.stripeCustomerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Investment',
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      amount,
      type: 'Investment',
      name: user.name,
      email: user.email,
    },
    customer: user.stripeCustomerId,
    success_url: `${protocol}://${host}/api/v1/payments/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.origin_link}`,
  });

  return session.url;
};

const checkoutWinnerPayment = async (userId: string, amount: number) => {
  if (!userId || !amount) {
    throw new AppError(httpStatus.BAD_REQUEST, 'missing some data!');
  }
  const result = await raisedMoney(userId, amount);
  return result;
};

const createConnectedStripeAccount = async (
  user: JwtPayload,
  host: string,
  protocol: string,
): Promise<any> => {
  const existingAccount = await StripeAccount.findOne({
    user: user.userId,
  }).select('user accountId isCompleted');
  console.log('existingAccount', existingAccount);

  if (existingAccount) {
    if (existingAccount.isCompleted) {
      return {
        success: false,
        message: 'Account already exists',
        data: existingAccount,
      };
    }

    const onboardingLink = await stripe.accountLinks.create({
      account: existingAccount.accountId,
      refresh_url: `${protocol}://${host}/api/v1/payments/refreshAccountConnect/${existingAccount.accountId}`,
      return_url: `${protocol}://${host}/api/v1/payments/success-account/${existingAccount.accountId}`,
      type: 'account_onboarding',
    });
    // console.log('onboardingLink-1', onboardingLink);

    return {
      success: true,
      message: 'Please complete your account',
      url: onboardingLink.url,
    };
  }

  const account = await stripe.accounts.create({
    type: 'express',
    email: user.email,
    country: 'US',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
  console.log('stripe account', account);

  await StripeAccount.create({ accountId: account.id, user: user.userId });

  const onboardingLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${protocol}://${host}/api/v1/payments/refreshAccountConnect/${account.id}`,
    return_url: `${protocol}://${host}/api/v1/payments/success-account/${account.id}`,
    type: 'account_onboarding',
  });
  console.log('onboardingLink-2', onboardingLink);

  return {
    success: true,
    message: 'Please complete your account',
    url: onboardingLink.url,
  };
};

const onSucccess = async (query: paymentSuccessQuery) => {
  if (!query.session_id) {
    throw new AppError(httpStatus.NOT_FOUND, 'query not found');
  }
  const session = await stripe.checkout.sessions.retrieve(query.session_id);
  const userId = session.metadata?.userId as string;
  const amount = Number(session.metadata?.amount);
  const result = investMoney(userId, amount);

  io.emit('invest', {
    title: `New Investment from ${session.metadata?.name}`,
    subTitle: `${session.metadata?.name} spent $${amount} today!`,
    user: userId,
    type: 'global',
  });

  return result;
};

const onConnectedStripeAccountSuccess = async (accountId: string) => {
  if (!accountId) {
    throw new AppError(httpStatus.NOT_FOUND, 'account Id not found');
  }

  type PopulatedUser = {
    name: string;
    email: string;
    profileImg: string;
  };

  const stripeAccounts = await StripeAccount.findOne({ accountId }).populate({
    path: 'user',
    select: 'name email profileImg',
  });

  if (!stripeAccounts) {
    throw new AppError(httpStatus.NOT_FOUND, 'account not found');
  }

  const user = stripeAccounts.user as unknown as PopulatedUser;

  const html = successHTMLstripeConnection({
    name: user.name,
    email: user.email,
    profileImg: user.profileImg,
  });

  return html;
};
const withdrawToBank = async (userId: string, amount: number) => {
  const userAccount = await StripeAccount.findOne({ user: userId });
  if (!userAccount)
    throw new AppError(httpStatus.BAD_REQUEST, 'User has no Stripe account');
  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User Not Found!');
  }
  if (user.withdraw) {
    if (amount > user.withdraw) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You dont have this much amount to withdraw!',
      );
    }
  } else if (!user.withdraw || user.withdraw == 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You dont have sufficient balance to withdraw!',
    );
  }
  // Payout from user's Stripe balance
  const payout = await stripe.payouts.create(
    {
      amount: Math.round(amount * 100), // cents
      currency: 'usd',
    },
    { stripeAccount: userAccount.accountId },
  ); // Critical: Specify user's account

  // Record payout
  await Withdrawal.create({
    user: userId,
    amount,
    stripePayoutId: payout.id,
    status: payout.status,
  });

  return payout;
};

export const StripServices = {
  checkoutPayment,
  onSucccess,
  checkoutWinnerPayment,
  createConnectedStripeAccount,
  withdrawToBank,
  onConnectedStripeAccountSuccess,
};
