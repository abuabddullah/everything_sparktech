import { Model, Types } from 'mongoose';

export type IPackage = {
  name: string;
  allowedJobPost: number;
  allowedEventPost: number;
  features: Array<string>;
  price: number;
  stripeProductId: string;
  priceId: string;
  url: string;
};

export type PackageModel = Model<IPackage>;
