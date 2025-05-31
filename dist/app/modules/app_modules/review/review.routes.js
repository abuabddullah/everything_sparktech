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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRoutes = void 0;
const express_1 = __importDefault(require("express"));
const review_controller_1 = require("./review.controller");
const review_validation_1 = require("./review.validation");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../../middlewares/validateRequest"));
const user_1 = require("../../../../enums/user");
const router = express_1.default.Router();
router.get("/", review_controller_1.ReviewController.getAllReviews);
router.post("/admin", (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), (0, validateRequest_1.default)(review_validation_1.ReviewValidation.reviewByAdminZodSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { rating } = _a, othersData = __rest(_a, ["rating"]);
        req.body = Object.assign(Object.assign({}, othersData), { rating: Number(rating) });
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to convert string to number' });
    }
}), review_controller_1.ReviewController.createReiviewByAdmin);
router.post('/:clientEmail', (0, validateRequest_1.default)(review_validation_1.ReviewValidation.reviewZodSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { rating } = _a, othersData = __rest(_a, ["rating"]);
        req.body = Object.assign(Object.assign({}, othersData), { clientEmail: req.params.clientEmail, rating: Number(rating) });
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to convert string to number' });
    }
}), review_controller_1.ReviewController.createReview);
exports.ReviewRoutes = router;
