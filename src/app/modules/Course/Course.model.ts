import { Schema, model } from 'mongoose';
import { ICourse } from './Course.interface';

const CourseSchema = new Schema<ICourse>({
     image: { type: String, required: true },
     altText: { type: String, required: true },
     title: { type: String,required: true },
     description: { type: String,required: true },
     isDeleted: { type: Boolean, default: false },
     deletedAt: { type: Date },
}, { timestamps: true });

CourseSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

CourseSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

CourseSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const Course = model<ICourse>('Course', CourseSchema);
