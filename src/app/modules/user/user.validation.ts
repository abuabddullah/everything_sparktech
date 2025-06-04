import { z } from 'zod';
import { TEAM_ROLES } from '../../../enums/user';

const createUserZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    contact: z.string({ required_error: 'Contact is required' }),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
    location: z.string({ required_error: 'Location is required' }),
    profile: z.string().optional(),
  }),
});

const createTeamMemberZodSchema = z.object({
  name: z.string({ required_error: 'Name is required' }),
  teamDescription: z.string({ required_error: 'description is required' }).optional(),
  teamRole: z.enum([...Object.values(TEAM_ROLES)] as [string, ...string[]]).optional(),
  designation: z.string({ required_error: 'Designation is required' }),
});
const updateTeamMemberZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).optional(),
    teamDescription: z.string({ required_error: 'description is required' }).optional(),
    teamRole: z.enum([...Object.values(TEAM_ROLES)] as [string, ...string[]]).optional(),
    designation: z.string({ required_error: 'Designation is required' }).optional(),
  })
});

const createAdminZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

const updateAdminZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).optional(),
    email: z.string({ required_error: 'Email is required' }).optional(),
  }),
});

const createDriverZodSchema = z.object({
  name: z.string({ required_error: 'Name is required' }),
  dateOfBirth: z.string(),
  image: z.string(),
  phone: z.string(),
  email: z.string({ required_error: 'Email is required' }),
  password: z.string().optional(),
  licenseNumber: z.string(),
  address: z.string(),
})

const updateUserZodSchema = z.object({
  name: z.string().optional(),
  contact: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  location: z.string().optional(),
  image: z.string().optional(),
});

export const UserValidation = {
  createUserZodSchema,
  createTeamMemberZodSchema,
  updateUserZodSchema,
  createAdminZodSchema,
  createDriverZodSchema,
  updateAdminZodSchema,
  updateTeamMemberZodSchema
};
