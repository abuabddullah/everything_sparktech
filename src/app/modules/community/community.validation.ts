import { z } from 'zod';

export const answersItemSchema = z.object({
  body : z.object({
    userId: z.string().optional(),
    date: z.string().optional(),
    comments: z.string(),
  })
});

export const createCommunitySchema = z.object({
 body : z.object({
   userId: z.string().optional(),
  avatarUrl: z.string().optional(),
  question: z.string(),
  details: z.string().optional(),
  answers: z.array(answersItemSchema).optional(),
  answersCount: z.number().optional(),
  likesCount: z.number().optional(),
  tags: z.array(z.string()).optional(),
  status: z.string().optional(),
 })
});

export const updateCommunitySchema = z.object({
 body : z.object({
   userId: z.string().optional(),
  name: z.string().optional(),
  avatarUrl: z.string().optional(),
  question: z.string().optional(),
  details: z.string().optional(),
  answers: z.array(answersItemSchema).optional(),
  answersCount: z.number().optional(),
  likesCount: z.number().optional(),
  tags: z.array(z.string()).optional(),
  status: z.string().optional(),
 })
});
