import express from 'express';
import { stripeAccountController } from './stripeAccount.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const stripeAccountRoutes = express.Router();

stripeAccountRoutes
     .post('/create-connected-account', auth(USER_ROLES.CREATOR), stripeAccountController.createStripeAccount)
     // .get('/success-account/:id', stripeAccountController.successPageAccount)
     .get('/refreshAccountConnect/:id', stripeAccountController.refreshAccountConnect);

stripeAccountRoutes.get('/success-account/:accountId', stripeAccountController.onConnectedStripeAccountSuccess);

export default stripeAccountRoutes;
