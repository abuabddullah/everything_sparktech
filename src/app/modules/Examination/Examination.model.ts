import { Schema, model } from 'mongoose';
import { IExamination } from './Examination.interface';

const ExaminationSchema = new Schema<IExamination>({
     image: { type: String, required: true },
     altText: { type: String, required: true },
     title: { type: String,required: true },
     description: { type: String,required: true },
     isDeleted: { type: Boolean, default: false },
     deletedAt: { type: Date },
}, { timestamps: true });

ExaminationSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

ExaminationSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

ExaminationSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const Examination = model<IExamination>('Examination', ExaminationSchema);
