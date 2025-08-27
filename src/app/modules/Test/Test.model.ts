import { Schema, model } from 'mongoose';
import { ITest } from './Test.interface';

const TestSchema = new Schema<ITest>({
     image: { type: String, required: true },
     altText: { type: String, required: true },
     title: { type: String,required: true },
     description: { type: String,required: true },
     isDeleted: { type: Boolean, default: false },
     deletedAt: { type: Date },
}, { timestamps: true });

TestSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

TestSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

TestSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const Test = model<ITest>('Test', TestSchema);
