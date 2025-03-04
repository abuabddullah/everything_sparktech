import express from 'express';
import { OrganizationsController } from './organizations.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequestZFD from '../../middlewares/validateRequestZFD';
import { OrganizationsValidation } from './organizations.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
const router = express.Router();
const rolesOfAccess = [USER_ROLES.ADMIN];
router.post(
  '/create',
  auth(...rolesOfAccess),
  fileUploadHandler(),
  validateRequestZFD(OrganizationsValidation.createOrganizationsZodSchema),
  OrganizationsController.createOrganizations
);
router.get('/', OrganizationsController.getAllOrganizationss);
router.get('/:id', OrganizationsController.getOrganizationsById);
router.patch(
  '/:id',
  auth(...rolesOfAccess),
  fileUploadHandler(),
  validateRequestZFD(OrganizationsValidation.updateOrganizationsZodSchema),

  OrganizationsController.updateOrganizations
);
router.delete(
  '/:id',
  auth(...rolesOfAccess),
  OrganizationsController.deleteOrganizations
);

export const OrganizationsRoutes = router;
