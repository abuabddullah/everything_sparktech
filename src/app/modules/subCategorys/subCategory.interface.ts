import { Types } from 'mongoose';

export interface ISubCategory {
     name: string;
     thumbnail: string;
     description: string;
     categoryId: Types.ObjectId;
     status: string;
     isDeleted: boolean;
}
