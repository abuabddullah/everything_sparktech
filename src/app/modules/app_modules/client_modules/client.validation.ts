// validation.ts
import { z } from "zod";

// Define the validation schema using Zod
export const createClientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  parmanentAddress: z.string().min(1, 'Permanent address is required'),
  country: z.string().min(1, 'Country is required'),
  presentAddress: z.string().min(1, 'Present address is required'),
  state: z.string().min(1, 'State is required'),
  postCode: z.string().min(1, 'Postcode is required'),
  bookings: z.array(z.string()).optional()  // Assuming bookings are ObjectIds, but it can be an array of strings
});

// Type inferred from Zod schema
export type CreateClientInput = z.infer<typeof createClientSchema>;

// Export the validation schema
export const ClientValidation = {
  createClientSchema
};
