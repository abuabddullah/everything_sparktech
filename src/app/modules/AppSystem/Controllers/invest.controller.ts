import httpStatus from 'http-status';
import { InvestServices } from '../Services/invest.service';
import sendResponse from '../../../utils/sendResponse';
import catchAsync from '../../../utils/catchAsync';

// const investMoney = catchAsync(async (req, res) => {
//   const result = await InvestServices.investMoney(
//     req.user.userId,
//     req.body.amount,
//   );

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Investment added successfully!',
//     data: result,
//   });
// });

const investRevenueByMonth = catchAsync(async (req, res) => {
  const result = await InvestServices.investRevenueByMonth();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Revenue retrived successfully!',
    data: result,
  });
});

export const InvestControllers = {
  // investMoney,
  investRevenueByMonth
};
