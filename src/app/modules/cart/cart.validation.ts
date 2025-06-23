// src/app/modules/cart/cart.validation.ts
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { objectIdSchema } from '../user/user.validation';

const cartItemSchema = z.object({
    productId: objectIdSchema,
    variantId: objectIdSchema,
    variantPrice: z.number().min(0, 'Price must be a positive number'),
    variantQuantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const createCartValidation = z.object({
    body: z.object({
        items: z.array(cartItemSchema).min(1, 'At least one item is required')
    })
});

export const updateCartValidation = z.object({
    body: z.object({
        items: z.array(cartItemSchema).min(1, 'At least one item is required')
    })
});

export const validateCart = (data: unknown) => {
    try {
        return createCartValidation.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new AppError(StatusCodes.BAD_REQUEST, error.errors.map(e => e.message).join(', '));
        }
        throw error;
    }
};