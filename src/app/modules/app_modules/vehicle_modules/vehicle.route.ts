import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middlewares/auth';
import { VehicleController } from './vehicle.controller';
import { VehicleZodValidation } from './vehicle.validation';
import validateRequest from '../../../middlewares/validateRequest';
import fileUploadHandler from '../../../middlewares/fileUploadHandler';
import { getSingleFilePath } from '../../../../shared/getFilePath';
const router = express.Router();

router.route('/')
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
                req.body = VehicleZodValidation.createVehicleZodSchema.parse(parsedData);
            }

            // Proceed to controller
            return VehicleController.createVehicle(req, res, next);

        } catch (error) {
            next(error); // Pass validation errors to error handler
        }
    }
)
.get(VehicleController.getAllVehicles);



router.get('/', (req: Request, res: Response, next: NextFunction) => {
    // Handle fetching all vehicles
});

router.get('/available-vehicles', (req: Request, res: Response, next: NextFunction) => {
    // Vehicle route e get /available-vehicle thakbe ja body te piktime and return time nibe ar service e unavilable slots er bahihre hole segulo retrieve korbe
});

router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
    // Handle fetching a single vehicle by ID
});

router.patch('/:id', (req: Request, res: Response, next: NextFunction) => {
    // Handle updating a vehicle by ID
});
router.patch('/:id/last-maintenance', (req: Request, res: Response, next: NextFunction) => {
    // Handle updating a vehicle's last maintenance date by ID
});

router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
    // Handle deleting a vehicle by ID
});

export const VehicleRoutes = router;
