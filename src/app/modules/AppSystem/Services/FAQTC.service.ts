import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { FAQ, Report, TAQ } from '../Models/FAQTQ.model';
import { Types } from 'mongoose';
import { sendEmail } from '../../../utils/sendEmail';
import { User } from '../../User/user.model';

const createFAQ = async (payload: { question: string; answer: string }) => {
  if (!payload) {
    throw new AppError(httpStatus.NOT_FOUND, 'please provide the data!');
  }
  const result = await FAQ.create(payload);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to create!');
  }
  return result;
};

const reportProblem = async (
  userId: string,
  payload: { text: string; user: Types.ObjectId },
) => {
  if (!payload) {
    throw new AppError(httpStatus.NOT_FOUND, 'please provide the data!');
  }
  payload.user = new Types.ObjectId(userId);

  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'user not found!');
  }
  const result = await Report.create(payload);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to create!');
  }
  const html = payload.text;
  const subject = 'Reporting Problem';

  await sendEmail(user?.email as string, html, subject);

  return result;
};

const createTAC = async (payload: { text: string }) => {
  if (!payload) {
    throw new AppError(httpStatus.NOT_FOUND, 'please provide the data!');
  }
  const result = await TAQ.create(payload);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to create!');
  }
  return result;
};

const getTAC = async () => {
  const result = TAQ.find();
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to get!');
  }
  return result;
};

const getReports = async () => {
  const result = Report.find();
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to get!');
  }
  return result;
};

const getFAQ = async () => {
  const result = FAQ.find();
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to get!');
  }
  return result;
};

const updateFAQ = async (
  _id: string,
  payload: Partial<{ question: string; answer: string }>,
) => {
  if (!_id) {
    throw new AppError(httpStatus.NOT_FOUND, 'please provide the user id!');
  }
  const result = await FAQ.findOneAndUpdate({ _id }, payload, { new: true });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to update!');
  }
  return result;
};
const updateReport = async (_id: string, payload: { text: string }) => {
  if (!_id) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid or missing ID!');
  }
  console.log(_id, payload);
  const result = await Report.findOneAndUpdate(
    { _id },
    { $set: payload },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to update!');
  }
  return result;
};

const updateTAC = async (_id: string, payload: { text: string }) => {
  if (!_id) {
    throw new AppError(httpStatus.NOT_FOUND, 'please provide the user id!');
  }
  const result = await TAQ.findOneAndUpdate({ _id }, payload, { new: true });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to update!');
  }
  return result;
};

const deleteTAC = async (_id: string) => {
  if (!_id) {
    throw new AppError(httpStatus.NOT_FOUND, 'please provide the user id!');
  }
  const result = await TAQ.deleteOne({ _id });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to delete!');
  }
  return result;
};

const deleteFAQ = async (_id: string) => {
  if (!_id) {
    throw new AppError(httpStatus.NOT_FOUND, 'please provide the user id!');
  }
  const result = await FAQ.deleteOne({ _id });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to delete!');
  }
  return result;
};

const deleteReport = async (_id: string) => {
  if (!_id) {
    throw new AppError(httpStatus.NOT_FOUND, 'please provide the user id!');
  }
  const result = await Report.deleteOne({ _id });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to delete!');
  }
  return result;
};

export const FAQTCServices = {
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
  deleteReport,
};
