import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../errors/AppError';
import { sendEmail } from '../../utils/sendEmail';
import { User } from '../User/user.model';
import { TLoginUser } from './auth.interface';
import { createToken, verifyToken } from './auth.utils';
import { TUser } from '../User/user.interface';
import generateOTP from '../../utils/generateOTP';
import { OTPmailBody, OTPmailSubject } from '../../utils/emailTemplate';
import { OTP } from '../AppSystem/Models/otp.model';

const loginUser = async (payload: TLoginUser) => {
  // checking if the user is exist
  const user = await User.findOne({ email: payload.email });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }
  // checking if the user is already deleted

  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  // checking if the user is blocked

  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  //checking if the password is correct

  if (!(await User.isPasswordMatched(payload?.password, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');

  //create token and sent to the  user

  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const registerUser = async (payload: TUser) => {
  // checking if the user is exist
  const user = await User.findOne({ email: payload.email });

  if (user) {
    const isDeleted = user?.isDeleted;

    if (isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
    }

    // checking if the user is blocked

    const userStatus = user?.status;

    if (userStatus === 'blocked') {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
    }
    throw new AppError(httpStatus.NOT_FOUND, 'user already exist !');
  }

  const otp = generateOTP();

  const html = OTPmailBody(otp);
  const subject = OTPmailSubject;

  sendEmail(payload?.email, html, subject);

  const body = {
    email: payload.email,
    otp,
    expiresAt: new Date(Date.now() + 120000),
  };

  const storeOtpTOServer = await OTP.create(body);

  if (!storeOtpTOServer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to store OTP !');
  }

  const crypto = config.create_user_token as string;
  // const crypto = cryptoToken(10);

  const token = jwt.sign(payload, crypto, { expiresIn: '10m' });

  return {
    token,
  };
};

const compareOTP = async (otp: string, email: string) => {
  if (!otp || !email) {
    throw new AppError(httpStatus.NOT_FOUND, 'Missing OTP code or user email!');
  }
  const isOtpExist = await OTP.findOne({ email });

  if (!isOtpExist) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'OTP code Expired! Please try again.!',
    );
  }
  if (isOtpExist.otp !== otp) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Incorrect OTP. Please try again.',
    );
  }

  return null;
};

const resendOTP = async (email: string) => {
  if (!email) {
    throw new AppError(httpStatus.NOT_FOUND, 'Missing user email!');
  }

  const newOtp = generateOTP();

  const html = OTPmailBody(newOtp);
  const subject = OTPmailSubject;

  const body = {
    email: email,
    otp: newOtp,
    expiresAt: new Date(Date.now() + 120000),
  };

  const isOtpExist = await OTP.findOne({ email });

  let storeOtpTOServer = null;

  if (isOtpExist) {
    storeOtpTOServer = await OTP.updateOne(
      { email },
      { otp: newOtp, expiresAt: new Date(Date.now() + 120000) },
    );
  } else {
    storeOtpTOServer = await OTP.create(body);
  }

  if (!storeOtpTOServer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to store OTP !');
  }
  sendEmail(email, html, subject);

  return null;
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  // checking if the user is exist
  const user = await User.isUserExistsByObjectId(userData.userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }
  // checking if the user is already deleted

  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  // checking if the user is blocked

  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  //checking if the password is correct

  if (!(await User.isPasswordMatched(payload.oldPassword, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      id: userData.userId,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    },
  );

  return null;
};

const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);

  const { userId, iat } = decoded;

  // checking if the user is exist
  const user = await User.isUserExistsByObjectId(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized !');
  }

  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
  };
};

const forgetPassword = async (email: string) => {
  // checking if the user is exist
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'user not found !');
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  const otp = generateOTP();
  const html = OTPmailBody(otp);
  const subject = OTPmailSubject;

  const body = {
    email: user.email,
    otp,
    expiresAt: new Date(Date.now() + 120000),
  };
  const storeOtpTOServer = await OTP.create(body);
  if (!storeOtpTOServer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to store OTP !');
  }
  sendEmail(user?.email, html, subject);

  const jwtPayload = {
    userId: user._id,
    role: user.role,
  };
  const secret = config.reset_pass_token;
  const token = createToken(jwtPayload, secret as string, '2m');
  return token;
};

const resetPassword = async (
  payload: { newPassword: string },
  token: string,
) => {

  const decoded = jwt.verify(
    token,
    config.reset_pass_token as string,
  ) as JwtPayload;

  // checking if the user is exist
  const user = await User.findOne({ _id: decoded.userId });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'user not found !');
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      _id: decoded.userId,
      role: decoded.role,
    },
    {
      password: newHashedPassword,
    },
  );

    //create token and sent to the  user

    const jwtPayload = {
      userId: user._id,
      role: user.role,
    };
  
    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string,
    );
  
    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      config.jwt_refresh_expires_in as string,
    );
  
    return {
      accessToken,
      refreshToken,
    };
};

const addFacebook = async (user: JwtPayload) => {
  console.log(user);
}

const addLinkedin = async (user: JwtPayload) => {
  console.log(user);
}

const addInstagram = async (user: JwtPayload) => {
  console.log(user);
}

const addTwitter = async (user: JwtPayload) => {
  console.log(user);
}

export const AuthServices = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
  registerUser,
  compareOTP,
  resendOTP,

  addFacebook,
  addLinkedin,
  addInstagram,
  addTwitter,
};
