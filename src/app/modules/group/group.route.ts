import express from 'express';
import { GroupController } from './group.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { GroupValidation } from './group.validation';
import { JoinRoutes } from './join/join.route';

const router = express.Router();
const rolesOfAccess = [USER_ROLES.ADMIN, USER_ROLES.CREATOR];
router.post(
  '/create',
  auth(...rolesOfAccess),
  validateRequest(GroupValidation.createGroupZodSchema),
  GroupController.createGroup
);
router.post(
  '/individual',
  auth(...rolesOfAccess),
  validateRequest(GroupValidation.createGroupZodSchema),
  GroupController.createGroupIndividual
);
router.get('/', auth(USER_ROLES.ADMIN), GroupController.getAllGroups);
router.get(
  '/my',
  auth(...rolesOfAccess, USER_ROLES.USER),
  GroupController.getMyGroup
);
router.get('/:id', GroupController.getGroupById);
router.patch(
  '/:id',
  auth(...rolesOfAccess),
  validateRequest(GroupValidation.updateGroupZodSchema),
  GroupController.updateGroup
);
router.delete('/:id', auth(...rolesOfAccess), GroupController.deleteGroup);
router.use('/join', JoinRoutes);
export const GroupRoutes = router;
