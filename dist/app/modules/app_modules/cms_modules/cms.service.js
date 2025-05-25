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
const cms_model_1 = __importDefault(require("./cms.model"));
const cms_validation_1 = require("./cms.validation");
const CMSService = {
    createCompanyOverview: (data) => __awaiter(void 0, void 0, void 0, function* () {
        // Validate the data with Zod
        cms_validation_1.CompanyOverviewSchema.parse(data);
        // Create and save the company overview
        const newCompanyOverview = new cms_model_1.default(data);
        yield newCompanyOverview.save();
        return newCompanyOverview;
    }),
    getCompanyOverview: () => __awaiter(void 0, void 0, void 0, function* () {
        const companyOverview = yield cms_model_1.default.findOne().exec();
        if (!companyOverview)
            throw new Error("Company Overview not found");
        return companyOverview;
    }),
    updateCompanyOverview: (data) => __awaiter(void 0, void 0, void 0, function* () {
        // Validate the data with Zod
        cms_validation_1.CompanyOverviewSchema.parse(data);
        const updatedCompanyOverview = yield cms_model_1.default.findOneAndUpdate({}, { termsConditions: data.termsConditions }, { new: true }).exec();
        if (!updatedCompanyOverview)
            throw new Error("Company Overview not found");
        return updatedCompanyOverview;
    }),
    deleteCompanyOverview: () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield cms_model_1.default.deleteOne().exec();
        if (result.deletedCount === 0)
            throw new Error("Company Overview not found");
    }),
    addFAQ: (faqData) => __awaiter(void 0, void 0, void 0, function* () {
        cms_validation_1.FaqSchema.parse(faqData);
        const companyOverview = yield cms_model_1.default.findOne().exec();
        if (!companyOverview)
            throw new Error("Company Overview not found");
        companyOverview.termsConditions.faqs.push(faqData);
        yield companyOverview.save();
        return companyOverview;
    }),
    editFAQ: (faqData) => __awaiter(void 0, void 0, void 0, function* () {
        cms_validation_1.FaqSchema.parse(faqData);
        const companyOverview = yield cms_model_1.default.findOne().exec();
        if (!companyOverview)
            throw new Error("Company Overview not found");
        const faqIndex = companyOverview.termsConditions.faqs.findIndex((faq) => faq.question === faqData.question);
        if (faqIndex === -1)
            throw new Error("FAQ not found");
        companyOverview.termsConditions.faqs[faqIndex] = faqData;
        yield companyOverview.save();
        return companyOverview;
    }),
    deleteFAQ: (faqData) => __awaiter(void 0, void 0, void 0, function* () {
        cms_validation_1.FaqSchema.parse(faqData);
        const companyOverview = yield cms_model_1.default.findOne().exec();
        if (!companyOverview)
            throw new Error("Company Overview not found");
        const faqIndex = companyOverview.termsConditions.faqs.findIndex((faq) => faq.question === faqData.question);
        if (faqIndex === -1)
            throw new Error("FAQ not found");
        companyOverview.termsConditions.faqs.splice(faqIndex, 1);
        yield companyOverview.save();
        return companyOverview;
    }),
};
exports.default = CMSService;
