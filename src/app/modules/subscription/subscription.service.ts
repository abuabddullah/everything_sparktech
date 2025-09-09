import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Subscription } from './subscription.model';
import { ISubscription } from './subscription.interface';
import { stripe } from '../../../config/stripe';
import { User } from '../user/user.model';

const createSubscription = async (
  payload: ISubscription
): Promise<ISubscription> => {
  const result = await Subscription.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create subscription!'
    );
  }
  return result;
};

const cancelSubscription = async (userId: string): Promise<any> => {
  // Find the active subscription
  const activeSubscription = await Subscription.findOne({
    user: userId,
    status: 'active',
  });
  const isExistUser = await User.findById(userId);
  if (!activeSubscription || !isExistUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No active subscription found');
  }

  try {
    const canceled = await stripe.subscriptions.cancel(
      activeSubscription.subscriptionId
    );
    if (canceled.status !== 'canceled') {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to cancel subscription'
      );
    }
    const deletedSubscription = await Subscription.findByIdAndDelete(
      activeSubscription._id
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isSubscribed: false },
      { new: true }
    );
    return {
      deletedSubscription,
      updatedUser,
      canceled,
    };
  } catch (error) {
    console.log(error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to cancel subscription'
    );
  }
};

const getAllSubscriptions = async (
  queryFields: Record<string, any>
): Promise<ISubscription[]> => {
  const { search, page, limit } = queryFields;
  const query = search
    ? {
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { status: { $regex: search, $options: 'i' } },
        ],
      }
    : {};
  let queryBuilder = Subscription.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  } else {
    queryBuilder = queryBuilder.skip(0).limit(10);
  }
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;
  queryBuilder.find(queryFields);
  return await queryBuilder;
};

const getSubscriptionById = async (
  id: string
): Promise<ISubscription | null> => {
  const result = await Subscription.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscription not found!');
  }
  return result;
};

const updateSubscription = async (
  id: string,
  payload: ISubscription
): Promise<ISubscription | null> => {
  const isExistSubscription = await getSubscriptionById(id);
  if (!isExistSubscription) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscription not found!');
  }

  const result = await Subscription.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update subscription!'
    );
  }
  return result;
};

const deleteSubscription = async (
  id: string
): Promise<ISubscription | null> => {
  const isExistSubscription = await getSubscriptionById(id);
  if (!isExistSubscription) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscription not found!');
  }

  const result = await Subscription.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to delete subscription!'
    );
  }
  return result;
};

const getMySubscriptions = async (userId: string): Promise<ISubscription[]> => {
  const result = await Subscription.find({ user: userId });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscription not found!');
  }
  return result;
};

export const SubscriptionService = {
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  cancelSubscription,
  getMySubscriptions,
};
