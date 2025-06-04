import { Types } from "mongoose";

export interface IFaq {
    _id?: Types.ObjectId | string;
    question: string;
    answer: string;
}

export interface ICMSModel {
    description: string;      // rich text
    privacyPolicy: string;    // rich text
    termsConditions: string;    // rich text
    faqs: IFaq[];
    contact: {
        phone: string;          // company default contact number
        email: string;            // company default email
        whatsapp?: string;            // company default email
        location: string;
    }           // company default location
    logo: string;            // company default logo
}

// export interface ICompanyOverview {
//     termsConditions: ICMSModel;
// }