import express from 'express';
import { ApplicantController } from './applicant.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ApplicantValidation } from './applicant.validation';

const router = express.Router();
const rolesOfAccess = [USER_ROLES.ADMIN, USER_ROLES.CREATOR, USER_ROLES.USER];
router.post(
  '/create',
  auth(...rolesOfAccess),
  validateRequest(ApplicantValidation.createApplicantZodSchema),
  ApplicantController.createApplicant
);
router.get('/', ApplicantController.getAllApplicants);
router.get('/:id', ApplicantController.getApplicantById);
router.patch(
  '/:id',
  auth(...rolesOfAccess),
  validateRequest(ApplicantValidation.updateApplicantZodSchema),
  ApplicantController.updateApplicant
);
router.delete(
  '/:id',
  auth(...rolesOfAccess),
  ApplicantController.deleteApplicant
);

export const ApplicantRoutes = router;
