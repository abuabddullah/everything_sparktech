import { Request, Response } from 'express';
import CMSService from './cms.service';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../../shared/getFilePath';

export const CmsController = {
  // // Company Overview CRUD

  getCompanyOverview: catchAsync(async (_req: Request, res: Response) => {
    const companyOverview = await CMSService.getCompanyOverview();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'CMS Retrieved successfully',
      data: companyOverview,
    });
  }),


  updateCompanyOverview: catchAsync(async (req: Request, res: Response) => {
    let image = getSingleFilePath(req.files, 'image');

    let body = req.body;
    if (typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch (e) {
        console.error('Invalid JSON in req.body', e);
        return res.status(400).json({ error: 'Invalid JSON in request body' });
      }
    }

    const data = {
      logo: image,
      ...body
    };

    const companyOverview = await CMSService.updateCompanyOverview(data);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Company Overview updated successfully',
      data: data,
    });
  }),


  deleteCompanyOverview: catchAsync(async (_req: Request, res: Response) => {
    await CMSService.deleteCompanyOverview();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.NO_CONTENT,
      message: 'Company Overview deleted successfully',
      data: null,
    });
  }),

  // FAQ CRUD
  addFAQ: catchAsync(async (req: Request, res: Response) => {
    const updatedCompanyOverview = await CMSService.addFAQ(req.body);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'FAQ added successfully',
      data: updatedCompanyOverview,
    });
  }),

  editFAQ: catchAsync(async (req: Request, res: Response) => {
    const { faqId } = req.params
    const updatedCompanyOverview = await CMSService.editFAQ(req.body, faqId);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'FAQ edited successfully',
      data: updatedCompanyOverview,
    });
  }),

  deleteFAQ: catchAsync(async (req: Request, res: Response) => {
    const { faqId } = req.params
    const updatedCompanyOverview = await CMSService.deleteFAQ(faqId);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'FAQ deleted successfully',
      data: updatedCompanyOverview,
    });
  }),

  getAllFAQ: catchAsync(async (_req: Request, res: Response) => {
    const faqs = await CMSService.getAllFAQFromDB();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'FAQs retrieved successfully',
      data: faqs,
    });
  }),

  // Contact CRUD
  getContact: catchAsync(async (_req: Request, res: Response) => {
    const contact = await CMSService.getContact();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Contact retrieved successfully',
      data: contact,
    });
  }),

  updateContact: catchAsync(async (req: Request, res: Response) => {
    const updatedContact = await CMSService.updateContact(req.body);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Contact updated successfully',
      data: updatedContact,
    });
  }),

  // Logo CRUD
  getLogo: catchAsync(async (_req: Request, res: Response) => {
    const logo = await CMSService.getLogo();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Logo retrieved successfully',
      data: logo,
    });
  }),

  updateLogo: catchAsync(async (req: Request, res: Response) => {

    let logo = getSingleFilePath(req.files, 'image');
    const updatedLogo = await CMSService.updateLogo(logo!);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Logo updated successfully',
      data: updatedLogo,
    });
  }),
};
