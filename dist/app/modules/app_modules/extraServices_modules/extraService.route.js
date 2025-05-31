"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtraServiceRoutes = void 0;
const express_1 = __importDefault(require("express"));
const extraService_controller_1 = require("./extraService.controller");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const user_1 = require("../../../../enums/user");
const fileUploadHandler_1 = __importDefault(require("../../../middlewares/fileUploadHandler"));
const extraService_validation_1 = require("./extraService.validation");
const router = express_1.default.Router();
router.route('/').post((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), (0, fileUploadHandler_1.default)(), (req, res, next) => {
    if (req.body.data) {
        req.body = extraService_validation_1.ExtraServiceValidation.createExtraServiceZodSchema.parse(JSON.parse(req.body.data));
    }
    // Proceed to controller
    return extraService_controller_1.ExtraServiceController.createExtraService(req, res, next);
});
router.get('/', extraService_controller_1.ExtraServiceController.getAllExtraServices);
router.put('/:id', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), extraService_controller_1.ExtraServiceController.updateExtraService);
router.delete('/:id', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), extraService_controller_1.ExtraServiceController.deleteExtraService);
exports.ExtraServiceRoutes = router;
