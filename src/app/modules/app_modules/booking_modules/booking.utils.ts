import mongoose from "mongoose";
import { IBookingRequestBody } from "./booking.interface";
import ExtraServiceModel from "../extraServices_modules/extraService.model";

export async function calculateExtraServiceAmount(payload: Partial<IBookingRequestBody>) {
    if (payload?.extraServices && payload.extraServices.length > 0) {
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
        let selectedExtraServicesAmount = 0;
        selectedExtraServices.forEach((service, index) => {
            const serviceDetail = serviceDetails[index];

            // Ensure that the service has a valid cost and quantity
            const serviceAmount = (service.cost || 0) * serviceDetail.quantity; // Multiply cost by quantity
            selectedExtraServicesAmount += serviceAmount; // Add to total cost
        });

        // Optionally, you can log or return the total amount of extra services
        console.log('Total cost of selected extra services:', selectedExtraServicesAmount);
        return selectedExtraServicesAmount;
    }
    return 0; // No extra services selected
}