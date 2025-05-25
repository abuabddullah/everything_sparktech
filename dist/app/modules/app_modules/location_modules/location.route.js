"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const location_Controller_1 = require("./location.Controller");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const user_1 = require("../../../../enums/user");
const validateRequest_1 = __importDefault(require("../../../middlewares/validateRequest"));
const location_validation_1 = require("./location.validation");
const router = express_1.default.Router();
router.route('/').post((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), (0, validateRequest_1.default)(location_validation_1.LocationValidation.createLocationValidation), location_Controller_1.LocationController.createLocation);
router.route('/').get(location_Controller_1.LocationController.getAllLocations);
exports.LocationRoutes = router;
