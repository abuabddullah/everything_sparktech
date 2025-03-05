import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import path from 'path';
import { stripe } from '../../../config/stripe';
import fs from 'fs';
import config from '../../../config';
import { Event } from '../event/event.model';
import { Group } from '../group/group.model';

const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  //set role
  if (!payload.role) {
    payload.role = USER_ROLES.USER;
  }
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  //send email
  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findOneAndUpdate(
    { _id: createUser._id },
    { $set: { authentication } }
  );

  return createUser;
};

const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.findOne({ _id: id })
    .select('-password')
    .populate('eventWishList jobWishList');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //unlink file here
  if (payload.profile) {
    unlinkFile(isExistUser.profile);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const deleteUserFromDB = async (user: JwtPayload): Promise<any> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const deleteUser = await User.findOneAndDelete({ _id: id });
  if (!deleteUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete user');
  }
  return deleteUser;
};

const uploadFileToStripe = async (filePath: string): Promise<string> => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const fileExtension = path.extname(filePath).toLowerCase();

    let mimeType: string;
    switch (fileExtension) {
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      case '.png':
        mimeType = 'image/png';
        break;
      case '.pdf':
        mimeType = 'application/pdf';
        break;
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }

    const file = await stripe.files.create({
      purpose: 'identity_document',
      file: {
        data: fileBuffer,
        name: fileName,
        type: mimeType,
      },
    });
    return file.id;
  } catch (error) {
    console.error('Error uploading file to Stripe:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to upload file to Stripe'
    );
  }
};

const createCreatorStripeAccount = async (
  data: any,
  files: any,
  user: any,
  paths: any,
  ip: string
): Promise<string> => {
  const values = await JSON.parse(data);

  const isExistUser = await User.findOne({ email: user?.email });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  if (isExistUser.email !== user.email) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Email doesn't match");
  }
  const dob = new Date(values.dateOfBirth);

  // Process KYC
  const KYCFiles = files;
  if (!KYCFiles || KYCFiles.length < 2) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Two KYC files are required!');
  }
  const uploadsPath = path.join(__dirname, '../../../..');

  // File upload to Stripe
  const frontFileId = await uploadFileToStripe(
    `${uploadsPath}/uploads/${paths[0]}`
  );
  const backFileId = await uploadFileToStripe(
    `${uploadsPath}/uploads/${paths[1]}`
  );

  // Create token
  const token = await stripe.tokens.create({
    account: {
      individual: {
        dob: {
          day: dob.getDate(),
          month: dob.getMonth() + 1,
          year: dob.getFullYear(),
        },
        id_number: values.idNumber,
        first_name:
          values.name.split(' ')[0] ||
          isExistUser.name.split(' ')[0] ||
          isExistUser.name,
        last_name:
          values.name.split(' ')[1] ||
          isExistUser.name.split(' ')[1] ||
          isExistUser.name,
        email: user.email,
        phone: values.phoneNumber,
        address: {
          city: values.address.city,
          country: values.address.country,
          line1: values.address.line1,
          state: values.address.state,
          postal_code: values.address.postal_code,
        },
        ...(values.idNumber && { ssn_last_4: values.idNumber.slice(-4) }),
        verification: {
          document: {
            front: frontFileId,
            back: backFileId,
          },
        },
      },
      business_type: 'individual',
      tos_shown_and_accepted: true,
    },
  });
  // Create account
  const account = await stripe.accounts.create({
    type: 'custom',
    country: values.address.country,
    email: values.email || isExistUser.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_profile: {
      mcc: '5734',
      name: `${isExistUser.name}`,
      url: 'https://itzel.com',
    },
    external_account: {
      object: 'bank_account',
      account_number: values.bank_info.account_number,
      country: values.bank_info.country,
      currency: values.bank_info.currency,
      account_holder_name: values.bank_info.account_holder_name,
      account_holder_type: values.bank_info.account_holder_type,
      routing_number: values.bank_info.routing_number,
    },
    tos_acceptance: {
      date: Math.floor(Date.now() / 1000),
      ip: ip, // Replace with the user's actual IP address
    },
  });

  // Update account with additional information
  await stripe.accounts.update(account.id, {
    account_token: token.id,
  });

  // Save to the DB
  if (account.id && account?.external_accounts?.data.length) {
    //@ts-ignore
    isExistUser?.accountInformation?.stripeAccountId = account.id;
    //@ts-ignore
    isExistUser?.accountInformation?.bankAccountNumber =
      values.bank_info.account_number;
    //@ts-ignore
    isExistUser?.accountInformation?.externalAccountId =
      account.external_accounts.data[0].id;
    //@ts-ignore
    isExistUser?.accountInformation?.status = 'active';
    await User.findByIdAndUpdate(user.id, isExistUser);
  }

  // Create account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'http://itzel.com',
    return_url: 'http://itzel.com',
    type: 'account_onboarding',
    collect: 'eventually_due',
  });

  return accountLink.url;
};

const getCreatorStatus = async (user: any) => {
  const totalEvent = await Event.find({ creator: user.id }).countDocuments();

  const allEvents = await Event.find({ creator: user.id });
  const eventsWithGroups = await Promise.all(
    allEvents.map(async (event: any) => {
      const group = await Group.findOne({ event: event._id });
      return { event, group };
    })
  );
  const totalParticipants = eventsWithGroups.reduce(
    (acc: number, { group }) => {
      return acc + (group?.members?.length || 0);
    },
    0
  );
  const totalEarning = eventsWithGroups.reduce(
    (acc: number, { event, group }) => {
      const eventEarning = (group?.members?.length || 0) * event.price;
      return acc + eventEarning * 0.9;
    },
    0
  );

  const finalResult = {
    totalEvent,
    totalParticipants,
    totalEarning,
  };

  return finalResult;
};

const getEventStatus = async (user: any) => {
  const upcommingEvents = await Group.find({
    members: { $in: [user.id] },
  })
    .sort({ createdAt: -1 })
    .populate('event')
    .select('event')
    .lean();
  const selectEvent = await Promise.all(
    upcommingEvents.map(event => {
      return event.event;
    })
  );
  return { upcommingEvents: selectEvent, eventHistory: selectEvent };
};

const getEarningStatus = async (user: any, year: number) => {
  const result: any = {};
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  for (let month = 0; month < 12; month++) {
    const events = await Event.find({
      creator: user.id,
      time: {
        $gte: new Date(year, month, 1),
        $lte: new Date(year, month + 1, 0),
      },
    });
    const eventsWithGroups = await Promise.all(
      events.map(async (event: any) => {
        const group = await Group.findOne({ event: event._id });
        return { event, group };
      })
    );
    const totalEarning = eventsWithGroups.reduce(
      (acc: number, { event, group }) => {
        const eventEarning = (group?.members?.length || 0) * event.price;
        return acc + eventEarning * 0.9;
      },
      0
    );
    result[months[month]] = totalEarning;
  }
  return Object.keys(result).map(month => {
    return { month, totalEarning: result[month] };
  });
};

const getAllUsers = async (queryFields: any) => {
  console.log(queryFields);
  const { search, page, limit, ...restQuery } = queryFields;
  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      }
    : {};
  let queryBuilder = User.find({
    ...query,
    ...restQuery,
    role: queryFields.role ? queryFields.role : { $ne: USER_ROLES.ADMIN },
  }).select('-password -stripeAccountInfo -accountInformation -authentication');

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }

  const result = await queryBuilder;
  return result;
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  deleteUserFromDB,
  createCreatorStripeAccount,
  getCreatorStatus,
  getEventStatus,
  getEarningStatus,
  getAllUsers,
};
