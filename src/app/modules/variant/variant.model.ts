import { Schema, model, Document } from "mongoose";
import { IVariant } from "./variant.interfaces"; // Import IVariant interface

// Define Mongoose Schema based on IVariant interface
const variantSchema = new Schema<IVariant & Document>({
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategoryId: { type: Schema.Types.ObjectId, ref: 'SubCategory', required: true },
    slug: { type: String, required: true, unique: true },
    color: { type: String, required: false },
    storage: { type: String, required: false },
    ram: { type: String, required: false },
    network_type: { type: [String], required: false },
    operating_system: { type: String, required: false },
    storage_type: { type: String, required: false },
    processor_type: { type: String, required: false },
    processor: { type: String, required: false },
    graphics_card_type: { type: String, required: false },
    graphics_card_size: { type: String, required: false },
    screen_size: { type: Number, required: false },
    resolution: { type: String, required: false },
    lens_kit: { type: String, required: false },
    material: { type: String, required: false },
    size: { type: String, required: false },
    fabric: { type: String, required: false },
    weight: { type: Number, required: false },
    dimensions: { type: String, required: false },
    capacity: { type: String, required: false },
}, {
    timestamps: true,
});

// Define the model with the interface and document type
const Variant = model<IVariant & Document>("Variant", variantSchema);

export default Variant;
