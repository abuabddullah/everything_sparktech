import express from 'express';
import { USER_ROLES } from '../../../../../enums/user';
import auth from '../../../../middlewares/auth';
import { JobController } from './job.controller';

const router = express.Router();
const rolesOfAccess = Object.values(USER_ROLES);
router.post('/add/:id', auth(...rolesOfAccess), JobController.addJobToWishList);
router.delete(
  '/remove/:id',
  auth(...rolesOfAccess),
  JobController.removeJobFromWishList
);

export const JobWishListRoutes = router;
