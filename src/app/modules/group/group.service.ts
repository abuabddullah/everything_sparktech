import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Group } from './group.model';
import { IGroup } from './group.interface';
import { stripe } from '../../../config/stripe';
import Stripe from 'stripe';
import { Event } from '../event/event.model';
import { User } from '../user/user.model';
import { IUser } from '../user/user.interface';
import { Types } from 'mongoose';
import config from '../../../config';

const createGroup = async (payload: IGroup): Promise<IGroup> => {
  const result = await Group.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create group!');
  }
  return result;
};

const getAllGroups = async (
  queryFields: Record<string, any>
): Promise<IGroup[]> => {
  const { search, page, limit } = queryFields;
  const query = search
    ? { $or: [{ name: { $regex: search, $options: 'i' } }] }
    : {};
  let queryBuilder = Group.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;
  queryBuilder.find(queryFields);
  return await queryBuilder;
};

const getGroupById = async (id: string): Promise<IGroup | null> => {
  const result = await Group.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Group not found!');
  }
  return result;
};

const updateGroup = async (
  id: string,
  payload: IGroup
): Promise<IGroup | null> => {
  const isExistGroup = await getGroupById(id);
  if (!isExistGroup) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Group not found!');
  }

  const result = await Group.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update group!');
  }
  return result;
};

const deleteGroup = async (id: string): Promise<IGroup | null> => {
  const isExistGroup = await getGroupById(id);
  if (!isExistGroup) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Group not found!');
  }

  const result = await Group.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete group!');
  }
  return result;
};

const getMyGroupFromDB = async (userId: string) => {
  const result = await Group.find({ members: { $in: [userId] } })
    .populate({
      path: 'members',
      select: 'name email profile',
    })
    .populate<{
      event: { _id: Types.ObjectId; name: string; thumbnailImage: string };
    }>('event', 'name')
    .lean();

  const groupsWithImage = result.map(group => {
    const { event, ...rest } = group;
    return {
      ...rest,
      images: [event?.thumbnailImage],
    };
  });
  console.log(groupsWithImage);
  return groupsWithImage;
};

// const createPaymentIntent = async (payload: any) => {
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: payload.amount * 100,
//     currency: 'usd',
//     automatic_payment_methods: {
//       enabled: true,
//     },
//   });
//   if (!paymentIntent)
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'Failed to create payment intent!'
//     );
//   return {
//     paymentIntent: paymentIntent.id,
//     client_secret: paymentIntent.client_secret,
//   };
// };

const createPaymentIntent = async (event: string, userId: string) => {
  const isExistEvent = await Event.findById(event);
  if (!isExistEvent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Event not found!');
  }
  const thisCustomer = await User.findById(userId);
  const stripeCustomer = await stripe.customers.create({
    name: thisCustomer?.name,
    email: thisCustomer?.email,
  });

  const userUpdate = await User.updateOne(
    { _id: thisCustomer?._id },
    { $set: { 'stripeAccountInfo.stripeCustomerId': stripeCustomer.id } }
  );
  const stripeSessionData: any = {
    payment_method_types: ['card'],
    mode: 'payment',
    customer: stripeCustomer.id,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'Booking Payment' },
          unit_amount: isExistEvent.price * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      user: userId.toString(),
      event: isExistEvent._id.toString(),
      amount: isExistEvent.price,
      creator: isExistEvent.creator.toString(),
    },
    success_url: `${config.stripe.success_url}`,
    cancel_url: config.stripe.cancel_url,
  };

  const stripeSession = await stripe.checkout.sessions.create(
    stripeSessionData
  );
  return { message: 'Redirect to payment', url: stripeSession.url };
};

// const joinGroup = async (payload: any, id: string) => {
//   console.log(payload);
//   const isExistEvent = Event.findById(payload.event);
//   if (!isExistEvent) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Event not found!');
//   }
//   const isInGroup = await Group.findOne({ event: payload.event, members: id });
//   let result;
//   if (!isInGroup) {
//     result = await Group.findOneAndUpdate(
//       { event: payload.event },
//       { $push: { members: id } },
//       { new: true }
//     );
//   }
//   const isExistTransaction: Stripe.PaymentIntent =
//     await stripe.paymentIntents.retrieve(payload.transactionId);
//   if (isExistTransaction.status !== 'succeeded') {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'Failed to join group. Please try again!'
//     );
//   }

//   if (!isExistTransaction) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to join group!');
//   }
//   const creator = await User.findById(payload.creator);
//   const stripeInfo = creator?.accountInformation?.stripeAccountId;
//   if (stripeInfo) {
//     await stripe.transfers.create({
//       amount: Math.round(payload.amount * 0.9 * 100),
//       currency: 'usd',
//       destination: stripeInfo?.toString(),
//       source_transaction: payload.transactionId,
//       transfer_group: `${payload.event}_${payload.transactionId}`,
//     });
//   }

//   return result;
// };

const joinGroup = async (id: string, event: string) => {
  const isExistEvent = await Event.findById(event);
  if (!isExistEvent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Event not found!');
  }
  const isInGroup = await Group.findOne({
    event: isExistEvent._id,
    members: id,
  });
  let result;
  if (!isInGroup) {
    result = await Group.findOneAndUpdate(
      { event: isExistEvent._id },
      { $push: { members: id } },
      { new: true }
    );
    return result;
  }
  return isInGroup;
};

const createGroupIndividual = async (payload: any) => {
  const isExistGroup = await Group.findOne({ members: payload.members });
  if (isExistGroup) {
    return isExistGroup;
  }
  const result = await Group.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create group!');
  }
  return result;
};

export const GroupService = {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  getMyGroupFromDB,
  createPaymentIntent,
  joinGroup,
  createGroupIndividual,
};
