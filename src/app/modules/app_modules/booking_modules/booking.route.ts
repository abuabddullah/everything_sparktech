import express from 'express';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
import validateRequest from '../../../middlewares/validateRequest';
import { BookingValidation } from './booking.validation';
import { BookingController } from './booking.controller';

const router = express.Router();


router.route('/')
    .get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), BookingController.getAllBookings)
    .post(
        validateRequest(BookingValidation.createBookingValidationSchema),
        BookingController.createBooking
    );

router.route('/assign-driver/:id').patch(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(BookingValidation.updateDriverValidationSchema), BookingController.assignDriverToBooking);

export const BookingRoutes = router;