import { Schema, model } from 'mongoose';
import { IUserProgressHistory } from './UserProgressHistory.interface';

const UserProgressHistorySchema = new Schema<IUserProgressHistory>({
     image: { type: String, required: true },
     altText: { type: String, required: true },
     title: { type: String,required: true },
     description: { type: String,required: true },
     isDeleted: { type: Boolean, default: false },
     deletedAt: { type: Date },
}, { timestamps: true });

UserProgressHistorySchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

UserProgressHistorySchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

UserProgressHistorySchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const UserProgressHistory = model<IUserProgressHistory>('UserProgressHistory', UserProgressHistorySchema);
