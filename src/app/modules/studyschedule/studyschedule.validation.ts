import { z } from 'zod'

export const StudyscheduleValidations = {
  create: z.object({
    body: z.object({
      // Accept YYYY-MM-DD or full ISO datetime string
      calendar: z.string().refine(
        s => {
          // match YYYY-MM-DD
          const dateOnly = /^\d{4}-\d{2}-\d{2}$/
          if (dateOnly.test(s)) return true
          // fallback to Date parseable ISO string
          const d = new Date(s)
          return !Number.isNaN(d.getTime())
        },
        { message: 'Invalid date format. Use YYYY-MM-DD or ISO datetime' },
      ),
      title: z.string().min(1),
      description: z.string().optional(),
    }),
  }),

  update: z.object({
    body: z.object({
      calendar: z
        .string()
        .optional()
        .refine(
          s => {
            if (!s) return true
            const dateOnly = /^\d{4}-\d{2}-\d{2}$/
            if (dateOnly.test(s)) return true
            const d = new Date(s)
            return !Number.isNaN(d.getTime())
          },
          { message: 'Invalid date format. Use YYYY-MM-DD or ISO datetime' },
        ),
      title: z.string().optional(),
      description: z.string().optional(),
      createdBy: z.string().optional(),
      isDeleted: z.boolean().optional(),
    }),
  }),
}
