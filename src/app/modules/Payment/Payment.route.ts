import express from 'express';
import { PaymentController } from './Payment.controller';

const router = express.Router();

router.get('/success', PaymentController.successPage);
router.get('/cancel', PaymentController.cancelPage);


export const PaymentRoutes = router;
