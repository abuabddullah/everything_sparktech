import { Schema, model } from 'mongoose';
import { IApplicant, ApplicantModel } from './applicant.interface';

const applicantSchema = new Schema<IApplicant, ApplicantModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    QNA: {
      type: [
        {
          question: { type: String, required: true },
          answer: { type: String, required: true },
        },
      ],
      required: true,
    },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  },
  { timestamps: true }
);

export const Applicant = model<IApplicant, ApplicantModel>(
  'Applicant',
  applicantSchema
);
