import { Schema, model } from 'mongoose';
import { IQuestion } from './Question.interface';

const QuestionSchema = new Schema<IQuestion>({
     image: { type: String, required: true },
     altText: { type: String, required: true },
     title: { type: String,required: true },
     description: { type: String,required: true },
     isDeleted: { type: Boolean, default: false },
     deletedAt: { type: Date },
}, { timestamps: true });

QuestionSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

QuestionSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

QuestionSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const Question = model<IQuestion>('Question', QuestionSchema);
