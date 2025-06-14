import mongoose from "mongoose";
import QueryBuilder from "../../../builder/QueryBuilder";
import { ClientModel } from "../client_modules/client.model";
import { ClientService } from "../client_modules/client.service";
import { IExtraService } from "../extraServices_modules/extraService.interface";
import ExtraServiceModel from "../extraServices_modules/extraService.model";
import { ExtraService } from "../extraServices_modules/ExtraService.service";
import { Location } from "../location_modules/location.model";
import { Vehicle } from "../vehicle_modules/vehicle.model";
import { BookingSearchableNestedFields } from "./booking.constant";
import { IBooking, IBookingRequestBody, ISearchBookingParams } from "./booking.interface";
import { BookingModel } from "./booking.model";
import { emailTemplate } from "../../../../shared/emailTemplate";
import { emailHelper } from "../../../../helpers/emailHelper";
import { IConfirmBookingEmail } from "../../../../types/emailTamplate";
import { convertToReadableDate } from "../../../../helpers/dateFormatterHelper";
import { User } from "../../user/user.model";
import { USER_ROLES } from "../../../../enums/user";
import { NOTIFICATION_CATEGORIES, NOTIFICATION_TYPE } from "../notification_modules/notification.constant";
import { sendNotifications } from "../../../../helpers/notificationsHelper";
import ApiError from "../../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { IUser } from "../../user/user.interface";
import { BOOKING_PAYMENT_METHOD, BOOKING_STATUS } from "../../../../enums/booking";
import stripe from "../../../../config/stripe.config";
import config from "../../../../config";
import { paymentService } from "../payment/payment.service";
import { PaymentModel } from "../payment/payment.model";
import { VEHICLE_TYPES } from "../../../../enums/vehicle";



const createBookingToDB = async (payload: Partial<IBookingRequestBody>) => {
    const session = await BookingModel.startSession();
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
        let selectedExtraServicesAmount = 0;
        let { clientDetails, ...bookingdata } = payload;

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

        const isExistingPickupLocation = await Location.findById({ _id: bookingdata.pickupLocation }).session(session);
        const isExistingReturnLocation = await Location.findById({ _id: bookingdata.returnLocation }).session(session);

        if (!isExistingPickupLocation || !isExistingReturnLocation) {
            throw new Error('Invalid booking data');
        }
        // check if the car status and bookings field in vehicle model. if status is AVAILABLE for that time period or not if not then throw error
        let isExistingVehicle;
        if (
            typeof bookingdata.vehicle === 'object' &&
            bookingdata.vehicle !== null &&
            'vehicleId' in bookingdata.vehicle
        ) {
            isExistingVehicle = await Vehicle.findById({ _id: bookingdata.vehicle.vehicleId }).session(session);
        } else {
            isExistingVehicle = await Vehicle.findById({ _id: bookingdata.vehicle }).session(session);
        }

        // Check if vehicle exists
        if (!isExistingVehicle) {
            throw new Error("Vehicle not found");
        }

        // Check if the vehicle is available during the requested time period
        /**
         * get the bookings of  the vehicle for this specific isExistingVehicle
         * check and ensure pickupDateTime and returnDateTime doesn't overlap with these booked bookings
         */

        const existingBookings = await BookingModel.find({
            vehicle: isExistingVehicle._id,
            $or: [
                { pickupTime: { $gte: pickupDateTime, $lt: returnDateTime } },  // Pickup is during an existing booking
                { returnTime: { $gt: pickupDateTime, $lte: returnDateTime } },   // Return is during an existing booking
                {
                    pickupTime: { $lt: pickupDateTime },  // Entire booking is before the requested time
                    returnTime: { $gt: returnDateTime }   // Entire booking is after the requested time
                }
            ]
        }).session(session);

        // Check if any existing booking overlaps with the requested time period
        if (existingBookings.length > 0) {
            throw new Error("Vehicle is already booked during the requested time period");
        }

        //need to check if all the selected extra services are valid or not if valid then calculate the amount and update selectedExtraServicesAmount

        if (payload?.extraServices && payload?.extraServices!?.length > 0) {
            // Step 1: Extract serviceId and quantity from the payload
            const serviceDetails = payload.extraServices.map((extraService) => ({
                serviceId: new mongoose.Types.ObjectId(extraService.serviceId),
                quantity: extraService.quantity || 1,  // Default quantity to 1 if not provided
            }));

            // Step 2: Query the ExtraService collection to retrieve the extra services by their serviceId
            const extraServiceIds = serviceDetails.map((service) => service.serviceId);
            const selectedExtraServices = await ExtraServiceModel.find({ _id: { $in: extraServiceIds } });

            // Step 3: Check if the selected extra services match the input serviceIds
            if (selectedExtraServices.length !== serviceDetails.length) {
                throw new Error('Some of the selected extra services were not found in the database');
            }

            // Step 4: Calculate the total cost of the selected extra services
            selectedExtraServices.forEach((service, index) => {
                const serviceDetail = serviceDetails[index];

                // Ensure that the service has a valid cost and quantity
                const serviceAmount = (service.cost || 0) * serviceDetail.quantity; // Multiply cost by quantity
                selectedExtraServicesAmount += serviceAmount; // Add to total cost
            });


            // // Ensure that extraServicesIds are converted to ObjectIds
            // const objectIds = payload.extraServices!.map(id => new mongoose.Types.ObjectId(id));

            // // Query the Service collection for all services whose providerId is in the array
            // selectedExtraServices = await ExtraServiceModel.find({ _id: { $in: objectIds } });

            // // Check if the number of services found matches the number of extraServicesIds
            // if (selectedExtraServices.length !== payload.extraServices!.length) {
            //     // Throw an error with the missing extraServicesIds
            //     throw new Error(`The Services were not found in the database`);
            // }

            // // Calculate the total cost of selected services
            // selectedExtraServicesAmount = selectedExtraServices.reduce((total: number, service: IExtraService) => total + (service.cost || 0), 0);
        }

        //Calculate the number of days the car is rented for
        carRentedForInDays = Math.ceil((returnDateTime.getTime() - pickupDateTime.getTime()) / (1000 * 60 * 60 * 24));

        // Calculate the vehicleRentAmount based on the vehicle's daily rate 
        if (
            typeof bookingdata.vehicle === 'object' &&
            bookingdata.vehicle !== null &&
            'vehicleId' in bookingdata.vehicle
        ) {
            if ('vehicleType' in bookingdata.vehicle) {
                // Check if the provided vehicleType matches one of the allowed VEHICLE_TYPES
                if (!Object.values(VEHICLE_TYPES).includes(bookingdata.vehicle.vehicleType)) {
                    throw new Error('Invalid vehicle type selected');
                }
            }
            sumOfTotalRentOfCarForRentedDays = Number(bookingdata?.vehicle?.rate!) * carRentedForInDays
        } else {
            sumOfTotalRentOfCarForRentedDays = isExistingVehicle.dailyRate * carRentedForInDays
        }


        // total ammount for the booking
        amount = sumOfTotalRentOfCarForRentedDays + selectedExtraServicesAmount


        // validate clientDetails is present or not then throw error
        if (!clientDetails || !clientDetails.firstName || !clientDetails.lastName || !clientDetails.email || !clientDetails.phone) {
            throw new Error('Client details are incomplete');
        }
        // find client by email  if exists then use that client otherwise create new client
        let thisClient;
        thisClient = await ClientModel.findOne({ email: clientDetails.email }).session(session);
        if (thisClient) {
            let existingClientBookings = await BookingModel.find({
                clientId: thisClient._id,
                $or: [
                    { pickupTime: { $gte: pickupDateTime, $lt: returnDateTime } },
                    { returnTime: { $gte: pickupDateTime, $lt: returnDateTime } }
                ]
            }).session(session);

            if (existingClientBookings.length > 0) {
                // If the client has a booking with an unpaid status, delete it
                for (let booking of existingClientBookings) {
                    if (!booking.isPaid) {
                        throw new ApiError(StatusCodes.BAD_REQUEST, `You already have an inpaid booking in the same slot at '${booking._id}' so contact with the admin`)
                    }
                }
            }
            bookingDataWithClient = {
                ...bookingdata,
                amount,
                carRentedForInDays,
                clientId: thisClient._id, // Assign the existing client ID to booking data
                // Handle vehicleType if present in bookingdata.vehicle
                ...(typeof bookingdata.vehicle === 'object' && bookingdata.vehicle !== null && 'vehicleId' in bookingdata.vehicle && 'vehicleType' in bookingdata.vehicle
                    ? { vehicle: bookingdata.vehicle.vehicleId, vehicleType: bookingdata.vehicle.vehicleType }
                    : {}),
            };
        } else {
            // create client in Client model
            const client = await ClientModel.create([clientDetails], { session });
            if (!client || client.length === 0) {
                throw new Error('Failed to create client');
            }
            // Use the created client document
            thisClient = client[0];
            if (!client) {
                throw new Error('Failed to create client');
            }
            bookingDataWithClient = {
                ...bookingdata,
                amount,
                carRentedForInDays,
                clientId: thisClient._id, // Assign the existing client ID to booking data
                // Handle vehicleType if present in bookingdata.vehicle
                ...(typeof bookingdata.vehicle === 'object' && bookingdata.vehicle !== null && 'vehicleId' in bookingdata.vehicle && 'vehicleType' in bookingdata.vehicle
                    ? { vehicle: bookingdata.vehicle.vehicleId, vehicleType: bookingdata.vehicle.vehicleType }
                    : {}),
            };
        }
        const createdBooking = await BookingModel.create([bookingDataWithClient], { session });

        if (!createdBooking || createdBooking.length === 0) {
            throw new Error('Failed to create booking');
        }


        // Update the vehicle's bookings field with this created booking id
        isExistingVehicle.bookings.push(createdBooking[0]._id);
        // save the isExistingVehicle with session
        await isExistingVehicle.save({ session });

        // Update the client's bookings field with this created booking id
        thisClient?.bookings?.push(createdBooking[0]._id as mongoose.Types.ObjectId);

        // check if client already has stripe account or need to be created and saved
        let stripeCustomerId = thisClient?.stripeCustomerId;
        let stripeCustomer;

        if (stripeCustomerId) {
            try {
                // Attempt to retrieve the Stripe customer
                stripeCustomer = await stripe.customers.retrieve(stripeCustomerId);

                // Check if the customer exists
                if (!stripeCustomer || stripeCustomer.deleted) {
                    throw new Error(`Customer with ID ${stripeCustomerId} no longer exists.`);
                }

                // If customer exists, proceed with your logic
                console.log('Customer retrieved:', stripeCustomer);

            } catch (error: any) {
                // Log detailed error for debugging
                console.error('Stripe Error:', error.message);
                console.error('Error details:', error); // Log full error object

                if (error.code === 'resource_missing') {
                    console.log(`No such customer: ${stripeCustomerId}`);
                    // Proceed to create a new customer
                } else {
                    // Handle other errors
                    throw new ApiError(
                        StatusCodes.INTERNAL_SERVER_ERROR,
                        'Failed to retrieve Stripe customer',
                    );
                }
            }
        }

        if (!stripeCustomerId) {
            try {
                // Create a new Stripe customer if it doesn't exist
                stripeCustomer = await stripe.customers.create({
                    email: thisClient!.email,
                    name: `${thisClient?.firstName} ${thisClient?.lastName}`,
                });

                stripeCustomerId = stripeCustomer?.id;
                console.log('New customer created:', stripeCustomer);

            } catch (error: any) {
                // Log error when creating customer
                console.error('Stripe Error:', error.message);
                console.error('Error details:', error); // Log full error

                throw new ApiError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    'Failed to create Stripe customer',
                );
            }
        }


        thisClient!.stripeCustomerId = stripeCustomerId;
        await thisClient.save({ session });

        // need to send email to the client email with booking details specially the refferece id = booking._id
        const values: IConfirmBookingEmail = {
            name: `${clientDetails.firstName} ${clientDetails.lastName}`,
            email: clientDetails.email,
            phone: clientDetails.phone,
            pickupLocation: isExistingPickupLocation.location,
            returnLocation: isExistingReturnLocation.location,
            vehicle: isExistingVehicle.name,
            pickupTime: convertToReadableDate(bookingdata.pickupTime!),
            returnTime: convertToReadableDate(bookingdata.returnTime!),
            amount: amount.toFixed(2),
            bookingId: (createdBooking[0] as IBooking & { _id: mongoose.Types.ObjectId })._id.toString(),
        }
        const confirmBookingEmailTemplate = emailTemplate.confirmBookingEmail(values);
        emailHelper.sendEmail(confirmBookingEmailTemplate);

        // create payment
        const newPayment = await PaymentModel.create([
            {
                bookingId: (createdBooking[0] as IBooking & { _id: mongoose.Types.ObjectId })._id.toString(),
                vehicleId: isExistingVehicle._id.toString(),
                clientId: thisClient._id.toString(),
                amount: amount.toFixed(2),
                stripeCustomerId: stripeCustomerId,
                paymentMethod: bookingDataWithClient.paymentMethod
            }
        ], { session });

        if (!newPayment || newPayment.length === 0) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create payment for booking');
        }

        createdBooking[0].paymentId = newPayment[0]._id as mongoose.Types.ObjectId;
        await createdBooking[0].save({ session });

        // do the session creation acitivity if bookingdata.paymentmethod = STRIPE
        if (bookingdata.paymentMethod == BOOKING_PAYMENT_METHOD.STRIPE) {
            const stripeSession = await stripe.checkout.sessions.create({
                mode: 'payment',
                customer: stripeCustomer?.id,
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'Amount',
                            },
                            unit_amount: Math.round(amount * 100),
                        },
                        quantity: 1,
                    },
                ],
                metadata: {
                    bookingId: (createdBooking[0] as IBooking & { _id: mongoose.Types.ObjectId })._id.toString(),
                },
                success_url: `${config.stripe.success_url}?bookingId=${createdBooking[0]?._id}`,
                cancel_url: `${config.stripe.cancel_url}?bookingId=${createdBooking[0]?._id}`,
            });
            console.log({
                url: stripeSession.url,
            });

            await session.commitTransaction();
            session.endSession();
            return {
                url: stripeSession.url,
            };
        }

        // send notification to the admins with booking details
        // get all the admin users from the database
        const adminUsers = await User.find({ role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] } }).session(session);
        const adminUserIds = adminUsers.map(user => user._id);
        // create notification data
        const notificationData = {
            text: `New booking created by ${clientDetails.firstName} ${clientDetails.lastName} for vehicle ${isExistingVehicle.name}. Booking ID: ${createdBooking[0]._id}`,
            receiver: adminUserIds, // Send to all admin users
            read: false,
            referenceId: (createdBooking[0] as IBooking & { _id: mongoose.Types.ObjectId })._id.toString(),
            category: NOTIFICATION_CATEGORIES.RESERVATION,
            type: NOTIFICATION_TYPE.ADMIN,
        };
        sendNotifications(notificationData);

        await session.commitTransaction();
        session.endSession();
        const resposnseStructure = {
            booking: createdBooking[0],
            payment: newPayment[0],
            url: `${config.frontend_url}/reservationdetails?bookingId=${createdBooking[0]?._id}&email=${clientDetails.email}`,
        }
        return { ...resposnseStructure };

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};



const getAllBookingsFromDB = async (query: Record<string, unknown>) => {
    const bookingQuery = new QueryBuilder(
        BookingModel.find()
            .populate({
                path: 'returnLocation',
                select: 'location'
            })
            .populate({
                path: 'pickupLocation',
                select: 'location'
            })
            .populate({
                path: 'driverId',
                select: 'name'
            })
            .populate({
                path: 'clientId',
                select: 'firstName lastName email'
            })
            .populate({
                path: 'vehicle',
                select: 'name'
            }),
        query
    )
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await bookingQuery.modelQuery;
    const meta = await bookingQuery.getPaginationInfo();

    return {
        meta,
        result,
    };
};


const searchBookingFromDB = async ({ searchTerm, limit = 10, page = 1 }: ISearchBookingParams) => {
    // Create the case-insensitive regex for searching
    const searchRegex = new RegExp(searchTerm, 'i');

    // Step 1: Find client IDs matching the email search
    const matchingClients = await ClientModel.find({ email: searchRegex }).select('_id');
    const matchingClientIds = matchingClients.map(client => client._id);

    // Step 2: Find bookings with those client IDs
    const bookings = await BookingModel.find({ clientId: { $in: matchingClientIds } })
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
    const totalCount = await BookingModel.countDocuments({ clientId: { $in: matchingClientIds } });

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
};


const deleteBookingFromDB = async (
    id: string
): Promise<unknown> => {
    // Start a session for the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find the booking
        const isExistBooking = await BookingModel.findById(id).session(session);
        if (!isExistBooking) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Booking doesn't exist!");
        }

        // 1. Find the vehicle and remove the booking from the vehicle's bookings array
        const isExistVehicle = await Vehicle.findById(isExistBooking.vehicle).session(session);
        if (isExistVehicle) {
            const bookingIndex = isExistVehicle.bookings.indexOf(isExistBooking._id);

            if (bookingIndex !== -1) {
                // Remove the booking ID from the bookings array
                isExistVehicle.bookings.splice(bookingIndex, 1);

                // Save the updated vehicle document
                await isExistVehicle.save({ session });
            }
        }

        // 2. Find the client and remove the booking from the client's bookings array
        const isExistClient = await ClientModel.findById(isExistBooking.clientId).session(session);
        if (isExistClient) {
            if (!isExistClient.bookings) {
                isExistClient.bookings = [];
            }
            const clientBookingIndex = isExistClient.bookings.indexOf(isExistBooking._id as mongoose.Types.ObjectId);

            if (clientBookingIndex !== -1) {
                await ClientModel.updateOne(
                    { _id: isExistBooking.clientId },
                    { $pull: { bookings: isExistBooking._id } },
                    { session }
                );
                // Remove the booking ID from the client's bookings array
                isExistClient.bookings.splice(clientBookingIndex, 1);

                // Save the updated client document
                await isExistClient.save({ session });
            }

        }

        if (isExistBooking.driverId) {
            // 3. Find the vehicle and remove the booking from the vehicle's bookings array
            const isExistDriver = await User.findById(isExistBooking.driverId).session(session);
            if (!isExistDriver) {
                throw new ApiError(StatusCodes.NOT_FOUND, "Vehicle not found");
            }

            const driverBookingIndex = isExistDriver.bookings.indexOf(isExistBooking._id);

            if (driverBookingIndex !== -1) {

                await User.updateOne(
                    { _id: isExistBooking.driverId },
                    { $pull: { bookings: isExistBooking._id } },
                    { session }
                );
                // // Remove the booking ID from the bookings array
                // isExistDriver.bookings.splice(driverBookingIndex, 1);

                // // Save the updated vehicle document
                // await isExistDriver.save({ session });
            } else {
                throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found in vehicle's bookings array");
            }
        }



        // 3. Delete the booking from the BookingModel
        await BookingModel.findByIdAndDelete(id).session(session);

        // Commit the transaction if all operations succeed
        await session.commitTransaction();
        return { message: 'Booking deleted successfully' };

    } catch (error) {
        // If any error occurs, abort the transaction to revert all changes
        await session.abortTransaction();
        throw error;  // Re-throw the error to be handled elsewhere
    } finally {
        // End the session
        session.endSession();
    }
};

const getABookingByEmailAndIDFromDB = async (clientEmail: string, bookingId: string) => {
    console.log({ clientEmail, bookingId })
    // Find the client by email
    const client = await ClientModel.findOne({ email: clientEmail });
    if (!client) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Client not found");
    }

    // Find the booking by id and clientId
    const booking = await BookingModel.findOne({
        _id: bookingId,
        clientId: client._id,
    })
        .populate('pickupLocation')
        .populate('returnLocation')
        .populate('vehicle')
        .populate('extraServices')
        .populate('clientId')
        .populate('paymentId');

    if (!booking) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found for this client");
    }

    return booking;
};


/**
 * if same driver is being assigned for same booking then thrwor eerror alreads same driver assigned
 * the logic is the driver can be assigned to any booking if he is free(he is not assgined to any booking on that booking time it we can find in booking model by query) but if any new booking overlap then we will check the booking status if status is "on_ride" or "cancelled"  he can't be assigned but status is "not_confirmed" or "confirmed" or "COMPLETED" its possible to assign
 */


const assignDriverToBooking = async (driverId: string, bookingId: string) => {
    // Start a session for the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find the booking by ID
        const booking = await BookingModel.findById(bookingId).session(session);
        if (!booking) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
        }

        const driver = await User.findById(driverId).session(session) as IUser | null;
        if (!driver) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Driver not found");
        }

        // Check if the driver is already assigned to the booking
        if (booking.driverId && booking.driverId.toString() === driverId) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Driver is already assigned to this booking");
        }

        // Get current time
        const now = new Date();

        const driverBookings = await BookingModel.find({
            driverId: driver._id,
            pickupTime: { $gte: now }
        }).select('pickupTime returnTime status driverId').session(session);

        // Check for overlapping bookings
        const newPickup = new Date(booking.pickupTime);
        const newReturn = new Date(booking.returnTime);

        const hasOverlap = driverBookings.some(existing => {
            const existingPickup = new Date(existing.pickupTime);
            const existingReturn = new Date(existing.returnTime);

            // Check if there is an overlap (A starts before B ends, and A ends after B starts)
            const overlapCondition = (newPickup < existingReturn) && (newReturn > existingPickup);

            // If there's an overlap, check the status
            if (overlapCondition) {
                const status = existing.status;
                // Allow assignment only if the status is "not_confirmed", "confirmed", or "completed"
                if ([BOOKING_STATUS.ON_RIDE, BOOKING_STATUS.CANCELLED].includes(status as BOOKING_STATUS)) {
                    return true;
                }
            }
            return false;
        });

        if (hasOverlap) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Driver already has a booking during this time period");
        }

        await User.updateOne(
            { _id: driverId },
            { $push: { bookings: booking._id } },
            { session }
        );


        // Assign the driver to the booking
        booking.driverId = driver._id as mongoose.Types.ObjectId;
        booking.status = BOOKING_STATUS.CONFIRMED;
        await booking.save({ session });

        await session.commitTransaction();
        session.endSession();

        return booking;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

/**
 update status is possible if only 
 present status is NOT_CONFIRMED THEN POSSIBLE CONFIRMED | CANCELLED ONLY
                   CONFIRMED AND NO DRIVERID ASSIGNED YET     (THROW ERROR SYING ASSING DRIVER)
                   ON_RIDE       THEN POSSIBLE COMPLETED             ONLY
                   COMPLETED     THEN NOTHING IS POSSIBLE            ONLY
 */
const updateBookingStatusInDB = async (id: string, status: BOOKING_STATUS) => {
    const booking = await BookingModel.findById(id);
    if (!booking) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
    }

    switch (booking.status) {
        case BOOKING_STATUS.NOT_CONFIRMED:
            if (status === BOOKING_STATUS.CONFIRMED || status === BOOKING_STATUS.CANCELLED) {
                booking.status = status;
            } else {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Status can only be updated to CONFIRMED or CANCELLED from NOT_CONFIRMED");
            }
            break;
        case BOOKING_STATUS.CONFIRMED:
            if (!booking.driverId) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Assign driver before updating status from CONFIRMED");
            }
            if (status === BOOKING_STATUS.ON_RIDE) {
                booking.status = status;
            } else {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Status can only be updated to ON_RIDE from CONFIRMED");
            }
            break;
        case BOOKING_STATUS.ON_RIDE:
            if (status === BOOKING_STATUS.COMPLETED) {
                booking.status = status;
            } else {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Status can only be updated to COMPLETED from ON_RIDE");
            }
            break;
        case BOOKING_STATUS.COMPLETED:
            throw new ApiError(StatusCodes.BAD_REQUEST, "No further status updates allowed after COMPLETED");
        case BOOKING_STATUS.CANCELLED:
            throw new ApiError(StatusCodes.BAD_REQUEST, "No further status updates allowed after CANCELLED");
        default:
            throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid current booking status");
    }

    await booking.save();
    return booking;
};

const getABookingByIDFromDB = async (bookingId: string) => {
    const booking = await BookingModel.findById(bookingId)
        .populate('pickupLocation')
        .populate('returnLocation')
        .populate('vehicle')
        .populate('extraServices')
        .populate('clientId')
        .populate('paymentId');

    if (!booking) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
    }

    return booking;
};


const getBookingByDriverIDFromDB = async (driverId: string) => {
    const bookings = await BookingModel.find({ driverId })
        // .populate('pickupLocation')
        // .populate('returnLocation')
        // .populate('vehicle')
        // .populate('extraServices')
        // .populate('clientId')
        // .populate('paymentId')
        .sort({ pickupTime: -1 }) // Newest to oldest by pickupTime
        .select('pickupTime returnTime status driverId returnLocation pickupLocation');

    return bookings;
};

const updateBookingIsPaid = async (bookingId: string, isPaid: boolean) => {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
    }
    booking.isPaid = isPaid;
    await booking.save();
    return booking;
};


export const BookingService = {
    createBookingToDB,
    getAllBookingsFromDB,
    searchBookingFromDB,
    deleteBookingFromDB,
    getABookingByEmailAndIDFromDB,
    assignDriverToBooking,
    updateBookingStatusInDB,
    getABookingByIDFromDB,
    getBookingByDriverIDFromDB, updateBookingIsPaid
};