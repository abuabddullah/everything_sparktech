"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// route.ts
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../../middlewares/validateRequest"));
const client_validation_1 = require("./client.validation");
const client_controller_1 = require("./client.controller");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const user_1 = require("../../../../enums/user");
const router = express_1.default.Router();
// Route to create a new client
router.post("/client", (0, validateRequest_1.default)(client_validation_1.ClientValidation.createClientSchema), client_controller_1.ClientController.createClient);
// Route to get all clients
router.get("/clients", (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), client_controller_1.ClientController.getAllClients);
// Route to get a client by ID
router.get("/client/:id", (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), client_controller_1.ClientController.getClientById);
// Route to get a client by email
router.get("/client/email/:email", client_controller_1.ClientController.getClientByEmail);
exports.default = router;
