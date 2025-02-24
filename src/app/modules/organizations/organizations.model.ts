import { Schema, model } from 'mongoose';
import { IOrganizations, OrganizationsModel } from './organizations.interface';

const organizationsSchema = new Schema<IOrganizations, OrganizationsModel>(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    locationName: { type: String, required: true },
    locationCoordinates: { type: [Number], required: true },
  },
  { timestamps: true }
);

export const Organizations = model<IOrganizations, OrganizationsModel>(
  'Organizations',
  organizationsSchema
);
