import { Schema, model } from 'mongoose';
import { IPackage, PackageModel } from './package.interface';

const packageSchema = new Schema<IPackage, PackageModel>(
  {
    name: { type: String, required: true },
    allowedJobPost: { type: Number, required: true },
    allowedEventPost: { type: Number, required: true },
    features: { type: [String], required: true },
    price: { type: Number, required: true },
    priceId: { type: String, required: true },
    url: { type: String, required: true },
    stripeProductId: { type: String, required: true },
  },
  { timestamps: true }
);

export const Package = model<IPackage, PackageModel>('Package', packageSchema);
