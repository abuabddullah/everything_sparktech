import { z } from 'zod';

const sessionsItemSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  durationMinutes: z.number(),
  topics: z.array(z.string()),
  string: z.string(),
  array: z.string(),
  Question: z.string(),
});

const weakTopicsItemSchema = z.object({
  topic: z.string(),
  accuracy: z.number(),
  totalAttempts: z.number(),
});

export const StudyprogressValidations = {
  create: z.object({
    studentId: z.string(),
    examId: z.string(),
    sessions: z.array(sessionsItemSchema),
    totalStudyTime: z.number(),
    lastStudied: z.string().datetime(),
    bookmarks: z.array(z.string()),
    weakTopics: z.array(weakTopicsItemSchema),
  }),

  update: z.object({
    studentId: z.string().optional(),
    examId: z.string().optional(),
    sessions: z.array(sessionsItemSchema).optional(),
    totalStudyTime: z.number().optional(),
    lastStudied: z.string().datetime().optional(),
    bookmarks: z.array(z.string()).optional(),
    weakTopics: z.array(weakTopicsItemSchema).optional(),
  }),
};
