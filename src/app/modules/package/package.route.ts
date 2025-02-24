import express from 'express';
import { PackageController } from './package.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PackageValidation } from './package.validation';

const router = express.Router();
const rolesOfAccess = [USER_ROLES.ADMIN];
router.post(
  '/create',
  auth(...rolesOfAccess),
  validateRequest(PackageValidation.createPackageZodSchema),
  PackageController.createPackage
);
router.get('/', PackageController.getAllPackages);
router.get('/:id', PackageController.getPackageById);
router.patch(
  '/:id',
  auth(...rolesOfAccess),
  validateRequest(PackageValidation.updatePackageZodSchema),
  PackageController.updatePackage
);
router.delete('/:id', auth(...rolesOfAccess), PackageController.deletePackage);

export const PackageRoutes = router;
