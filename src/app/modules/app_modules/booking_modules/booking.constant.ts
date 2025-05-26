// export const BookingSearchableFields = [
//     'pickupLocation',
//     'returnLocation',
//     'vehicle',
//     'extraServices',
//     'clientId',
//     'paymentId'
// ];


export const BookingSearchableNestedFields = [
  'pickupLocation.location',
  'returnLocation.location',
  'vehicle.name',
  'clientId.firstName',
  'clientId.lastName',
  'clientId.email',
];