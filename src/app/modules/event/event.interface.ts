import { Model, Types } from 'mongoose';

export type IEvent = {
  thumbnailImage: string;
  introMedia: string;
  name: string;
  time: Date;
  location: {
    name: string;
    coordinate: Array<number>;
  };
  description: string;
  tags: Array<string>;
  price: number;
  creator: Types.ObjectId;
  address: string;
  type: 'adult' | 'kids' | 'family';
  coordinate: Array<number>;
};

export type EventModel = Model<IEvent>;
