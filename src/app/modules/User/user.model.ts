/* eslint-disable @typescript-eslint/no-this-alias */
import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';
import config from '../../config';
import { UserStatus } from './user.constant';
import { TUser, UserModel } from './user.interface';

const userSchema = new Schema<TUser, UserModel>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      // select: 0,
    },
    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
      required: true,
    },
    age: {
      type: String,
      required: true,
    },
    profileImg: {
      type: String,
    },
    role: {
      type: String,
      enum: ['investor', 'admin'],
      required: true,
    },
    recommendedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: UserStatus,
      default: 'in-progress',
    },
    views: {
      type: Number,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    //Rank
    rank: {
      type: Number,
      default: 0,
    },

    prevRank: {
      type: [
        {
          date: { type: Date, required: true },
          number: { type: Number, required: true },
        },
      ],
      default: [],
    },

    raisedRank: {
      type: Number,
      default: 0,
    },

    prevRaisedRank: {
      type: [
        {
          date: { type: Date, required: true },
          number: { type: Number, required: true },
        },
      ],
      default: [],
    },

    totalInvest: {
      type: Number,
      default: 0,
    },

    totalRaised: {
      type: Number,
      default: 0,
    },
    totalRefferedAmount: {
      type: Number,
    },
    totalAdminAmount: {
      type: Number,
    },
    withdraw: {
      type: Number,
      default: 0,
    },
    stripeCustomerId: { type: String },
    userCode: {
      type: String,
      required: true
    },
    //social media
    facebook: { type: String },
    linkedin: { type: String },
    instagram: { type: String },
    twitter: { type: String },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this; // doc
  // hashing password and save into DB
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

// set '' after saving password
userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

userSchema.statics.isUserExistsByObjectId = async function (_id: string) {
  return await User.findOne({ _id }).select('+password');
};

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number,
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};

export const User = model<TUser, UserModel>('User', userSchema);
