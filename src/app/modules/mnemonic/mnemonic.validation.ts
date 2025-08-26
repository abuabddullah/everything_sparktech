import { optional, z } from 'zod'

const itemsItemSchema = z.object({
  letter: z.string(),
  meaning: z.string(),
})
const objectIdRegex = /^[0-9a-fA-F]{24}$/
export const MnemonicValidations = {
  create: z.object({
    body: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      category: z.string().regex(objectIdRegex, 'Invalid category ObjectId'),
      items: z.array(itemsItemSchema),
    }),
  }),

  update: z.object({
    body: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      category: z.string().regex(objectIdRegex, 'Invalid category ObjectId').optional(),
      items: z.array(itemsItemSchema).optional(),
    }),
  }),
}
