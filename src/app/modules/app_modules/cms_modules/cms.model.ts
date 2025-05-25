import mongoose, { Schema, Document, Model } from 'mongoose';
import { ICompanyOverview, IFaq, ITermsConditions, } from './cms.interface';




const FaqSchema: Schema = new Schema<IFaq>({
    question: { type: String, required: true },
    answer: { type: String, required: true }
});

const TermsConditionsSchema: Schema = new Schema<ITermsConditions>({
    description: { type: String, required: true },
    privacyPolicy: { type: String, required: true },
    faqs: { type: [FaqSchema], required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true },
    location: { type: String, required: true },
    logo: { type: String, required: true, default: 'https://i.ibb.co/z5YHLV9/profile.png' }
});

const CMSSchema: Schema = new Schema<ICompanyOverview>({
    termsConditions: { type: TermsConditionsSchema, required: true }
});

const CMSModel: Model<ICompanyOverview> = mongoose.model<ICompanyOverview>('CompanyOverview', CMSSchema);

export default CMSModel;