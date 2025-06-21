import { Router } from 'express';
import { ContactController } from './contactus.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';

const router = Router();

router.post('/', ContactController.createContact);
router.get('/', auth(USER_ROLES.ADMIN,USER_ROLES.MANAGER, USER_ROLES.SUPER_ADMIN), ContactController.getAllContacts);
router.get('/:id', auth(USER_ROLES.ADMIN,USER_ROLES.MANAGER, USER_ROLES.SUPER_ADMIN), ContactController.getsingleContact);

export const ContactRoutes = router;
