import { z } from 'zod'
import { USER_ROLES, USER_STATUS } from '../../../enum/user'

const createUserZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email(),
    password: z.string({ required_error: 'Password is required' }).min(6),
    name: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    role: z.enum(
      [
        USER_ROLES.ADMIN,
        USER_ROLES.TEACHER,
        USER_ROLES.STUDENT,
        USER_ROLES.GUEST,
      ],
      {
        message: 'Role must be one of admin, teacher, student, guest',
      },
    ),
  }),
})

const updateUserZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    image: z.array(z.string()).optional(),
  }),
})

const updateUserStatusZodSchema = z.object({
  body: z.object({
    status: z.enum(
      [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE, USER_STATUS.DELETED],
      {
        required_error: 'Status is required',
        invalid_type_error: 'Status must be a valid enum value',
      },
    ),
  }),
})

export const UserValidations = {
  createUserZodSchema,
  updateUserZodSchema,
  updateUserStatusZodSchema,
}
