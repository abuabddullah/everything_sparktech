import { Schema, model } from 'mongoose';
import { IPrompt } from './Prompt.interface';

const PromptSchema = new Schema<IPrompt>({
     image: { type: String, required: true },
     altText: { type: String, required: true },
     title: { type: String,required: true },
     description: { type: String,required: true },
     isDeleted: { type: Boolean, default: false },
     deletedAt: { type: Date },
}, { timestamps: true });

PromptSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

PromptSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

PromptSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const Prompt = model<IPrompt>('Prompt', PromptSchema);
