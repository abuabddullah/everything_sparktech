import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import { getSingleFilePath } from '../../../shared/getFilePath';
import { createLogger } from 'winston';
import ApiError from '../../../errors/ApiError';
const router = express.Router();

router
  .route('/profile')
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.DRIVER, USER_ROLES.TEAM_MEMBER, USER_ROLES.SUPER_ADMIN), UserController.getUserProfile)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.DRIVER, USER_ROLES.TEAM_MEMBER),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = UserValidation.updateUserZodSchema.parse(
          JSON.parse(req.body.data)
        );
      }
      return UserController.updateProfile(req, res, next);
    }
  );

router
  .route('/team-member')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = UserValidation.createTeamMemberZodSchema.parse(
          JSON.parse(req.body.data)
        );
      }
      // Proceed to controller
      return UserController.createTeamMember(req, res, next);
    }
  );

router.route('/team-member').get(UserController.getAllTeamMember);

router.route('/team-member/:id').patch(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(UserValidation.updateTeamMemberZodSchema), fileUploadHandler(), (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.data) {
    // Assuming you have an ApiError class and next() will handle it
    return next(new ApiError(400, 'Missing required data in request body'));
  }
  if (req.body.data) {
    req.body = UserValidation.updateTeamMemberZodSchema.parse(
      JSON.parse(req.body.data)
    );
  }
  return UserController.updateTeamMemberById(req, res, next);
})

router.route('/team-member/:id').delete(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), UserController.deleteTeamMemberById)
router.route('/team-member/:id').get(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), UserController.getTeamMemberById)


router
  .route('/admin')
  .post(
    validateRequest(UserValidation.createAdminZodSchema), auth(USER_ROLES.SUPER_ADMIN),
    UserController.createAdmin
  );

router
  .route('/admin')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    UserController.getAllAdmin
  );

router
  .route('/admin/:id')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    UserController.getAnAdmin
  );

router
  .route('/admin/:id')
  .delete(
    auth(USER_ROLES.SUPER_ADMIN),
    UserController.deleteAnAdmin
  )

router
  .route('/admin/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(UserValidation.updateAdminZodSchema),
    UserController.updateAnAdminById
  )
  ;


router
  .route('/driver')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    UserController.getAllDriver
  )
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      try {
        if (req.body.data) {
          const parsedData = JSON.parse(req.body.data);

          // Attach image path or filename to parsed data
          if (req.files) {
            let image = getSingleFilePath(req.files, 'image');
            parsedData.image = image;
          }


          // Validate and assign to req.body
          req.body = UserValidation.createDriverZodSchema.parse(parsedData);
        }

        // Proceed to controller
        return UserController.createDriver(req, res, next);

      } catch (error) {
        next(error); // Pass validation errors to error handler
      }
    }
  );

router
  .route('/driver/:id')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    UserController.getADriver
  )

router
  .route('/driver/:id')
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    UserController.deleteADriver
  )


router
  .route('/')
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
  );



export const UserRoutes = router;
