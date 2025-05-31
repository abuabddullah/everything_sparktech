"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientRoutes = void 0;
// route.ts
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../../middlewares/validateRequest"));
const client_validation_1 = require("./client.validation");
const client_controller_1 = require("./client.controller");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const user_1 = require("../../../../enums/user");
const router = express_1.default.Router();
// Route to create a new client
router.post("/", (0, validateRequest_1.default)(client_validation_1.ClientValidation.createClientSchema), client_controller_1.ClientController.createClient);
// Route to get all clients
router.get("/", (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), client_controller_1.ClientController.getAllClients);
// Route to get a client by ID
router.get("/:id", (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), client_controller_1.ClientController.getClientById);
// Route to get a client by email
router.get("/email/:email", client_controller_1.ClientController.getClientByEmail);
exports.ClientRoutes = router;
