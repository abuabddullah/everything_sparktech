import { optional, z } from 'zod'
import { USER_ROLES } from '../../../enum/user'

const verifyEmailOrPhoneOtpZodSchema = z.object({
  body: z.object({
    email: z
      .string()
      .optional()
      .refine(value => !value || /^\S+@\S+\.\S+$/.test(value), {
        message: 'Invalid email format',
      }),
    phone: z
      .string()
      .optional()
      .refine(value => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
        message: 'Invalid phone number format',
      }),
    oneTimeCode: z.string().min(1, { message: 'OTP is required' }),
  }),
})

const forgetPasswordZodSchema = z.object({
  body: z.object({
    email: z
      .string()
      .optional()
      
      .refine(value => !value || /^\S+@\S+\.\S+$/.test(value), {
        message: 'Invalid email format',
      }),
    phone: z
      .string()
      .optional()
      .refine(value => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
        message: 'Invalid phone number format',
      }),
  }),
})

const resetPasswordZodSchema = z.object({
  body: z.object({
    newPassword: z.string().min(8, { message: 'Password is required' }),
    confirmPassword: z
      .string()
      .min(8, { message: 'Confirm Password is required' }),
  }),
})

const loginZodSchema = z.object({
  body: z.object({
    email: z
      .string()
      .optional()
      .refine(value => !value || /^\S+@\S+\.\S+$/.test(value), {
        message: 'Invalid email format',
      }),
    phone: z
      .string()
      .optional()
      .refine(value => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
        message: 'Invalid phone number format',
      }),
    deviceToken: z.string().min(1).optional(),
    password: z.string().min(8, { message: 'Password is required' }),
  }),
})

const verifyAccountZodSchema = z.object({
  body: z.object({
    email: z
      .string()
      .refine(value => !value || /^\S+@\S+\.\S+$/.test(value), {
        message: 'Invalid email format',
      }),
    phone: z
      .string()
      .optional()
      .refine(value => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
        message: 'Invalid phone number format',
      }),
    oneTimeCode: z.string().min(1, { message: 'OTP is required' }),
  }),
})

const resendOtpZodSchema = z.object({
  body: z.object({
    email: z
      .string()
      .optional()
      .refine(value => !value || /^\S+@\S+\.\S+$/.test(value), {
        message: 'Invalid email format',
      }),
    phone: z
      .string()
      .optional()
      .refine(value => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
        message: 'Invalid phone number format',
      }),
      authType:z.string(z.enum(['resetPassword','createAccount']).optional())
  }),
})

const changePasswordZodSchema = z.object({
  body: z
    .object({
      currentPassword: z.string({
        required_error: 'Current password is required',
      }),
      newPassword: z
        .string({
          required_error: 'New password is required',
        })
        .min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string({
        required_error: 'Confirm password is required',
      }),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
})

const deleteAccount = z.object({
  body: z
    .object({
    password: z.string({
      required_error: 'Password is required',
    })
   })
    
})


const addressSchema = z.object({
  city: z.string().optional(),
  permanentAddress: z.string().optional(),
  presentAddress: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

const createUserZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email(),
    password: z.string({ required_error: 'Password is required' }).min(6),
    name: z.string({ required_error: 'Name is required' }).optional(),
    phone: z.string({ required_error: 'Phone is required' }).optional(),
    address: addressSchema.optional(),
    role: z.enum(
      [
        USER_ROLES.ADMIN,
        USER_ROLES.STUDENT,
        USER_ROLES.GUEST,
        USER_ROLES.TEACHER,
      ],
      {
        message: 'Role must be one of admin, student, guest, teacher',
      },
    ),
  }),
})

const socialLoginZodSchema = z.object({
  body: z.object({
    appId: z.string({ required_error: 'App ID is required' }),
    deviceToken: z.string({ required_error: 'Device token is required' }),
  }),
})

export const AuthValidations = {
  verifyEmailOrPhoneOtpZodSchema,
  forgetPasswordZodSchema,
  resetPasswordZodSchema,
  loginZodSchema,
  verifyAccountZodSchema,
  resendOtpZodSchema,
  changePasswordZodSchema,
  createUserZodSchema,
  deleteAccount,
  socialLoginZodSchema
}
