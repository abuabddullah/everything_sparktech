import QueryBuilder from "../../../builder/QueryBuilder";
import { ClientModel } from "../client_modules/client.model";
import { ClientService } from "../client_modules/client.service";
import ExtraServiceModel from "../extraServices_modules/extraService.model";
import { ExtraService } from "../extraServices_modules/ExtraService.service";
import { Location } from "../location_modules/location.model";
import { Vehicle } from "../vehicle_modules/vehicle.model";
import { BookingSearchableNestedFields } from "./booking.constant";
import { IBooking, IBookingRequestBody } from "./booking.interface";
import { BookingModel } from "./booking.model";

const createBookingToDB = async (payload: Partial<IBookingRequestBody>) => {
    const session = await BookingModel.startSession();
    session.startTransaction();
    try {

        let bookingDataWithClient;
        let amount = 0;
        let carRentedForInDays = 0;
        let extraServicesAmount = 0;
        let { clientDetails, ...bookingdata } = payload;
        /**
         *  validate and throw err for
         *  *  pickupLocation
         *  *  returnLocation
         *  *  vehicle
         *  *  extraServices
         *  *  clientId
         *  need to check the time differnces is minimum 3 hrs returnTime - pickupTime > 3 hrs
         *  pickupDate and returnDate should be in future than now
         *  ammount calculation based on the selected vehicle.dailyRate its a perday rate, extra services is a fixed rate
         *  need to send email to the client with booking details specially the refferece id = booking._id
         *  amount calculation based on the selected vehicle, extra services
         */
        // calculate and returnDate+returnTime ; pickupDate+pickupTime must be in future than now and their difference should be minimum 3 hrs if true then calcualte the carRentedForInDays
        const pickupDateTime = new Date(`${bookingdata.pickupDate}T${bookingdata.pickupTime}`);
        const returnDateTime = new Date(`${bookingdata.returnDate}T${bookingdata.returnTime}`);
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
        const isExistingVehicle = await Vehicle.findById({ _id: bookingdata.vehicle }).session(session);

        if (!isExistingPickupLocation || !isExistingReturnLocation || !isExistingVehicle) {
            throw new Error('Invalid booking data');
        }

        //1. need to check if all the selected extra services are valid or not if valid then calculate the amount and update extraServicesAmount


        //2. Calculate the number of days the car is rented for
        carRentedForInDays = Math.ceil((returnDateTime.getTime() - pickupDateTime.getTime()) / (1000 * 60 * 60 * 24));
        // 3.Calculate the vehicleRentAmount based on the vehicle's daily rate 

        // validate clientDetails is present or not then throw error
        if (!clientDetails || !clientDetails.firstName || !clientDetails.lastName || !clientDetails.email || !clientDetails.phone) {
            throw new Error('Client details are incomplete');
        }
        // find client by email  if exists then use that client otherwise create new client
        const existingClient = await ClientModel.findOne({ email: clientDetails.email }).session(session);
        if (existingClient) {
            // bookingdata.clientId = existingClient._id; // Assign existing client ID to booking data
            bookingDataWithClient = {
                ...bookingdata,
                clientId: existingClient._id, // Assign the existing client ID to booking data
            };
        } else {
            // create client in Client model
            const client = await ClientModel.create([clientDetails], { session });
            if (!client || client.length === 0) {
                throw new Error('Failed to create client');
            }
            // Use the created client document
            const createdClient = client[0];
            if (!client) {
                throw new Error('Failed to create client');
            }
            bookingDataWithClient = {
                ...bookingdata,
                clientId: createdClient._id, // Assign the created client ID to booking data
            };
        }
        const createdBooking = await BookingModel.create([bookingDataWithClient], { session });

        if (!createdBooking || createdBooking.length === 0) {
            throw new Error('Failed to create booking');
        }

        await session.commitTransaction();
        session.endSession();
        return createdBooking[0];

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

// const getAllBookingsFromDB = async (query: Record<string, unknown>) => {
//     const bookingQuery = new QueryBuilder(
//         BookingModel.find().populate([
//             { path: 'pickupLocation' },
//             { path: 'returnLocation' },
//             { path: 'vehicle' },
//             { path: 'extraServices' },
//             { path: 'clientId' },
//             { path: 'paymentId' }
//         ]),
//         query,
//     )
//         .search(BookingSearchableFields)
//         .filter()
//         .sort()
//         .paginate()
//         .fields();

//     const result = await bookingQuery.modelQuery;
//     const meta = await bookingQuery.getPaginationInfo();

//     return {
//         meta,
//         result,
//     };
// };


const getAllBookingsFromDB = async (query: Record<string, unknown>) => {
    const bookingQuery = BookingModel.find()
        .populate([
            { path: 'pickupLocation' },
            { path: 'returnLocation' },
            { path: 'vehicle' },
            { path: 'extraServices' },
            { path: 'clientId' },
            { path: 'paymentId' }
        ]);

    const queryBuilder = new QueryBuilder(bookingQuery, query)
        .search(BookingSearchableNestedFields)
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await queryBuilder.modelQuery;
    const meta = await queryBuilder.getPaginationInfo();

    return {
        meta,
        result,
    };
};


export const BookingService = {
    createBookingToDB,
    getAllBookingsFromDB
};