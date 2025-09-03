import { Schema, model } from 'mongoose';
import { IStudymaterial, StudymaterialModel } from './studymaterial.interface'; 
import { StudyMaterialCategory } from '../../../enum/studyMaterial';

const studymaterialSchema = new Schema<IStudymaterial, StudymaterialModel>({
  name: { type: String },
  category: { type: String , enum: Object.values(StudyMaterialCategory) },
  size: { type: String },
  uploadDate: { type: Date },
  type: { type: String },
  fileUrl: { type: String },
  Date : {type : Date, default: Date.now},
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true
});

export const Studymaterial = model<IStudymaterial, StudymaterialModel>('Studymaterial', studymaterialSchema);
