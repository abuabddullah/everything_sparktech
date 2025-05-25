export interface IFaq {
    question: string;
    answer: string;
}

export interface ITermsConditions {
    description: string;      // rich text
    privacyPolicy: string;    // rich text
    faqs: IFaq[];
    contact: string;          // company default contact number
    email: string;            // company default email
    location: string;            // company default location
    logo: string;            // company default logo
}

export interface ICompanyOverview {
    termsConditions: ITermsConditions;
}