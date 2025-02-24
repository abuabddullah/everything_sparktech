import { Model, Types } from 'mongoose';

export type IOrganizations = {
  name: string;
  image: string;
  category: Types.ObjectId;
  locationName: string;
  locationCoordinates: Array<number>;
};

export type OrganizationsModel = Model<IOrganizations>;
