import { z } from 'zod';
import { EXTRA_SERVICE_STATUS } from '../../../../enums/extraService';

export const createExtraServiceZodSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    isProtection: z.boolean().optional(),
    isPerDay: z.boolean().optional(),
    cost: z.number().min(0, 'Cost must be a non-negative number'),
    status: z.enum([...(Object.values(EXTRA_SERVICE_STATUS) as [string, ...string[]])]).default(EXTRA_SERVICE_STATUS.ACTIVE),
});


export type IExtraServiceInput = z.infer<typeof createExtraServiceZodSchema>;

export const ExtraServiceValidation = {
    createExtraServiceZodSchema,
    updateExtraServiceZodSchema: createExtraServiceZodSchema.partial(),
};
