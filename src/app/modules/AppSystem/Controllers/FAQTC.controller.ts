import httpStatus from 'http-status';
import sendResponse from '../../../utils/sendResponse';
import catchAsync from '../../../utils/catchAsync';
import { FAQTCServices } from '../Services/FAQTC.service';

const createFAQ = catchAsync(async (req, res) => {
  const result = await FAQTCServices.createFAQ(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'FAQ Created successfully!',
    data: result,
  });
});

const createTAC = catchAsync(async (req, res) => {
  const result = await FAQTCServices.createTAC(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'TAQ Created successfully!',
    data: result,
  });
});

const reportProblem = catchAsync(async (req, res) => {
  const result = await FAQTCServices.reportProblem(req.user.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Problem reported successfully!',
    data: result,
  });
});

const getReports = catchAsync(async (req, res) => {
  const result = await FAQTCServices.getReports();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reports Retrived Successfully!',
    data: result,
  });
});
const getTAC = catchAsync(async (req, res) => {
  const result = await FAQTCServices.getTAC();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'TAQ Retrived Successfully!',
    data: result,
  });
});

const getFAQ = catchAsync(async (req, res) => {
  const result = await FAQTCServices.getFAQ();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'FAQ Retrived Successfully!',
    data: result,
  });
});

const updateReport = catchAsync(async (req, res) => {
  const result = await FAQTCServices.updateReport(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report Updated Successfully!',
    data: result,
  });
});

const updateFAQ = catchAsync(async (req, res) => {
  const result = await FAQTCServices.updateFAQ(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'FAQ Updated Successfully!',
    data: result,
  });
});

const updateTAC = catchAsync(async (req, res) => {
  const result = await FAQTCServices.updateTAC(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'TAQ Updated Successfully!',
    data: result,
  });
});

const deleteTAC = catchAsync(async (req, res) => {
  const result = await FAQTCServices.deleteTAC(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'TAQ Deleted Successfully!',
    data: result,
  });
});

const deleteFAQ = catchAsync(async (req, res) => {
  const result = await FAQTCServices.deleteFAQ(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'TAQ Deleted Successfully!',
    data: result,
  });
});

const deleteReport = catchAsync(async (req, res) => {
  const result = await FAQTCServices.deleteReport(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report Deleted Successfully!',
    data: result,
  });
});

export const FAQTCControllers = {
  createFAQ,
  createTAC,
  getTAC,
  getFAQ,
  updateFAQ,
  updateTAC,
  deleteTAC,
  deleteFAQ,
  reportProblem,
  getReports,
  updateReport,
  deleteReport
};
