import httpStatus from 'http-status';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { StripServices } from '../Services/stripe.service';
import { paymentSuccess } from '../Constants/app.constant';

const checkoutPayment = catchAsync(async (req, res) => {
  const host = req.headers.host;
  const protocol = req.protocol;
  const { amount } = req.body;
  const result = await StripServices.checkoutPayment(
    req.user.userId,
    amount,
    host as string,
    protocol,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Please complete your account!',
    data: result,
  });
});
const withdrawToBank = catchAsync(async (req, res) => {
  const { amount } = req.body;
  const result = await StripServices.withdrawToBank(req.user.userId, amount);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Please complete your account!',
    data: result,
  });
});

const checkoutWinnerPayment = catchAsync(async (req, res) => {
  const { amount, userId } = req.body;
  const result = await StripServices.checkoutWinnerPayment(userId, amount);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment Submitted successfully!',
    data: result,
  });
});

const createConnectedStripeAccount = catchAsync(async (req, res) => {
  const host = req.headers.host;
  const protocol = req.protocol;
  const result = await StripServices.createConnectedStripeAccount(
    req.user,
    host as string,
    protocol,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Connected Account Created Successfully!',
    data: result,
  });
});

const onSucccess = catchAsync(async (req, res) => {
  await StripServices.onSucccess(req.query);
  return res.send(paymentSuccess);
});
const onConnectedStripeAccountSuccess = catchAsync(async (req, res) => {
  const result = await StripServices.onConnectedStripeAccountSuccess(
    req.params.accountId,
  );
  return res.send(result);
});

export const StripController = {
  checkoutPayment,
  onSucccess,
  onConnectedStripeAccountSuccess,
  checkoutWinnerPayment,
  createConnectedStripeAccount,
  withdrawToBank,
};
