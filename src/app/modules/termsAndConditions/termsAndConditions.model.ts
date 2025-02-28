import { Schema, model } from 'mongoose';
  import { ITermsAndConditions, TermsAndConditionsModel } from './termsAndConditions.interface';
  
  const termsAndConditionsSchema = new Schema<ITermsAndConditions, TermsAndConditionsModel>({
    description: { type: String, required: true }
  }, { timestamps: true });
  
  export const TermsAndConditions = model<ITermsAndConditions, TermsAndConditionsModel>('TermsAndConditions', termsAndConditionsSchema);
