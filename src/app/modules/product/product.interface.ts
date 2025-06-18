import mongoose from 'mongoose';

export interface IProductSingleVariant {
    variantId: mongoose.Types.ObjectId;
    variantQuantity: number;
    variantPrice: number;
}

export interface IProduct {
    //  .....
    purchaseCount: number;
    viewCount: number;
    categoryId: mongoose.Types.ObjectId;
    subcategoryId: mongoose.Types.ObjectId;
    totalReviews: number;
    product_variant_Details: IProductSingleVariant[];
}
