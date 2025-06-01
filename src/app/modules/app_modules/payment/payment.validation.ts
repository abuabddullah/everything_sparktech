import { z } from 'zod';

export const PaymentSchema = z.object({
    bookingId: z.string().length(24, 'Invalid ObjectId format'),
    vehicleId: z.string().length(24, 'Invalid ObjectId format'),
    clientId: z.string().length(24, 'Invalid ObjectId format'),
    amount: z.number().positive('Amount must be greater than 0'),
    paymentMethod: z.enum(['BANK']),
    status: z.enum(['PAID']),
    paymentIntent: z.string().optional(),
    stripeCustomerId: z.string().optional()
});