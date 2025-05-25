// const createCompanyOverview = async (req, res) => {
//   try {
//     const companyOverview = new CompanyOverview({
//       termsConditions: req.body.termsConditions
//     });

//     await companyOverview.save();
//     res.status(201).json(companyOverview);
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating company overview', error });
//   }
// };


// const getCompanyOverview = async (req, res) => {
//   try {
//     const companyOverview = await CompanyOverview.findOne();
//     if (!companyOverview) {
//       return res.status(404).json({ message: 'Company Overview not found' });
//     }
//     res.json(companyOverview);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching company overview', error });
//   }
// };


// const updateCompanyOverview = async (req, res) => {
//   try {
//     const updatedOverview = await CompanyOverview.findOneAndUpdate(
//       {},
//       { termsConditions: req.body.termsConditions },
//       { new: true }  // returns the updated document
//     );

//     if (!updatedOverview) {
//       return res.status(404).json({ message: 'Company Overview not found' });
//     }

//     res.json(updatedOverview);
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating company overview', error });
//   }
// };


// const deleteCompanyOverview = async (req, res) => {
//   try {
//     const result = await CompanyOverview.deleteOne({});
//     if (result.deletedCount === 0) {
//       return res.status(404).json({ message: 'Company Overview not found' });
//     }
//     res.json({ message: 'Company Overview deleted' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error deleting company overview', error });
//   }
// };


// const addFAQ = async (req, res) => {
//   try {
//     const { question, answer } = req.body;
//     const companyOverview = await CompanyOverview.findOne();

//     if (!companyOverview) {
//       return res.status(404).json({ message: 'Company Overview not found' });
//     }

//     companyOverview.termsConditions.faqs.push({ question, answer });
//     await companyOverview.save();

//     res.json(companyOverview);
//   } catch (error) {
//     res.status(500).json({ message: 'Error adding FAQ', error });
//   }
// };


// const editFAQ = async (req, res) => {
//   const { faqId, question, answer } = req.body;

//   try {
//     const companyOverview = await CompanyOverview.findOne();
//     if (!companyOverview) {
//       return res.status(404).json({ message: 'Company Overview not found' });
//     }

//     const faq = companyOverview.termsConditions.faqs.id(faqId);
//     if (!faq) {
//       return res.status(404).json({ message: 'FAQ not found' });
//     }

//     faq.question = question || faq.question;
//     faq.answer = answer || faq.answer;

//     await companyOverview.save();

//     res.json(companyOverview);
//   } catch (error) {
//     res.status(500).json({ message: 'Error editing FAQ', error });
//   }
// };


// const deleteFAQ = async (req, res) => {
//   const { faqId } = req.body;

//   try {
//     const companyOverview = await CompanyOverview.findOne();
//     if (!companyOverview) {
//       return res.status(404).json({ message: 'Company Overview not found' });
//     }

//     const faq = companyOverview.termsConditions.faqs.id(faqId);
//     if (!faq) {
//       return res.status(404).json({ message: 'FAQ not found' });
//     }

//     faq.remove();
//     await companyOverview.save();

//     res.json(companyOverview);
//   } catch (error) {
//     res.status(500).json({ message: 'Error deleting FAQ', error });
//   }
// };


// export const CmsController = { createCompanyOverview, getCompanyOverview, updateCompanyOverview, deleteCompanyOverview, addFAQ, editFAQ, deleteFAQ }




import { Request, Response } from 'express';
import CMSService from './cms.service';
import catchAsync from '../../../../shared/catchAsync';

// Controller for creating company overview
export const CmsController = {
  createCompanyOverview: catchAsync(async (req: Request, res: Response) => {
    const companyOverview = await CMSService.createCompanyOverview(req.body);
    res.status(201).json(companyOverview);
  }),

  getCompanyOverview: catchAsync(async (req: Request, res: Response) => {
    const companyOverview = await CMSService.getCompanyOverview();
    res.status(200).json(companyOverview);
  }),

  updateCompanyOverview: catchAsync(async (req: Request, res: Response) => {
    const companyOverview = await CMSService.updateCompanyOverview(req.body);
    res.status(200).json(companyOverview);
  }),

  deleteCompanyOverview: catchAsync(async (req: Request, res: Response) => {
    await CMSService.deleteCompanyOverview();
    res.status(204).send();
  }),

  addFAQ: catchAsync(async (req: Request, res: Response) => {
    const updatedCompanyOverview = await CMSService.addFAQ(req.body);
    res.status(200).json(updatedCompanyOverview);
  }),

  editFAQ: catchAsync(async (req: Request, res: Response) => {
    const updatedCompanyOverview = await CMSService.editFAQ(req.body);
    res.status(200).json(updatedCompanyOverview);
  }),

  deleteFAQ: catchAsync(async (req: Request, res: Response) => {
    const updatedCompanyOverview = await CMSService.deleteFAQ(req.body);
    res.status(200).json(updatedCompanyOverview);
  }),
};
