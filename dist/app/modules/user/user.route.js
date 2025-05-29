"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const getFilePath_1 = require("../../../shared/getFilePath");
const router = express_1.default.Router();
router
    .route('/profile')
    .get((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.USER, user_1.USER_ROLES.DRIVER, user_1.USER_ROLES.TEAM_MEMBER), user_controller_1.UserController.getUserProfile)
    .patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.USER, user_1.USER_ROLES.DRIVER, user_1.USER_ROLES.TEAM_MEMBER), (0, fileUploadHandler_1.default)(), (req, res, next) => {
    if (req.body.data) {
        req.body = user_validation_1.UserValidation.updateUserZodSchema.parse(JSON.parse(req.body.data));
    }
    return user_controller_1.UserController.updateProfile(req, res, next);
});
router
    .route('/team-member')
    .post((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), (0, fileUploadHandler_1.default)(), (req, res, next) => {
    if (req.body.data) {
        req.body = user_validation_1.UserValidation.createTeamMemberZodSchema.parse(JSON.parse(req.body.data));
    }
    // Proceed to controller
    return user_controller_1.UserController.createTeamMember(req, res, next);
});
router
    .route('/admin')
    .post((0, validateRequest_1.default)(user_validation_1.UserValidation.createAdminZodSchema), (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), user_controller_1.UserController.createAdmin);
router
    .route('/admin')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), user_controller_1.UserController.getAllAdmin);
router
    .route('/admin/:id')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), user_controller_1.UserController.getAnAdmin);
router
    .route('/admin/:id')
    .delete((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), user_controller_1.UserController.deleteAnAdmin);
router
    .route('/driver')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.getAllDriver)
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
            req.body = user_validation_1.UserValidation.createDriverZodSchema.parse(parsedData);
        }
        // Proceed to controller
        return user_controller_1.UserController.createDriver(req, res, next);
    }
    catch (error) {
        next(error); // Pass validation errors to error handler
    }
});
router
    .route('/driver/:id')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.getADriver);
router
    .route('/')
    .post((0, validateRequest_1.default)(user_validation_1.UserValidation.createUserZodSchema), user_controller_1.UserController.createUser);
exports.UserRoutes = router;
