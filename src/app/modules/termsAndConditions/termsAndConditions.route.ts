import express from 'express';
import { TermsAndConditionsController } from './termsAndConditions.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { TermsAndConditionsValidation } from './termsAndConditions.validation';

const router = express.Router();
const rolesOfAccess = [USER_ROLES.ADMIN] // all the user role who you want to give access to create, update and delete route
router.post(
  '/create',
  auth(...rolesOfAccess),
  validateRequest(TermsAndConditionsValidation.createTermsAndConditionsZodSchema),
  TermsAndConditionsController.createTermsAndConditions
);
router.get('/', TermsAndConditionsController.getAllTermsAndConditionss);
router.get('/:id', TermsAndConditionsController.getTermsAndConditionsById);
router.patch(
  '/:id',
  auth(...rolesOfAccess),
  validateRequest(TermsAndConditionsValidation.updateTermsAndConditionsZodSchema),
  TermsAndConditionsController.updateTermsAndConditions
);
router.delete('/:id', auth(...rolesOfAccess), TermsAndConditionsController.deleteTermsAndConditions);

export const TermsAndConditionsRoutes = router;
