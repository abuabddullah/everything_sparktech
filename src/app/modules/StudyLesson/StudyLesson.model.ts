import { Schema, model } from 'mongoose';
import { IStudyLesson } from './StudyLesson.interface';

const StudyLessonSchema = new Schema<IStudyLesson>({
     image: { type: String, required: true },
     altText: { type: String, required: true },
     title: { type: String,required: true },
     description: { type: String,required: true },
     isDeleted: { type: Boolean, default: false },
     deletedAt: { type: Date },
}, { timestamps: true });

StudyLessonSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

StudyLessonSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

StudyLessonSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const StudyLesson = model<IStudyLesson>('StudyLesson', StudyLessonSchema);
