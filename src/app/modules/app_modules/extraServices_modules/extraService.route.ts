import express, { NextFunction, Request, Response } from 'express';
import { ExtraServiceController } from './extraService.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
import fileUploadHandler from '../../../middlewares/fileUploadHandler';
import { ExtraServiceValidation } from './extraService.validation';

const router = express.Router();

router.route('/').post(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data) {
            req.body = ExtraServiceValidation.createExtraServiceZodSchema.parse(
                JSON.parse(req.body.data)
            );
        }
        // Proceed to controller
        return ExtraServiceController.createExtraService(req, res, next);
    });
router.get('/', ExtraServiceController.getAllExtraServices);
router.get('/protection', ExtraServiceController.getAllProtectionExtraServices);
router.patch('/status/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ExtraServiceController.updateExtraServiceStatus);
router.get('/:id',ExtraServiceController.getExtraServiceById);
router.patch('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),fileUploadHandler(), ExtraServiceController.updateExtraService);
router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ExtraServiceController.deleteExtraService);

export const ExtraServiceRoutes = router;
