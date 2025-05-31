"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyCMSRoutes = void 0;
const express_1 = __importDefault(require("express"));
const cms_controller_1 = require("./cms.controller");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const user_1 = require("../../../../enums/user");
const fileUploadHandler_1 = __importDefault(require("../../../middlewares/fileUploadHandler"));
const router = express_1.default.Router();
// Company Overview CRUD
router.get('/', cms_controller_1.CmsController.getCompanyOverview);
router.patch('/', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), (0, fileUploadHandler_1.default)(), (req, res, next) => {
    if (req.body.data) {
        req.body = req.body.data;
    }
    // Proceed to controller
    return cms_controller_1.CmsController.updateCompanyOverview(req, res, next);
});
router.patch('/terms-conditions', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), cms_controller_1.CmsController.updateTermsConditions);
router.patch('/privacy-policy', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), cms_controller_1.CmsController.updatePrivacyPolicy);
// FAQ CRUD
router.get('/faq', cms_controller_1.CmsController.getAllFAQ);
router.post('/faq', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), cms_controller_1.CmsController.addFAQ);
router.patch('/faq/:faqId', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), cms_controller_1.CmsController.editFAQ);
router.delete('/faq/:faqId', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), cms_controller_1.CmsController.deleteFAQ);
// Contact CRUD
router.get('/contact', cms_controller_1.CmsController.getContact);
router.patch('/contact', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), cms_controller_1.CmsController.updateContact);
// Logo CRUD
router.get('/logo', cms_controller_1.CmsController.getLogo);
router.patch('/logo', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), (0, fileUploadHandler_1.default)(), cms_controller_1.CmsController.updateLogo);
exports.companyCMSRoutes = router;
