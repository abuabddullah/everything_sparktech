import { model, Schema } from 'mongoose';
import paginate from '../../common/plugins/paginate';
import { IReview, IReviewModel } from './review.interface';

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      required: [true, 'dateOfBirth is required'],
    },
    comment : {
      type: String,
      required: [false, 'comment is not required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

ReviewSchema.plugin(paginate);

ReviewSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
ReviewSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._ReviewId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const Review = model<
  IReview,
  IReviewModel
>('Review', ReviewSchema);
