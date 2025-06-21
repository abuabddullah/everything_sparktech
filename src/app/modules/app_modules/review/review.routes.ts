import express, { NextFunction, Request, Response } from 'express';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';
import auth from '../../../middlewares/auth';
import validateRequest from '../../../middlewares/validateRequest';
import { USER_ROLES } from '../../../../enums/user';
const router = express.Router();



router.get("/", ReviewController.getAllReviews)
router.post("/admin", auth(USER_ROLES.ADMIN,USER_ROLES.MANAGER, USER_ROLES.SUPER_ADMIN),
     validateRequest(ReviewValidation.reviewByAdminZodSchema), async (req: Request, res: Response, next: NextFunction) => {
          try {
               const { rating, ...othersData } = req.body;

               req.body = {
                    ...othersData,
                    rating: Number(rating),
               };
               next();
          } catch (error) {
               console.log(error);
               return res.status(500).json({ message: 'Failed to convert string to number' });
          }
     }, ReviewController.createReiviewByAdmin);
router.delete("/:id", auth(USER_ROLES.SUPER_ADMIN), ReviewController.deleteReviewById)
router.post(
     '/:clientEmail',
     validateRequest(ReviewValidation.reviewZodSchema),
     async (req: Request, res: Response, next: NextFunction) => {
          try {
               const { rating, ...othersData } = req.body;

               req.body = {
                    ...othersData,
                    clientEmail: req.params.clientEmail,
                    rating: Number(rating),
               };
               next();
          } catch (error) {
               console.log(error);
               return res.status(500).json({ message: 'Failed to convert string to number' });
          }
     },
     ReviewController.createReview,
);


export const ReviewRoutes = router;
