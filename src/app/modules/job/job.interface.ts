import { Model, Types } from 'mongoose';

export type IJob = {
  image: string;
  companyName: string;
  role: string;
  description: string;
  address: string;
  level: string;
  jobType: string;
  requirements: Array<string>;
  experience: Array<string>;
  additionalRequirement: Array<string>;

  salary: string;
  postedBy: Types.ObjectId;
  questions: Array<string>;
};

export type JobModel = Model<IJob>;
