1. Frontend থেকে user Destination, location, car, extra service, and personal details, payment method diye booking confirm করার পর  reservation এ একটা নতুন booking create হবে? তাহলে super_admin এর কি আবার সব entry করার দরকার আছে 
2. paymetn method select করার পর initialize কখন হবে এটা নিয়ে একটু instruction দরকার
3. message+post এর notification আসার কথা কিন্তু এগুলোর UI টা পাচ্ছি না
4. vai client এর কি dashboard থাকবে সেখানে কি কি feature থাকবে?



** pickuptime - return time minmum 3 hrs
** location serachable
** noOfSeats left bar filter opiton
** booking confirm email jabe 
** client dashboard email+booking._id diye get booking
** driver assigning in booking


import { Types } from 'mongoose';

export const reqBody: IBookingRequestBody = {
    pickupDate: new Date("2025-06-01T10:00:00Z"), // example date
    pickupTime: "10:00 AM",
    pickupLocation: new Types.ObjectId("60d21b4667d0d8992e610c85"), // example location ObjectId
    returnDate: new Date("2025-06-07T10:00:00Z"), // example date
    returnTime: "10:00 AM",
    returnLocation: new Types.ObjectId("60d21b4667d0d8992e610c85"), // example location ObjectId
    vehicle: new Types.ObjectId("60d21b4667d0d8992e610c85"), // example vehicle ObjectId
    extraServices: [new Types.ObjectId("60d21b4667d0d8992e610c85")], // example extra service ObjectId
    clientDetails: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
        parmanentAddress: "123 Main St",
        country: "USA",
        presentAddress: "456 Elm St",
        state: "California",
        postCode: "90001"
    },
    paymentMethod: "STRIP", // or "BANK"
    amount: 1500, // Positive number
    status: "NOT CONFIRMED" // Other statuses: "CONFIRMED", "CANCELED", "COMPLETED"
};
