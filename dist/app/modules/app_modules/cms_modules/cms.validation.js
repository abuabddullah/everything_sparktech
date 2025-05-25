"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyOverviewSchema = exports.TermsConditionsSchema = exports.FaqSchema = void 0;
const zod_1 = require("zod");
// Define the FAQ schema
exports.FaqSchema = zod_1.z.object({
    question: zod_1.z.string().min(1, "Question is required"),
    answer: zod_1.z.string().min(1, "Answer is required")
});
// Define the TermsConditions schema
exports.TermsConditionsSchema = zod_1.z.object({
    description: zod_1.z.string().min(1, "Description is required"),
    privacyPolicy: zod_1.z.string().min(1, "Privacy Policy is required"),
    faqs: zod_1.z.array(exports.FaqSchema).min(1, "At least one FAQ is required"),
    contact: zod_1.z.string().min(1, "Contact number is required"),
    email: zod_1.z.string().email("Invalid email format").min(1, "Email is required")
});
// Define the CompanyOverview schema
exports.CompanyOverviewSchema = zod_1.z.object({
    termsConditions: exports.TermsConditionsSchema
});
