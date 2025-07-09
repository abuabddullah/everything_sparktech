import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../types/paginate';

export interface INotification {
  _id?: Types.ObjectId;
  title: string;
  subTitle?: string;
  receiverId?: Types.ObjectId | string;
  // message?: string;
  // image?: string; // age object chilo .. 
  linkId?: Types.ObjectId | string;
  //role: UploaderRole.projectManager | UploaderRole.projectSupervisor;
  viewStatus?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INotificationModal extends Model<INotification> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<INotification>>;
}
