import { Model, Types } from 'mongoose';

export type IApplicant = {
  user: Types.ObjectId;
  QNA: Array<{
    question: string;
    answer: string;
  }>;
  job: Types.ObjectId;
};

export type ApplicantModel = Model<IApplicant>;
