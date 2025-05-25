import { z } from 'zod';
import { UserStatus } from './user.constant';

const userValidationSchema = z.object({
  pasword: z
    .string({
      invalid_type_error: 'Password must be string',
    })
    .max(20, { message: 'Password can not be more than 20 characters' })
    .optional(),
});

const changeStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([...UserStatus] as [string, ...string[]]),
  }),
});

const createUserValidationShema = z.object({
  body: z.object({
    password: z.string().min(1, { message: "Password is required" }),
    userData: z.object({
      name: z.string().min(1, { message: "Name is required" }),
      email: z.string().email({ message: "Invalid email address" }),
      profileImg: z.string().url().optional(), // Optional, must be valid URL if exists
      role: z.enum(['investor', 'admin']),
    })
  })
});

export const UserValidation = {
  userValidationSchema,
  changeStatusValidationSchema,
  createUserValidationShema
};

