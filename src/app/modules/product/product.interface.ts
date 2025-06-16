import mongoose from 'mongoose';

export interface IProduct {
    //  .....
    purchaseCount: number;
    viewCount: number;
    categoryId: mongoose.Types.ObjectId;
    subcategoryId: mongoose.Types.ObjectId;
    totalReviews: number;
}
