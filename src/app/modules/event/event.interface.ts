import { Model, Types } from 'mongoose';
import { EVENT_TYPE } from './event.enum';

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
  type: EVENT_TYPE;
  coordinate: Array<number>;
};

export type EventModel = Model<IEvent>;
