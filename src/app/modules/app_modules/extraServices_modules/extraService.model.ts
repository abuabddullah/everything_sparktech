

import mongoose, { Schema, Document } from 'mongoose';
import { IExtraService } from './extraService.interface';
import { EXTRA_SERVICE_STATUS } from '../../../../enums/extraService';



const extraServiceSchema: Schema<IExtraService> = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ["PROTECTION"] },
    image: { type: String, required: true, default: 'https://i.ibb.co/z5YHLV9/profile.png' },
    cost: { type: Number, default: 0 },
    status: { type: String, enum: Object.values(EXTRA_SERVICE_STATUS), default: EXTRA_SERVICE_STATUS.ACTIVE },
  },
  { timestamps: true }
);

const ExtraServiceModel = mongoose.model<IExtraService>('ExtraService', extraServiceSchema);

export default ExtraServiceModel;
