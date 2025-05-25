import { Types } from 'mongoose';
import { ParsedQs } from 'qs';

export interface TInvest {
  _id: Types.ObjectId;
  amount: number;
  refferedAmount?: number;
  adminAmount: number;
  user: Types.ObjectId;
}

export interface TRaised {
  _id: Types.ObjectId;
  amount: number;
  type: string;
  investor: Types.ObjectId;
  user: Types.ObjectId;
}

export interface TMedia {
  _id: Types.ObjectId;
  name: string;
  link: string;
  iconImg: string;
  user: Types.ObjectId;
}

export interface TTicket {
  _id: Types.ObjectId;
  qty: number;
  user: Types.ObjectId;
}

export interface TOTP {
  _id: Types.ObjectId;
  email: string;
  otp: string;
  expiresAt: Date;
}

export interface TNotification {
  _id?: Types.ObjectId;
  user?: Types.ObjectId;
  title: string;
  subTitle: string;
  type: string;
}

export interface paymentSuccessQuery extends ParsedQs {
  session_id?: string;
}
