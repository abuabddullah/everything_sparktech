import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequestZFD from '../../middlewares/validateRequestZFD';
import { SellValidation } from './sell.validation';
import { sellController } from './sell.controller';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.CREATOR),
  fileUploadHandler(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = SellValidation.createJobZodSchema.parse(
        JSON.parse(req.body.data)
      );
    }
    sellController.createSellItem(req, res, next);
  }
);

router.patch(
  '/:id',
  auth(USER_ROLES.CREATOR),
  fileUploadHandler(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = SellValidation.createJobZodSchema.parse(
        JSON.parse(req.body.data)
      );
    }
    sellController.updateSellItem(req, res, next);
  }
);

router.get('/my-listings', auth(USER_ROLES.CREATOR), sellController.getMyItems);

router.delete('/:id', auth(USER_ROLES.CREATOR), sellController.deleteSellItem);
router.get(
  '/:id',
  auth(USER_ROLES.CREATOR, USER_ROLES.ADMIN, USER_ROLES.USER),
  sellController.getSingleItem
);

router.get(
  '/',
  auth(USER_ROLES.CREATOR, USER_ROLES.ADMIN, USER_ROLES.USER),
  sellController.getAllItems
);
export const SellRoutes = router;
