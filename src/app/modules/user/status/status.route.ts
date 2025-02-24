import express from 'express';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middlewares/auth';
import { StatusController } from './status.controller';

const router = express.Router();
const rolesOfAccess = [USER_ROLES.ADMIN];
router.get('/', auth(...rolesOfAccess), StatusController.getAllStatus);
export const StatusRoutes = router;
