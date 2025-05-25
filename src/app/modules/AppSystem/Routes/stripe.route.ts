import express from 'express';
import { StripController } from '../Controllers/stripe.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../User/user.constant';

const router = express.Router();

router.post(
  '/chekout',
  auth(USER_ROLE.admin, USER_ROLE.investor),
  StripController.checkoutPayment,
);

router.post(
  '/withdraw',
  auth(USER_ROLE.admin, USER_ROLE.investor),
  StripController.withdrawToBank,
);

router.post(
  '/chekout-winner',
  auth(USER_ROLE.admin),
  StripController.checkoutWinnerPayment, //socket
);

router.get('/success', StripController.onSucccess); //socket

router.post(
  '/join-account',
  auth(USER_ROLE.admin, USER_ROLE.investor),
  StripController.createConnectedStripeAccount, //socket
);

router.get(
  '/success-account/:accountId',
  StripController.onConnectedStripeAccountSuccess,
);

export const StripeRoutes = router;