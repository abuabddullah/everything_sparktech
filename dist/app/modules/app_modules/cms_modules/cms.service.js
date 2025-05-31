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
const CMSService = {
    // Create or replace the CMS document (singleton pattern)
    getCompanyOverview: () => __awaiter(void 0, void 0, void 0, function* () {
        const cms = yield cms_model_1.default.findOne().exec();
        if (!cms)
            throw new Error("CMS not found");
        return cms;
    }),
    updateTermsConditionsInDB: (termsData) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedCms = yield cms_model_1.default.findOneAndUpdate({}, { $set: { termsConditions: termsData.termsConditions } }, { new: true }).exec();
        if (!updatedCms)
            throw new Error("Terms & Conditions not found");
        return updatedCms.termsConditions;
    }),
    updatePrivacyPolicyInDB: (policyData) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedCms = yield cms_model_1.default.findOneAndUpdate({}, { $set: { privacyPolicy: policyData.privacyPolicy } }, { new: true }).exec();
        if (!updatedCms)
            throw new Error("Privacy Policy not found");
        return updatedCms.privacyPolicy;
    }),
    updateCompanyOverview: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedCms = yield cms_model_1.default.findOneAndUpdate({}, { $set: data }, { new: true }).exec();
        if (!updatedCms)
            throw new Error("CMS not found");
        return updatedCms;
    }),
    deleteCompanyOverview: () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield cms_model_1.default.deleteMany({}).exec();
        if (result.deletedCount === 0)
            throw new Error("CMS not found");
    }),
    // FAQ CRUD
    addFAQ: (faqData) => __awaiter(void 0, void 0, void 0, function* () {
        const cms = yield cms_model_1.default.findOne().exec();
        if (!cms)
            throw new Error("CMS not found");
        cms.faqs.push(faqData);
        yield cms.save();
        return cms;
    }),
    editFAQ: (faqData, faqId) => __awaiter(void 0, void 0, void 0, function* () {
        const cms = yield cms_model_1.default.findOne().exec();
        if (!cms)
            throw new Error("CMS not found");
        const idx = cms.faqs.findIndex(f => f._id == faqId);
        if (idx === -1)
            throw new Error("FAQ not found");
        // Update only the fields except _id to avoid changing the id during patch
        Object.assign(cms.faqs[idx], Object.assign(Object.assign({}, faqData), { _id: cms.faqs[idx]._id }));
        yield cms.save();
        return cms;
    }),
    deleteFAQ: (faqId) => __awaiter(void 0, void 0, void 0, function* () {
        console.log({ faqId });
        const cms = yield cms_model_1.default.findOne().exec();
        if (!cms)
            throw new Error("CMS not found");
        const idx = cms.faqs.findIndex(f => f._id == faqId);
        console.log({ idx });
        if (idx === -1)
            throw new Error("FAQ not found");
        cms.faqs.splice(idx, 1);
        yield cms.save();
        return cms;
    }),
    getAllFAQFromDB: () => __awaiter(void 0, void 0, void 0, function* () {
        const cms = yield cms_model_1.default.findOne().exec();
        if (!cms)
            throw new Error("CMS not found");
        return cms.faqs;
    }),
    // Contact CRUD
    getContact: () => __awaiter(void 0, void 0, void 0, function* () {
        const cms = yield cms_model_1.default.findOne().exec();
        if (!cms)
            throw new Error("Contact not found");
        return cms.contact;
    }),
    updateContact: (contactData) => __awaiter(void 0, void 0, void 0, function* () {
        console.log({ contactData });
        const updatedCms = yield cms_model_1.default.findOneAndUpdate({}, { $set: { contact: contactData } }, { new: true }).exec();
        if (!updatedCms)
            throw new Error("Contact not found");
        return updatedCms.contact;
    }),
    // Logo CRUD
    getLogo: () => __awaiter(void 0, void 0, void 0, function* () {
        const cms = yield cms_model_1.default.findOne().exec();
        if (!cms)
            throw new Error("Logo not found");
        return cms.logo;
    }),
    updateLogo: (logoData) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedCms = yield cms_model_1.default.findOneAndUpdate({}, { $set: { logo: logoData } }, { new: true }).exec();
        if (!updatedCms)
            throw new Error("Logo not found");
        return updatedCms.logo;
    }),
};
exports.default = CMSService;
