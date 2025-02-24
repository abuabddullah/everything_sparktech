import express from 'express';
import { JobController } from './job.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequestZFD from '../../middlewares/validateRequestZFD';
import { JobValidation } from './job.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
const router = express.Router();
const rolesOfAccess = [USER_ROLES.ADMIN, USER_ROLES.CREATOR];
router.post(
  '/create',
  auth(...rolesOfAccess),
  fileUploadHandler(),
  validateRequestZFD(JobValidation.createJobZodSchema),
  JobController.createJob
);
router.get('/status', auth(USER_ROLES.CREATOR), JobController.getJobStatus);
router.get(
  '/status/all',
  auth(USER_ROLES.CREATOR),
  JobController.getAllJobStatus
);
router.get('/', JobController.getAllJobs);
router.get('/:id', JobController.getJobById);
router.patch(
  '/:id',
  auth(...rolesOfAccess),
  fileUploadHandler(),
  validateRequestZFD(JobValidation.updateJobZodSchema),

  JobController.updateJob
);
router.delete('/:id', auth(...rolesOfAccess), JobController.deleteJob);

export const JobRoutes = router;
