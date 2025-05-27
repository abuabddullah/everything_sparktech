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
        const unavailableSlots = isExistingVehicle.unavailable_slots || [];
        const isAvailable = !unavailableSlots.some((slot) => {
            const slotStart = new Date(slot.start);
            const slotEnd = new Date(slot.end);
            // Check if there is an overlap between the requested time period and any unavailable slot
            return (pickupDateTime < slotEnd && returnDateTime > slotStart);
        });
        if (!isAvailable) {
            throw new Error("The vehicle is unavailable for the selected time period.");
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
        // Update the vehicle's unavailable_slots field with the booking time period
        isExistingVehicle.unavailable_slots.push({
            start: bookingdata.pickupTime,
            end: bookingdata.returnTime
        });
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
    // Step 1: Aggregation Pipeline for filtering and population
    const bookings = yield booking_model_1.BookingModel.aggregate([
        // Step 2: Lookup to join the Booking model with the Client model (clientId)
        {
            $lookup: {
                from: 'clients', // Assuming 'clients' is the collection name of the Client model
                localField: 'clientId',
                foreignField: '_id',
                as: 'clientId', // Alias for the populated client data
            }
        },
        // Step 3: Unwind the clientId array to get a single object instead of an array
        {
            $unwind: '$clientId'
        },
        // Step 4: Match against the email field in the populated clientId
        {
            $match: {
                'clientId.email': searchRegex // Match the email using the regex
            }
        },
        // Step 5: Apply pagination
        {
            $skip: (Number(page) - 1) * Number(limit)
        },
        {
            $limit: Number(limit)
        },
        // Step 6: Populate other fields (pickupLocation, vehicle, etc.)
        {
            $lookup: {
                from: 'locations',
                localField: 'pickupLocation',
                foreignField: '_id',
                as: 'pickupLocation'
            }
        },
        {
            $lookup: {
                from: 'locations',
                localField: 'returnLocation',
                foreignField: '_id',
                as: 'returnLocation'
            }
        },
        {
            $lookup: {
                from: 'vehicles',
                localField: 'vehicle',
                foreignField: '_id',
                as: 'vehicle'
            }
        },
        {
            $lookup: {
                from: 'extraservices',
                localField: 'extraServices',
                foreignField: '_id',
                as: 'extraServices'
            }
        },
        {
            $lookup: {
                from: 'payments',
                localField: 'paymentId',
                foreignField: '_id',
                as: 'paymentId'
            }
        },
        // Step 7: Clean up fields (optional, to match the output format)
        {
            $project: {
                pickupLocation: 1,
                returnLocation: 1,
                vehicle: 1,
                extraServices: 1,
                clientId: 1,
                paymentId: 1
            }
        }
    ]);
    // Step 2: Count the total number of matching bookings
    const total = yield booking_model_1.BookingModel.aggregate([
        {
            $lookup: {
                from: 'clients',
                localField: 'clientId',
                foreignField: '_id',
                as: 'clientDetails',
            }
        },
        {
            $unwind: '$clientDetails'
        },
        {
            $match: {
                'clientDetails.email': searchRegex
            }
        },
        {
            $count: 'total'
        }
    ]);
    // Get the total count or fallback to 0
    const totalCount = total.length > 0 ? total[0].total : 0;
    // Step 3: Pagination metadata
    const totalPage = Math.ceil(totalCount / Number(limit));
    const meta = {
        total: totalCount,
        limit: Number(limit),
        page: Number(page),
        totalPage,
    };
    // Step 4: Return the result as a documents array, not the pipeline
    return {
        meta,
        result: bookings, // Return populated bookings as documents array
    };
});
exports.BookingService = {
    createBookingToDB,
    getAllBookingsFromDB,
    searchBookingFromDB
};
