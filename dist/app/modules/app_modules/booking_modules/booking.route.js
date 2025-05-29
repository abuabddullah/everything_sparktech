"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const user_1 = require("../../../../enums/user");
const validateRequest_1 = __importDefault(require("../../../middlewares/validateRequest"));
const booking_validation_1 = require("./booking.validation");
const booking_controller_1 = require("./booking.controller");
const router = express_1.default.Router();
router.route('/')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), booking_controller_1.BookingController.getAllBookings)
    .post((0, validateRequest_1.default)(booking_validation_1.BookingValidation.createBookingValidationSchema), booking_controller_1.BookingController.createBooking);
router.route('/:id').delete((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), booking_controller_1.BookingController.deleteBooking);
router.route('/search').get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), booking_controller_1.BookingController.searchBooking);
// router.route('/available-drivers').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),validateRequest(BookingValidation.getAvailableDriversValidationSchema), BookingController.getAvailableDriverForAssignABooking);
router.route('/assign-driver/:id').patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), (0, validateRequest_1.default)(booking_validation_1.BookingValidation.updateDriverValidationSchema), booking_controller_1.BookingController.assignDriverToBooking);
exports.BookingRoutes = router;
