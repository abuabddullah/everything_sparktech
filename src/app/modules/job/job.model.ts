import { Schema, model } from 'mongoose';
import { IJob, JobModel } from './job.interface';

const jobSchema = new Schema<IJob, JobModel>(
  {
    image: { type: String, required: true },
    companyName: { type: String, required: true },
    role: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    level: { type: String, required: true },
    jobType: { type: String, required: true },
    salary: { type: String, required: true },
    requirements: { type: [String], required: true },
    experience: { type: [String], required: true },
    additionalRequirement: { type: [String], required: true },
    questions: { type: [String], required: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Job = model<IJob, JobModel>('Job', jobSchema);
