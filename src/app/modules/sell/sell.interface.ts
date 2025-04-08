import { Model, Types } from 'mongoose';

export type ISell = {
  _id: Types.ObjectId;
  createdBy: Types.ObjectId; // Assuming you have a reference to the user creating the sell item
  image: string;
  name: string;
  description: string;
  price: number;
  country: string;
  state: string;
  city: string;
  phone: string;
  whatsapp?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SellFilters = {
  searchTerm?: string;
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type SellModel = Model<ISell>;

export const sell_filterable_fields = [
  'searchTerm',
  'city',
  'state',
  'minPrice',
  'maxPrice',
];
export const sell_searchable_fields = [
  'name',
  'description',
  'country',
  'city',
  'state',
];
