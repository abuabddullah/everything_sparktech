import { Schema, model } from 'mongoose';
import {
  ITermsAndConditions,
  TermsAndConditionsModel,
} from './termsAndConditions.interface';

const termsAndConditionsSchema = new Schema<
  ITermsAndConditions,
  TermsAndConditionsModel
>(
  {
    description: { type: String, required: true },
  },
  { timestamps: true }
);
termsAndConditionsSchema.pre('save', async function (next) {
  const isExist = await TermsAndConditions.findOne({});
  if (isExist) {
    throw new Error('TermsAndConditions already exist!');
  }
  next();
});
export const TermsAndConditions = model<
  ITermsAndConditions,
  TermsAndConditionsModel
>('TermsAndConditions', termsAndConditionsSchema);
