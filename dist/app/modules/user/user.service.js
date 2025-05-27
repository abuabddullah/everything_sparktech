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
exports.UserService = void 0;
const http_status_codes_1 = require("http-status-codes");
const user_1 = require("../../../enums/user");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const emailHelper_1 = require("../../../helpers/emailHelper");
const emailTemplate_1 = require("../../../shared/emailTemplate");
const unlinkFile_1 = __importDefault(require("../../../shared/unlinkFile"));
const generateOTP_1 = __importDefault(require("../../../util/generateOTP"));
const user_model_1 = require("./user.model");
const config_1 = __importDefault(require("../../../config"));
const createUserToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    //set role
    payload.role = user_1.USER_ROLES.USER;
    const createUser = yield user_model_1.User.create(payload);
    if (!createUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create user');
    }
    //send email
    const otp = (0, generateOTP_1.default)();
    const values = {
        name: createUser.name,
        otp: otp,
        email: createUser.email,
    };
    const createAccountTemplate = emailTemplate_1.emailTemplate.createAccount(values);
    emailHelper_1.emailHelper.sendEmail(createAccountTemplate);
    //save to DB
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60000),
    };
    yield user_model_1.User.findOneAndUpdate({ _id: createUser._id }, { $set: { authentication } });
    return createUser;
});
const createTeamMemberToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    //set role
    payload.role = user_1.USER_ROLES.TEAM_MEMBER;
    payload.verified = true;
    const emailPrefix = (_a = payload.name) === null || _a === void 0 ? void 0 : _a.trim().replace(/\s+/g, ''); // Removes all spaces
    payload.email = `${emailPrefix}@${config_1.default.company.domain}`; // Ensure email is formatted correctly
    if (!payload.password) {
        payload.password = config_1.default.company.default_password; // Use default password if not provided
    }
    const createUser = yield user_model_1.User.create(payload);
    if (!createUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create user');
    }
    //send email
    const values = {
        name: createUser.name,
        email: createUser.email,
        password: createUser.password,
        designation: createUser.designation,
    };
    const createAccountTemplate = emailTemplate_1.emailTemplate.createTeamMemberAccount(values);
    emailHelper_1.emailHelper.sendEmail(createAccountTemplate);
    return createUser;
});
const createAdminToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    //set role
    payload.role = user_1.USER_ROLES.ADMIN;
    payload.verified = true;
    const createAdmin = yield user_model_1.User.create(payload); // name, user, password
    if (!createAdmin) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create user');
    }
    const values = {
        name: createAdmin.name,
        email: createAdmin.email,
        password: payload.password,
    };
    const createAccountTemplate = emailTemplate_1.emailTemplate.createAdminAccount(values);
    emailHelper_1.emailHelper.sendEmail(createAccountTemplate);
    return createAdmin;
});
const getAllAdminFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const allAdminArray = yield user_model_1.User.find({
        role: "ADMIN"
    });
    if (!allAdminArray) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Admin Not Available!");
    }
    return allAdminArray;
});
const getAnAdminFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield user_model_1.User.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    return isExistUser;
});
const deleteAnAdminFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield user_model_1.User.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    const result = yield user_model_1.User.findByIdAndDelete(id);
    return result;
});
const createDriverToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    //set role
    payload.role = user_1.USER_ROLES.DRIVER;
    payload.verified = true;
    if (!payload.password) {
        payload.password = config_1.default.company.default_password; // Use default password if not provided
    }
    const createDriver = yield user_model_1.User.create(payload); // name,dob,image,phone, email , password,licenseNumber
    if (!createDriver) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create user');
    }
    const values = {
        name: createDriver.name,
        email: createDriver.email,
        password: createDriver.password,
    };
    const createAccountTemplate = emailTemplate_1.emailTemplate.createDriverAccount(values);
    emailHelper_1.emailHelper.sendEmail(createAccountTemplate);
    return createDriver;
});
const getAllDriverFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const allDriverArray = yield user_model_1.User.find({
        role: "DRIVER"
    });
    if (!allDriverArray) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Driver Not Available!");
    }
    // const driversWithVehicles = await Promise.all(
    //   allDriverArray.map(async (user) => {
    //     const userObj = user.toObject(); // Convert to plain object
    //     if (user.role === USER_ROLES.DRIVER) {
    //       const vehicle = await user.getVehicle();
    //       return {
    //         ...userObj,
    //         vehicle, // Add vehicle info only for drivers
    //       };
    //     }
    //     return userObj;
    //   })
    // );
    return allDriverArray;
});
const getUserProfileFromDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = user;
    const isExistUser = yield user_model_1.User.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    return isExistUser;
});
const updateProfileToDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = user;
    const isExistUser = yield user_model_1.User.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    //unlink file here
    if (payload.image) {
        (0, unlinkFile_1.default)(isExistUser.image);
    }
    const updateDoc = yield user_model_1.User.findOneAndUpdate({ _id: id }, payload, {
        new: true,
    });
    return updateDoc;
});
exports.UserService = {
    createUserToDB,
    createTeamMemberToDB,
    createAdminToDB,
    getAllAdminFromDB,
    getAnAdminFromDB,
    deleteAnAdminFromDB,
    createDriverToDB,
    getAllDriverFromDB,
    getUserProfileFromDB,
    updateProfileToDB,
};
