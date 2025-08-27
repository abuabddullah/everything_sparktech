import { Schema, model } from 'mongoose';
import { IQuestionSet } from './QuestionSet.interface';

const QuestionSetSchema = new Schema<IQuestionSet>({
     image: { type: String, required: true },
     altText: { type: String, required: true },
     title: { type: String,required: true },
     description: { type: String,required: true },
     isDeleted: { type: Boolean, default: false },
     deletedAt: { type: Date },
}, { timestamps: true });

QuestionSetSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

QuestionSetSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

QuestionSetSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const QuestionSet = model<IQuestionSet>('QuestionSet', QuestionSetSchema);
