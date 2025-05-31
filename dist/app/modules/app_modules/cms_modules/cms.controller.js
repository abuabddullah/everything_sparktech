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
exports.CmsController = void 0;
const cms_service_1 = __importDefault(require("./cms.service"));
const catchAsync_1 = __importDefault(require("../../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const getFilePath_1 = require("../../../../shared/getFilePath");
exports.CmsController = {
    // // Company Overview CRUD
    getCompanyOverview: (0, catchAsync_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const companyOverview = yield cms_service_1.default.getCompanyOverview();
        (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_codes_1.StatusCodes.OK,
            message: 'CMS Retrieved successfully',
            data: companyOverview,
        });
    })),
    updateTermsConditions: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedTerms = yield cms_service_1.default.updateTermsConditionsInDB(req.body);
        (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_codes_1.StatusCodes.OK,
            message: 'Terms & Conditions updated successfully',
            data: updatedTerms,
        });
    })),
    updatePrivacyPolicy: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedPolicy = yield cms_service_1.default.updatePrivacyPolicyInDB(req.body);
        (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_codes_1.StatusCodes.OK,
            message: 'Privacy Policy updated successfully',
            data: updatedPolicy,
        });
    })),
    updateCompanyOverview: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let image = (0, getFilePath_1.getSingleFilePath)(req.files, 'image');
        let body = req.body;
        if (typeof req.body === 'string') {
            try {
                body = JSON.parse(req.body);
            }
            catch (e) {
                console.error('Invalid JSON in req.body', e);
                return res.status(400).json({ error: 'Invalid JSON in request body' });
            }
        }
        const data = Object.assign({ logo: image }, body);
        const companyOverview = yield cms_service_1.default.updateCompanyOverview(data);
        (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_codes_1.StatusCodes.OK,
            message: 'Company Overview updated successfully',
            data: data,
        });
    })),
    deleteCompanyOverview: (0, catchAsync_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield cms_service_1.default.deleteCompanyOverview();
        (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_codes_1.StatusCodes.NO_CONTENT,
            message: 'Company Overview deleted successfully',
            data: null,
        });
    })),
    // FAQ CRUD
    addFAQ: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedCompanyOverview = yield cms_service_1.default.addFAQ(req.body);
        (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_codes_1.StatusCodes.OK,
            message: 'FAQ added successfully',
            data: updatedCompanyOverview,
        });
    })),
    editFAQ: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { faqId } = req.params;
        const updatedCompanyOverview = yield cms_service_1.default.editFAQ(req.body, faqId);
        (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_codes_1.StatusCodes.OK,
            message: 'FAQ edited successfully',
            data: updatedCompanyOverview,
        });
    })),
    deleteFAQ: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { faqId } = req.params;
        const updatedCompanyOverview = yield cms_service_1.default.deleteFAQ(faqId);
        (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_codes_1.StatusCodes.OK,
            message: 'FAQ deleted successfully',
            data: updatedCompanyOverview,
        });
    })),
    getAllFAQ: (0, catchAsync_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const faqs = yield cms_service_1.default.getAllFAQFromDB();
        (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_codes_1.StatusCodes.OK,
            message: 'FAQs retrieved successfully',
            data: faqs,
        });
    })),
    // Contact CRUD
    getContact: (0, catchAsync_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const contact = yield cms_service_1.default.getContact();
        (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_codes_1.StatusCodes.OK,
            message: 'Contact retrieved successfully',
            data: contact,
        });
    })),
    updateContact: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedContact = yield cms_service_1.default.updateContact(req.body);
        (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_codes_1.StatusCodes.OK,
            message: 'Contact updated successfully',
            data: updatedContact,
        });
    })),
    // Logo CRUD
    getLogo: (0, catchAsync_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const logo = yield cms_service_1.default.getLogo();
        (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_codes_1.StatusCodes.OK,
            message: 'Logo retrieved successfully',
            data: logo,
        });
    })),
    updateLogo: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let logo = (0, getFilePath_1.getSingleFilePath)(req.files, 'image');
        const updatedLogo = yield cms_service_1.default.updateLogo(logo);
        (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_codes_1.StatusCodes.OK,
            message: 'Logo updated successfully',
            data: updatedLogo,
        });
    })),
};
