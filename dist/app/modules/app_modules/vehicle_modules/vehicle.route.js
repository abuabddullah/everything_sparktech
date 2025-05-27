"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../../enums/user");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const vehicle_controller_1 = require("./vehicle.controller");
const vehicle_validation_1 = require("./vehicle.validation");
const fileUploadHandler_1 = __importDefault(require("../../../middlewares/fileUploadHandler"));
const getFilePath_1 = require("../../../../shared/getFilePath");
const router = express_1.default.Router();
router.route('/')
    .post((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), (0, fileUploadHandler_1.default)(), (req, res, next) => {
    try {
        if (req.body.data) {
            const parsedData = JSON.parse(req.body.data);
            // Attach image path or filename to parsed data
            if (req.files) {
                let image = (0, getFilePath_1.getSingleFilePath)(req.files, 'image');
                parsedData.image = image;
            }
            // Validate and assign to req.body
            req.body = vehicle_validation_1.VehicleZodValidation.createVehicleZodSchema.parse(parsedData);
        }
        // Proceed to controller
        return vehicle_controller_1.VehicleController.createVehicle(req, res, next);
    }
    catch (error) {
        next(error); // Pass validation errors to error handler
    }
})
    .get(vehicle_controller_1.VehicleController.getAllVehicles);
router.get('/', (req, res, next) => {
    // Handle fetching all vehicles
});
router.get('/available-vehicles', (req, res, next) => {
    // Vehicle route e get /available-vehicle thakbe ja body te piktime and return time nibe ar service e unavilable slots er bahihre hole segulo retrieve korbe
});
router.get('/:id', (req, res, next) => {
    // Handle fetching a single vehicle by ID
});
router.patch('/:id', (req, res, next) => {
    // Handle updating a vehicle by ID
});
router.patch('/:id/last-maintenance', (req, res, next) => {
    // Handle updating a vehicle's last maintenance date by ID
});
router.delete('/:id', (req, res, next) => {
    // Handle deleting a vehicle by ID
});
exports.VehicleRoutes = router;
