import { ICompanyOverview, IFaq, ITermsConditions } from './cms.interface';
import CMSModel from './cms.model';
import { CompanyOverviewSchema, FaqSchema } from './cms.validation';

const CMSService = {
  createCompanyOverview: async (data: ICompanyOverview) => {
    // Validate the data with Zod
    CompanyOverviewSchema.parse(data);

    // Create and save the company overview
    const newCompanyOverview = new CMSModel(data);
    await newCompanyOverview.save();
    return newCompanyOverview;
  },

  getCompanyOverview: async () => {
    const companyOverview = await CMSModel.findOne().exec();
    if (!companyOverview) throw new Error("Company Overview not found");
    return companyOverview;
  },

  updateCompanyOverview: async (data: ICompanyOverview) => {
    // Validate the data with Zod
    CompanyOverviewSchema.parse(data);

    const updatedCompanyOverview = await CMSModel.findOneAndUpdate(
      {},
      { termsConditions: data.termsConditions },
      { new: true }
    ).exec();
    if (!updatedCompanyOverview) throw new Error("Company Overview not found");
    return updatedCompanyOverview;
  },

  deleteCompanyOverview: async () => {
    const result = await CMSModel.deleteOne().exec();
    if (result.deletedCount === 0) throw new Error("Company Overview not found");
  },

  addFAQ: async (faqData: IFaq) => {
    FaqSchema.parse(faqData);

    const companyOverview = await CMSModel.findOne().exec();
    if (!companyOverview) throw new Error("Company Overview not found");

    companyOverview.termsConditions.faqs.push(faqData);
    await companyOverview.save();
    return companyOverview;
  },

  editFAQ: async (faqData: IFaq) => {
    FaqSchema.parse(faqData);

    const companyOverview = await CMSModel.findOne().exec();
    if (!companyOverview) throw new Error("Company Overview not found");

    const faqIndex = companyOverview.termsConditions.faqs.findIndex(
      (faq) => faq.question === faqData.question
    );
    if (faqIndex === -1) throw new Error("FAQ not found");

    companyOverview.termsConditions.faqs[faqIndex] = faqData;
    await companyOverview.save();
    return companyOverview;
  },

  deleteFAQ: async (faqData: IFaq) => {
    FaqSchema.parse(faqData);

    const companyOverview = await CMSModel.findOne().exec();
    if (!companyOverview) throw new Error("Company Overview not found");

    const faqIndex = companyOverview.termsConditions.faqs.findIndex(
      (faq) => faq.question === faqData.question
    );
    if (faqIndex === -1) throw new Error("FAQ not found");

    companyOverview.termsConditions.faqs.splice(faqIndex, 1);
    await companyOverview.save();
    return companyOverview;
  },
};

export default CMSService;
