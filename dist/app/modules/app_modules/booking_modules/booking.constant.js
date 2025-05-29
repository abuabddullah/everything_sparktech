"use strict";
// export const BookingSearchableFields = [
//     'pickupLocation',
//     'returnLocation',
//     'vehicle',
//     'extraServices',
//     'clientId',
//     'paymentId'
// ];
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingSearchableNestedFields = void 0;
exports.BookingSearchableNestedFields = [
    'pickupLocation.location',
    'returnLocation.location',
    'vehicle.name',
    'vehicle.vehicleType',
    'clientId.firstName',
    'clientId.lastName',
    'clientId.email',
];
