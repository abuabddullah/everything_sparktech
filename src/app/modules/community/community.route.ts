import express from 'express';
import { CommunityController } from './community.controller';
import { answersItemSchema, createCommunitySchema, updateCommunitySchema } from './community.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';


const router = express.Router();

router.get(
  '/',
  CommunityController.getAllCommunitys
);

router.get(
  '/:id',
  CommunityController.getSingleCommunity
);

router.post(
  '/',
  auth(
    USER_ROLES.ADMIN,  USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.GUEST
  ),
  
  validateRequest(createCommunitySchema),
  CommunityController.createCommunity
);

router.patch(
  '/:id',
  auth(
    USER_ROLES.ADMIN,  USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.GUEST
  ),

  validateRequest(updateCommunitySchema),
  CommunityController.updateCommunity
);

router.delete(
  '/:id',
  auth(
    USER_ROLES.ADMIN, USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.GUEST
  ),
  CommunityController.deleteCommunity
);


// Add an answer
router.post(
  '/:communityId/answers',
  auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.GUEST),
  // validateRequest(answersItemSchema),
  CommunityController.addAnswer
);


router.delete(
  '/:communityId/answers/:answerId',
  auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.GUEST),
  CommunityController.deleteAnswer
);


router.patch(
  '/:communityId/answers/:answerId',
  auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.GUEST),
  CommunityController.updateAnswer
);

export const CommunityRoutes = router;