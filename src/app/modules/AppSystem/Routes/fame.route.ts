import express from 'express';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../User/user.constant';
import { FameControllers } from '../Controllers/fame.controller';

const router = express.Router();

router.get(
  '/most-viewed',
  auth(USER_ROLE.admin, USER_ROLE.investor),
  FameControllers.mostViewed,
);

router.get(
  '/highest-investor',
  auth(USER_ROLE.admin, USER_ROLE.investor),
  FameControllers.highestInvestor,
);

router.get(
  '/consecutively-toper',
  auth(USER_ROLE.admin, USER_ROLE.investor),
  FameControllers.consecutivelyToper,
);

export const FameRoutes = router;
