import { model, Schema } from 'mongoose';
import { ISell, SellModel } from './sell.interface';

const sellSchema = new Schema<ISell, SellModel>(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Assuming you have a reference to the user creating the sell item
    image: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true },
    whatsapp: { type: String },
  },
  { timestamps: true }
);

export const Sell = model<ISell, SellModel>('Sell', sellSchema);
