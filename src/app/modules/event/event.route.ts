import express from 'express';
import { EventController } from './event.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
const router = express.Router();
const rolesOfAccess = [USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.CREATOR];
router.post(
  '/create',
  auth(...rolesOfAccess),
  fileUploadHandler(),
  EventController.createEvent
);
router.get('/status', auth(USER_ROLES.CREATOR), EventController.getEventStatus);
router.get(
  '/status/all',
  auth(USER_ROLES.CREATOR, USER_ROLES.USER),
  EventController.getEventStatusAll
);
router.post(
  '/perticipate/:id',
  auth(...rolesOfAccess),
  EventController.perticipate
);
router.get('/', EventController.getAllEvents);
router.get('/:id', EventController.getEventById);

router.patch(
  '/:id',
  auth(...rolesOfAccess),
  fileUploadHandler(),
  EventController.updateEvent
);
router.delete('/:id', auth(...rolesOfAccess), EventController.deleteEvent);

export const EventRoutes = router;
