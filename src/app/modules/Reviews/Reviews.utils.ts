import { z } from 'zod'

export const objectIdSchemaOptional = z
  .string()
  .regex(/^[a-f\d]{24}$/i, { message: 'Invalid ObjectId' })
  .optional()

export const objectIdSchemaMendatory = (fieldName: string) =>
  z.string().regex(/^[a-f\d]{24}$/i, { message: `Invalid ${fieldName} Id` })
