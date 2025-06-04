import mongoose, { Schema, Document, Model } from 'mongoose';
import { ICMSModel, IFaq } from './cms.interface';

const FaqSchema: Schema = new Schema<IFaq>({
    question: { type: String, required: true },
    answer: { type: String, required: true }
});

const ContactSchema: Schema = new Schema({
    phone: { type: String, required: true },
    email: { type: String, required: true },
    whatsapp: { type: String, required: false},
    location: { type: String, required: true }
});

const CMSSchema: Schema = new Schema<ICMSModel>({
    description: { type: String, required: true },
    privacyPolicy: { type: String, required: true },
    termsConditions: { type: String, required: true },
    faqs: { type: [FaqSchema], required: true },
    contact: { type: ContactSchema, required: true },
    logo: { type: String, required: true, default: 'https://i.ibb.co/z5YHLV9/profile.png' }
});

const CMSModel: Model<ICMSModel> = mongoose.model<ICMSModel>('CMS', CMSSchema);

export default CMSModel;
