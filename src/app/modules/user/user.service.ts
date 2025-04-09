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
import { Job } from '../job/job.model';
import { Applicant } from '../applicant/applicant.model';

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
  const isExistUser = await User.findOne({ email: user?.email });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  if (isExistUser.email !== user.email) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Email doesn't match");
  }
  const dob = new Date(data.dateOfBirth);

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
        id_number: Number(data.idNumber),
        first_name:
          data.name.split(' ')[0] ||
          isExistUser.name.split(' ')[0] ||
          isExistUser.name,
        last_name:
          data.name.split(' ')[1] ||
          isExistUser.name.split(' ')[1] ||
          isExistUser.name,
        email: user.email,
        phone: data.phoneNumber,
        address: {
          city: data.city,
          country: data.country,
          line1: data.line1,
          state: data.state,
          postal_code: data.postal_code,
        },
        ...(data.idNumber && { ssn_last_4: data.idNumber.slice(-4) }),
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
    country: data.country,
    email: data.email || isExistUser.email,
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
      account_number: data.account_number,
      country: data.country,
      currency: data.currency,
      account_holder_name: data.account_holder_name,
      account_holder_type: data.account_holder_type,
      routing_number: data.routing_number,
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
    isExistUser?.accountInformation?.bankAccountNumber = data.account_number;
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
      return acc + (group?.members?.length! - 1 || 0);
    },
    0
  );
  const totalEarning = eventsWithGroups.reduce(
    (acc: number, { event, group }) => {
      const eventEarning = (group?.members?.length! - 1 || 0) * event.price;
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
        const eventEarning = (group?.members?.length! - 1 || 0) * event.price;
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
  const finalResult = await Promise.all(
    result.map(async (user: any) => {
      if (user.role === USER_ROLES.CREATOR) {
        const totalEvent = await Event.find({
          creator: user.id,
        }).countDocuments();
        const totalJobs = await Job.find({ creator: user.id }).countDocuments();
        return {
          ...user._doc,
          totalEvent,
          totalJobs,
          role: user.role,
        };
      } else if (user.role === USER_ROLES.USER) {
        const totalEvent = await Group.find({
          members: user.id,
        }).countDocuments();
        const totalAppliedJobs = await Applicant.find({
          user: user.id,
        }).countDocuments();
        return {
          ...user._doc,
          totalEvent,
          totalAppliedJobs,
        };
      }
    })
  );
  return finalResult;
};
const getOneUser = async (id: string) => {
  const result = await User.findById(id).select(
    '-password -stripeAccountInfo -accountInformation -authentication'
  );
  return result;
};

const getAdminStatus = async () => {
  const allEvent = await Event.find();
  const totalEarning = await Promise.all(
    allEvent.map(async event => {
      const groups = await Group.find({ event: event._id });
      const totalEarning = groups.reduce((acc, group: any) => {
        const eventEarning = (group.members.length || 0) * event.price;
        return acc + eventEarning * 0.1;
      }, 0);
      return totalEarning;
    })
  ).then(sum => sum.reduce((acc, curr) => acc + curr, 0));
  const [totalUsers, totalCreator, totalEvent, totalJobs] = await Promise.all([
    User.countDocuments({ role: USER_ROLES.USER }),
    User.countDocuments({ role: USER_ROLES.CREATOR }),
    Event.countDocuments(),
    Job.countDocuments(),
  ]);

  return { totalUsers, totalCreator, totalEvent, totalJobs, totalEarning };
};

const getAdminEarnings = async (year: number) => {
  const allEvent = await Event.find();
  const totalEarningPerMonth = await Promise.all(
    [
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
    ].map(async (_, i) => {
      const groups = await Group.find({
        event: { $in: allEvent.map(event => event._id) },
        createdAt: {
          $gte: new Date(year, i, 1),
          $lte: new Date(year, i + 1, 0),
        },
      });
      const totalEarning = groups.reduce((acc, group: any) => {
        const eventEarning =
          (group.members.length || 0) *
          //@ts-ignore
          allEvent?.find(event => event._id.equals(group.event)).price;
        return acc + eventEarning * 0.1;
      }, 0);
      return { month: _ as string, totalEarning };
    })
  ).then(result =>
    result.sort(
      (a, b) =>
        [
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
        ].indexOf(a.month) -
        [
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
        ].indexOf(b.month)
    )
  );
  return totalEarningPerMonth;
};

const getUserStatus = async (year: number) => {
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
  const result = await Promise.all(
    months.map(async month => {
      const totalUsers = await User.countDocuments({
        role: USER_ROLES.USER,
        createdAt: {
          $gte: new Date(year, months.indexOf(month), 1),
          $lte: new Date(year, months.indexOf(month) + 1, 0),
        },
      });
      const totalCreator = await User.countDocuments({
        role: USER_ROLES.CREATOR,
        createdAt: {
          $gte: new Date(year, months.indexOf(month), 1),
          $lte: new Date(year, months.indexOf(month) + 1, 0),
        },
      });
      return { month, totalUsers, totalCreator };
    })
  );
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
  getOneUser,
  getAllUsers,
  getAdminStatus,
  getAdminEarnings,
  getUserStatus,
};
