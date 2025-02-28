import { Model, Types } from 'mongoose';
  
  export type ITermsAndConditions = {
    description: string
  };
  
  export type TermsAndConditionsModel = Model<ITermsAndConditions>;
