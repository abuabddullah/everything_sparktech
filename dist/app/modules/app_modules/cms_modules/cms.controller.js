"use strict";
// const createCompanyOverview = async (req, res) => {
//   try {
//     const companyOverview = new CompanyOverview({
//       termsConditions: req.body.termsConditions
//     });
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
// Controller for creating company overview
exports.CmsController = {
    createCompanyOverview: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const companyOverview = yield cms_service_1.default.createCompanyOverview(req.body);
        res.status(201).json(companyOverview);
    })),
    getCompanyOverview: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const companyOverview = yield cms_service_1.default.getCompanyOverview();
        res.status(200).json(companyOverview);
    })),
    updateCompanyOverview: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const companyOverview = yield cms_service_1.default.updateCompanyOverview(req.body);
        res.status(200).json(companyOverview);
    })),
    deleteCompanyOverview: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield cms_service_1.default.deleteCompanyOverview();
        res.status(204).send();
    })),
    addFAQ: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedCompanyOverview = yield cms_service_1.default.addFAQ(req.body);
        res.status(200).json(updatedCompanyOverview);
    })),
    editFAQ: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedCompanyOverview = yield cms_service_1.default.editFAQ(req.body);
        res.status(200).json(updatedCompanyOverview);
    })),
    deleteFAQ: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedCompanyOverview = yield cms_service_1.default.deleteFAQ(req.body);
        res.status(200).json(updatedCompanyOverview);
    })),
};
