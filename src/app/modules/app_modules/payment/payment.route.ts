import { Router } from 'express';
import { paymenController } from './payment.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
// import { USER_ROLE } from '../user/user.constants';

export const paymentRoutes = Router();

paymentRoutes
  .post('/', auth(USER_ROLES.CLIENT,USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN), paymenController.createPayment)
//   .get(
//     '/',
//     auth(USER_ROLE.USER, USER_ROLE.BUSINESS, USER_ROLE.ADMIN),
//     paymenController.getPaymentByCustomer,
//   )

  .get(
    '/admin',
    auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),
    paymenController.getAllPaymentByAdmin,
  )
//   .get(
//     '/last-12-months-earnings',
//     auth(USER_ROLE.BUSINESS, USER_ROLE.ADMIN),
//     paymenController.getLast12MonthsEarnings,
//   )
  .patch('/:paymentId', paymenController.updatePaymentIntentById)
  .get('/success', paymenController.successPage)
  .get('/cancel', paymenController.cancelPage);
