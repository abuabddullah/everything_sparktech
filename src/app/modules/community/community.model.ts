import { Schema, model } from 'mongoose';
import { ICommunity, CommunityModel } from './community.interface'; 

const answersItemSchema = new Schema({
  userId: { type: Schema.Types.ObjectId },
  User: { type: String },
  date: { type: String },
  comments: { type: String },

});

const communitySchema = new Schema<ICommunity, CommunityModel>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  avatarUrl: { type: String },
  question: { type: String },
  details: { type: String },
  answers: [answersItemSchema],
  answersCount: { type: Number },
  likesCount: { type: Number },
  tags: { type: [String] },
  status: { type: String },
}, {
  timestamps: true
});

export const Community = model<ICommunity, CommunityModel>('Community', communitySchema);
