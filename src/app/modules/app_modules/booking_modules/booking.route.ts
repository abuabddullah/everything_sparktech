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

router.route('/search').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), BookingController.searchBooking);

// router.route('/available-drivers').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),validateRequest(BookingValidation.getAvailableDriversValidationSchema), BookingController.getAvailableDriverForAssignABooking);

router.route('/status/:id').patch(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(BookingValidation.updateStatusValidationSchema), BookingController.updateBookingStatus);
router.route('/assign-driver/:id').patch(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(BookingValidation.updateDriverValidationSchema), BookingController.assignDriverToBooking);
router.route('/admin/:id').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),BookingController.getABookingID);
router.route('/driver/:driverId').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN,USER_ROLES.DRIVER),BookingController.getBookingByDriverID);
router.route('/:id').delete(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), BookingController.deleteBooking);

export const BookingRoutes = router;