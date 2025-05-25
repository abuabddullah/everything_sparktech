import { z } from 'zod';

// Define the FAQ schema
export const FaqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required")
});

// Define the TermsConditions schema
export const TermsConditionsSchema = z.object({
  description: z.string().min(1, "Description is required"),
  privacyPolicy: z.string().min(1, "Privacy Policy is required"),
  faqs: z.array(FaqSchema).min(1, "At least one FAQ is required"),
  contact: z.string().min(1, "Contact number is required"),
  email: z.string().email("Invalid email format").min(1, "Email is required")
});

// Define the CompanyOverview schema
export const CompanyOverviewSchema = z.object({
  termsConditions: TermsConditionsSchema
});
