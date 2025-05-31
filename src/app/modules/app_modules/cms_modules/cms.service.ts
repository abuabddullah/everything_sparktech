import { IFaq, ICMSModel } from './cms.interface';
import CMSModel from './cms.model';

const CMSService = {
  // Create or replace the CMS document (singleton pattern)
  createCompanyOverview: async (data: ICMSModel) => {
    await CMSModel.deleteMany({});
    const cms = new CMSModel(data);
    await cms.save();
    return cms;
  },

  getCompanyOverview: async () => {
    const cms = await CMSModel.findOne().exec();
    if (!cms) throw new Error("CMS not found");
    return cms;
  },

  updateCompanyOverview: async (data: Partial<ICMSModel>) => {
    const updatedCms = await CMSModel.findOneAndUpdate(
      {},
      { $set: data },
      { new: true }
    ).exec();
    if (!updatedCms) throw new Error("CMS not found");
    return updatedCms;
  },

  deleteCompanyOverview: async () => {
    const result = await CMSModel.deleteMany({}).exec();
    if (result.deletedCount === 0) throw new Error("CMS not found");
  },

  // FAQ CRUD
  addFAQ: async (faqData: IFaq) => {
    const cms = await CMSModel.findOne().exec();
    if (!cms) throw new Error("CMS not found");
    cms.faqs.push(faqData);
    await cms.save();
    return cms;
  },

  editFAQ: async (faqData: IFaq, faqId: string) => {
    const cms = await CMSModel.findOne().exec();
    if (!cms) throw new Error("CMS not found");
    const idx = cms.faqs.findIndex(f => f._id == faqId);
    if (idx === -1) throw new Error("FAQ not found");
    // Update only the fields except _id to avoid changing the id during patch
    Object.assign(cms.faqs[idx], { ...faqData, _id: cms.faqs[idx]._id });
    await cms.save();
    return cms;
  },

  deleteFAQ: async (faqId: string) => {
    console.log({faqId})
    const cms = await CMSModel.findOne().exec();
    if (!cms) throw new Error("CMS not found");
    const idx = cms.faqs.findIndex(f => f._id == faqId);
    console.log({idx})
    if (idx === -1) throw new Error("FAQ not found");
    cms.faqs.splice(idx, 1);
    await cms.save();
    return cms;
  },

  getAllFAQFromDB: async () => {
    const cms = await CMSModel.findOne().exec();
    if (!cms) throw new Error("CMS not found");
    return cms.faqs;
  },

  // Contact CRUD
  getContact: async () => {
    const cms = await CMSModel.findOne().exec();
    if (!cms) throw new Error("Contact not found");
    return cms.contact;
  },

  updateContact: async (contactData: ICMSModel['contact']) => {
    console.log({contactData})
    const updatedCms = await CMSModel.findOneAndUpdate(
      {},
      { $set: { contact: contactData } },
      { new: true }
    ).exec();
    if (!updatedCms) throw new Error("Contact not found");
    return updatedCms.contact;
  },

  // Logo CRUD
  getLogo: async () => {
    const cms = await CMSModel.findOne().exec();
    if (!cms) throw new Error("Logo not found");
    return cms.logo;
  },

  updateLogo: async (logoData: string) => {
    const updatedCms = await CMSModel.findOneAndUpdate(
      {},
      { $set: { logo: logoData } },
      { new: true }
    ).exec();
    if (!updatedCms) throw new Error("Logo not found");
    return updatedCms.logo;
  },
};

export default CMSService;
