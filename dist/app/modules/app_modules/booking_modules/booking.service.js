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
exports.BookingService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const QueryBuilder_1 = __importDefault(require("../../../builder/QueryBuilder"));
const client_model_1 = require("../client_modules/client.model");
const extraService_model_1 = __importDefault(require("../extraServices_modules/extraService.model"));
const location_model_1 = require("../location_modules/location.model");
const vehicle_model_1 = require("../vehicle_modules/vehicle.model");
const booking_model_1 = require("./booking.model");
const emailTemplate_1 = require("../../../../shared/emailTemplate");
const emailHelper_1 = require("../../../../helpers/emailHelper");
const dateFormatterHelper_1 = require("../../../../helpers/dateFormatterHelper");
const user_model_1 = require("../../user/user.model");
const user_1 = require("../../../../enums/user");
const notification_constant_1 = require("../notification_modules/notification.constant");
const notificationsHelper_1 = require("../../../../helpers/notificationsHelper");
const ApiError_1 = __importDefault(require("../../../../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const createBookingToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const session = yield booking_model_1.BookingModel.startSession();
    session.startTransaction();
    try {
        /**
         *  validate and throw err for
         *  *  pickupLocation 🆗
         *  *  returnLocation 🆗
         *  *  vehicle 🆗
         *  *  extraServices 🆗
         *  *  clientId 🆗
         *  need to check the time differnces is minimum 3 hrs returnTime - pickupTime > 3 hrs 🆗
         *  pickupDate and returnDate should be in future than now 🆗
         *  ammount calculation based on the selected vehicle.dailyRate extra services its a perday rate, extra services is a fixed rate 🆗
         *  check if the car status and bookings field in vehicle model. if status is AVAILABLE for that time period or not if not then throw error 🆗
         *  set the booking info in the vehicle model and set the response to BOOKED for that time period  🆗
         *  need to send email to the client with booking details specially the refferece id = booking._id 🆗
         *  sendnotification to the admin with booking details
         */
        let bookingDataWithClient;
        let amount = 0;
        let carRentedForInDays = 0;
        let sumOfTotalRentOfCarForRentedDays = 0;
        let selectedExtraServices = [];
        let selectedExtraServicesAmount = 0;
        let { clientDetails } = payload, bookingdata = __rest(payload, ["clientDetails"]);
        // calculate returnTime & pickupTime must be in future than now and their difference should be minimum 3 hrs if true then calcualte the carRentedForInDays
        const pickupDateTime = new Date(`${bookingdata.pickupTime}`);
        const returnDateTime = new Date(`${bookingdata.returnTime}`);
        const currentTime = new Date();
        if (pickupDateTime <= currentTime || returnDateTime <= currentTime) {
            throw new Error('Pickup and return dates must be in the future');
        }
        if (returnDateTime <= pickupDateTime || (returnDateTime.getTime() - pickupDateTime.getTime()) < 3 * 60 * 60 * 1000) {
            throw new Error('Return date must be at least 3 hours after pickup date');
        }
        // validate locations is present or not then throw error
        if (!bookingdata.pickupLocation || !bookingdata.returnLocation || !bookingdata.vehicle) {
            throw new Error('Pickup location, return location, and vehicle are required');
        }
        // find pickupLocation and returnLocation and vehicle by id if exists then use that otherwise throw error
        const isExistingPickupLocation = yield location_model_1.Location.findById({ _id: bookingdata.pickupLocation }).session(session);
        const isExistingReturnLocation = yield location_model_1.Location.findById({ _id: bookingdata.returnLocation }).session(session);
        if (!isExistingPickupLocation || !isExistingReturnLocation) {
            throw new Error('Invalid booking data');
        }
        // check if the car status and bookings field in vehicle model. if status is AVAILABLE for that time period or not if not then throw error
        // Fetch the vehicle document
        const isExistingVehicle = yield vehicle_model_1.Vehicle.findById({ _id: bookingdata.vehicle }).session(session);
        // Check if vehicle exists
        if (!isExistingVehicle) {
            throw new Error("Vehicle not found");
        }
        // Check if the vehicle is available during the requested time period
        /**
         * get the bookings of  the vehicle for this specific isExistingVehicle
         * check and ensure pickupDateTime and returnDateTime doesn't overlap with these booked bookings
         */
        const existingBookings = yield booking_model_1.BookingModel.find({
            vehicle: isExistingVehicle._id,
            $or: [
                { pickupTime: { $gte: pickupDateTime, $lt: returnDateTime } }, // Pickup is during an existing booking
                { returnTime: { $gt: pickupDateTime, $lte: returnDateTime } }, // Return is during an existing booking
                {
                    pickupTime: { $lt: pickupDateTime }, // Entire booking is before the requested time
                    returnTime: { $gt: returnDateTime } // Entire booking is after the requested time
                }
            ]
        }).session(session);
        // Check if any existing booking overlaps with the requested time period
        if (existingBookings.length > 0) {
            throw new Error("Vehicle is already booked during the requested time period");
        }
        //need to check if all the selected extra services are valid or not if valid then calculate the amount and update selectedExtraServicesAmount
        if (((_a = payload === null || payload === void 0 ? void 0 : payload.extraServices) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            // Ensure that extraServicesIds are converted to ObjectIds
            const objectIds = payload.extraServices.map(id => new mongoose_1.default.Types.ObjectId(id));
            // Query the Service collection for all services whose providerId is in the array
            selectedExtraServices = yield extraService_model_1.default.find({ _id: { $in: objectIds } });
            // Check if the number of services found matches the number of extraServicesIds
            if (selectedExtraServices.length !== payload.extraServices.length) {
                // Throw an error with the missing extraServicesIds
                throw new Error(`The Services were not found in the database`);
            }
            // Calculate the total cost of selected services
            selectedExtraServicesAmount = selectedExtraServices.reduce((total, service) => total + (service.cost || 0), 0);
        }
        //Calculate the number of days the car is rented for
        carRentedForInDays = Math.ceil((returnDateTime.getTime() - pickupDateTime.getTime()) / (1000 * 60 * 60 * 24));
        // Calculate the vehicleRentAmount based on the vehicle's daily rate 
        sumOfTotalRentOfCarForRentedDays = isExistingVehicle.dailyRate * carRentedForInDays;
        // total ammount for the booking
        amount = sumOfTotalRentOfCarForRentedDays + selectedExtraServicesAmount;
        // validate clientDetails is present or not then throw error
        if (!clientDetails || !clientDetails.firstName || !clientDetails.lastName || !clientDetails.email || !clientDetails.phone) {
            throw new Error('Client details are incomplete');
        }
        // find client by email  if exists then use that client otherwise create new client
        const existingClient = yield client_model_1.ClientModel.findOne({ email: clientDetails.email }).session(session);
        if (existingClient) {
            // bookingdata.clientId = existingClient._id; // Assign existing client ID to booking data
            bookingDataWithClient = Object.assign(Object.assign({}, bookingdata), { amount,
                carRentedForInDays, clientId: existingClient._id });
        }
        else {
            // create client in Client model
            const client = yield client_model_1.ClientModel.create([clientDetails], { session });
            if (!client || client.length === 0) {
                throw new Error('Failed to create client');
            }
            // Use the created client document
            const createdClient = client[0];
            if (!client) {
                throw new Error('Failed to create client');
            }
            bookingDataWithClient = Object.assign(Object.assign({}, bookingdata), { amount,
                carRentedForInDays, clientId: createdClient._id });
        }
        const createdBooking = yield booking_model_1.BookingModel.create([bookingDataWithClient], { session });
        if (!createdBooking || createdBooking.length === 0) {
            throw new Error('Failed to create booking');
        }
        // Update the vehicle's bookings field with this created booking id
        isExistingVehicle.bookings.push(createdBooking[0]._id);
        // save the isExistingVehicle with session
        yield isExistingVehicle.save({ session });
        // need to send email to the client email with booking details specially the refferece id = booking._id
        const values = {
            name: `${clientDetails.firstName} ${clientDetails.lastName}`,
            email: clientDetails.email,
            phone: clientDetails.phone,
            pickupLocation: isExistingPickupLocation.location,
            returnLocation: isExistingReturnLocation.location,
            vehicle: isExistingVehicle.name,
            pickupTime: (0, dateFormatterHelper_1.convertToReadableDate)(bookingdata.pickupTime),
            returnTime: (0, dateFormatterHelper_1.convertToReadableDate)(bookingdata.returnTime),
            amount: amount.toFixed(2),
            bookingId: createdBooking[0]._id.toString(),
        };
        const confirmBookingEmailTemplate = emailTemplate_1.emailTemplate.confirmBookingEmail(values);
        emailHelper_1.emailHelper.sendEmail(confirmBookingEmailTemplate);
        // send notification to the admins with booking details
        // get all the admin users from the database
        const adminUsers = yield user_model_1.User.find({ role: { $in: [user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN] } }).session(session);
        const adminUserIds = adminUsers.map(user => user._id);
        // create notification data
        const notificationData = {
            text: `New booking created by ${clientDetails.firstName} ${clientDetails.lastName} for vehicle ${isExistingVehicle.name}. Booking ID: ${createdBooking[0]._id}`,
            receiver: adminUserIds, // Send to all admin users
            read: false,
            referenceId: createdBooking[0]._id.toString(),
            category: notification_constant_1.NOTIFICATION_CATEGORIES.RESERVATION,
            type: notification_constant_1.NOTIFICATION_TYPE.ADMIN,
        };
        (0, notificationsHelper_1.sendNotifications)(notificationData);
        yield session.commitTransaction();
        session.endSession();
        return createdBooking[0];
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const getAllBookingsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const bookingQuery = booking_model_1.BookingModel.find()
        .populate([
        { path: 'pickupLocation' },
        { path: 'returnLocation' },
        { path: 'vehicle' },
        { path: 'extraServices' },
        { path: 'clientId' },
        { path: 'paymentId' }
    ]);
    const queryBuilder = new QueryBuilder_1.default(bookingQuery, query)
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield queryBuilder.modelQuery;
    const meta = yield queryBuilder.getPaginationInfo();
    return {
        meta,
        result,
    };
});
const searchBookingFromDB = (_a) => __awaiter(void 0, [_a], void 0, function* ({ searchTerm, limit = 10, page = 1 }) {
    // Create the case-insensitive regex for searching
    const searchRegex = new RegExp(searchTerm, 'i');
    // Step 1: Find client IDs matching the email search
    const matchingClients = yield client_model_1.ClientModel.find({ email: searchRegex }).select('_id');
    const matchingClientIds = matchingClients.map(client => client._id);
    // Step 2: Find bookings with those client IDs
    const bookings = yield booking_model_1.BookingModel.find({ clientId: { $in: matchingClientIds } })
        .populate({
        path: 'clientId',
        select: 'email firstName',
    })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .populate('pickupLocation')
        .populate('returnLocation')
        .populate('vehicle')
        .populate('extraServices')
        .populate('paymentId')
        .select('pickupLocation returnLocation vehicle extraServices clientId paymentId');
    // Step 3: Count total matching bookings
    const totalCount = yield booking_model_1.BookingModel.countDocuments({ clientId: { $in: matchingClientIds } });
    // Step 4: Pagination metadata
    const totalPage = Math.ceil(totalCount / Number(limit));
    const meta = {
        total: totalCount,
        limit: Number(limit),
        page: Number(page),
        totalPage,
    };
    // Step 5: Return the result as an object with metadata
    return {
        meta,
        result: bookings,
    };
});
const deleteBookingFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Start a session for the transaction
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // Find the booking
        const isExistBooking = yield booking_model_1.BookingModel.findById(id).session(session);
        if (!isExistBooking) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Booking doesn't exist!");
        }
        // 1. Find the vehicle and remove the booking from the vehicle's bookings array
        const isExistVehicle = yield vehicle_model_1.Vehicle.findById(isExistBooking.vehicle).session(session);
        console.log(isExistVehicle);
        if (!isExistVehicle) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Vehicle not found");
        }
        const bookingIndex = isExistVehicle.bookings.indexOf(isExistBooking._id);
        if (bookingIndex !== -1) {
            // Remove the booking ID from the bookings array
            isExistVehicle.bookings.splice(bookingIndex, 1);
            // Save the updated vehicle document
            yield isExistVehicle.save({ session });
        }
        else {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Booking not found in vehicle's bookings array");
        }
        // 3. Delete the booking from the BookingModel
        yield booking_model_1.BookingModel.findByIdAndDelete(id).session(session);
        // Commit the transaction if all operations succeed
        yield session.commitTransaction();
        return { message: 'Booking deleted successfully' };
    }
    catch (error) {
        // If any error occurs, abort the transaction to revert all changes
        yield session.abortTransaction();
        throw error; // Re-throw the error to be handled elsewhere
    }
    finally {
        // End the session
        session.endSession();
    }
});
exports.BookingService = {
    createBookingToDB,
    getAllBookingsFromDB,
    searchBookingFromDB,
    deleteBookingFromDB
};
