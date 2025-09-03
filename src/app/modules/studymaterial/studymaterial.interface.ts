import { Model, Types } from 'mongoose';
import { StudyMaterialCategory } from '../../../enum/studyMaterial';

export interface IStudymaterialFilterables {
  searchTerm?: string;
  name?: string;
  category?: string;
  size?: string;
  fileUrl?: string;
}


export interface IStudymaterial {
  _id: Types.ObjectId;
  name: string;
  category: StudyMaterialCategory;
  size: string;
  uploadDate: Date;
  type: string;
  fileUrl: string;
  Date : Date;
  uploadedBy: Types.ObjectId;
}

export type StudymaterialModel = Model<IStudymaterial, {}, {}>;
