// route.ts
import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import { ClientValidation } from "./client.validation";
import { ClientController } from "./client.controller";
import auth from "../../../middlewares/auth";
import { USER_ROLES } from "../../../../enums/user";

const router = express.Router();

// Route to create a new client
router.post("/client", validateRequest(ClientValidation.createClientSchema), ClientController.createClient);

// Route to get all clients
router.get("/clients",auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN), ClientController.getAllClients);
    
// Route to get a client by ID
router.get("/client/:id", auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN), ClientController.getClientById);

// Route to get a client by email
router.get("/client/email/:email", ClientController.getClientByEmail);

export default router;
