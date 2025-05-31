"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCMS = seedCMS;
const cms_model_1 = __importDefault(require("../app/modules/app_modules/cms_modules/cms.model"));
const logger_1 = require("../shared/logger");
// Example seed data with rich text (HTML) for privacyPolicy and termsConditions
const cmsSeedData = {
    description: 'Welcome to our car rental service. We offer the best cars at affordable prices.',
    privacyPolicy: `<h2>Privacy Policy</h2>
    <p>Your privacy is important to us. We do not share your data with third parties except as necessary to provide our services or as required by law.</p>
    <ul>
      <li>We collect only essential information.</li>
      <li>Your data is stored securely.</li>
      <li>You can request deletion of your data at any time.</li>
    </ul>`,
    termsConditions: `<h2>Terms &amp; Conditions</h2>
    <ol>
      <li>All rentals require a valid driver’s license and credit card.</li>
      <li>Vehicles must be returned in the same condition as rented.</li>
      <li>Late returns may incur additional charges.</li>
      <li>By using our service, you agree to these terms.</li>
    </ol>`,
    faqs: [
        {
            question: 'How do I rent a car?',
            answer: 'Browse our selection, choose a car, and complete the booking process online.'
        },
        {
            question: 'What documents are required?',
            answer: 'A valid driver’s license and a credit card are required.'
        }
    ],
    contact: {
        phone: '+1234567890',
        email: 'info@carrental.com',
        whatsapp: '+1234567890',
        location: '123 Main Street, City, Country'
    },
    logo: 'https://i.ibb.co/z5YHLV9/profile.png'
};
function seedCMS() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if a CMS document already exists
            const existingCMS = yield cms_model_1.default.findOne({});
            if (!existingCMS) {
                // Insert seed data
                yield cms_model_1.default.create(cmsSeedData);
                logger_1.logger.info('✨ CMS data seeded successfully!');
            }
        }
        catch (error) {
            console.error('Error seeding CMS data:', error);
            process.exit(1);
        }
    });
}
