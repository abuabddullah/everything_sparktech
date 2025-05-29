"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRoutes = void 0;
const express_1 = __importDefault(require("express"));
const fileUploadHandler_1 = __importDefault(require("../../../middlewares/fileUploadHandler"));
const user_1 = require("../../../../enums/user");
const message_controller_1 = require("./message.controller");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../../middlewares/validateRequest"));
const message_validation_1 = require("./message.validation");
const router = express_1.default.Router();
router.post('/', (0, fileUploadHandler_1.default)(), (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.DRIVER), (0, validateRequest_1.default)(message_validation_1.MessageValidation.createMessageValidationSchema), message_controller_1.MessageController.sendMessage);
router.get('/:id', (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.DRIVER), message_controller_1.MessageController.getMessageByChatID);
exports.MessageRoutes = router;
