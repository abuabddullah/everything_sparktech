"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const user_1 = require("../../../../enums/user");
const chatRoom_controller_1 = require("./chatRoom.controller");
const chatRoom_validation_1 = require("./chatRoom.validation");
const validateRequest_1 = __importDefault(require("../../../middlewares/validateRequest"));
const router = express_1.default.Router();
router.post('/:id', (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.DRIVER), (0, validateRequest_1.default)(chatRoom_validation_1.ChatValidation.createChatValidationSchema), chatRoom_controller_1.ChatController.createChat);
router.get('/', (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.DRIVER), chatRoom_controller_1.ChatController.getChat);
exports.ChatRoutes = router;
