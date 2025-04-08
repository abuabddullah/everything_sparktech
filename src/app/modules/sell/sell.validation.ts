import { z } from 'zod';

const createJobZodSchema = z.object({
  image: z.any().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be a positive number'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  phone: z.string({ required_error: 'Phone number is required' }),
  whatsapp: z.string(),
  // .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid WhatsApp number format'),
});

const updateJobZodSchema = z.object({
  image: z.any().optional(),
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  price: z.number().positive('Price must be a positive number').optional(),
  country: z.string().min(1, 'Country is required').optional(),
  city: z.string().min(1, 'City is required').optional(),
  state: z.string().min(1, 'State is required').optional(),
  phone: z
    .string()
    // .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  whatsapp: z
    .string()
    // .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid WhatsApp number format')
    .optional(),
});

export const SellValidation = {
  createJobZodSchema,
  updateJobZodSchema,
};
