import { z } from 'zod';

// ✅ Create schema
export const createStudymaterialSchema = z.object({
  body  :z.object({
    doc: z.string().optional(),
    name: z.string(),
    category: z.string(),
    size: z.string().optional(),
    Date: z.string().datetime().optional(),
    type: z.string().optional(),
    fileUrl: z.string().optional(),
    uploadedBy: z.string().optional(),
  })
});

// ✅ Update schema
export const updateStudymaterialSchema = z.object({
  body : z.object({
    doc: z.string().optional(),
    name: z.string().optional(),
    category: z.string().optional(),
    size: z.string().optional(),
   Date: z.string().datetime().optional(),
   type: z.string().optional(),
   fileUrl: z.string().optional(),
   uploadedBy: z.string().optional(),
 })
});
