// src/app/modules/cart/cart.service.ts
import { StatusCodes } from 'http-status-codes';
import { FilterQuery, Types } from 'mongoose';
import { Product } from '../product/product.model';
import AppError from '../../../errors/AppError';
import { Cart } from './cart.model';
import Variant from '../variant/variant.model';

export const getCart = async (userId: string) => {
    const cart = await Cart.findOne({ userId })
        .populate('items.productId', 'name images')
        .populate('items.variantId');
    
    if (!cart) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Cart not found');
    }

    return cart;
};

export const addToCart = async (userId: string, items: Array<{
    productId: string;
    variantId: string;
    variantQuantity: number;
    variantPrice: number;
}>) => {
    const session = await Cart.startSession();
    session.startTransaction();

    try {
        let cart = await Cart.findOne({ userId }).session(session);

        // If cart doesn't exist, create a new one
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        // Process each item
        for (const item of items) {
            // Validate product and variant
            const [product, variant] = await Promise.all([
                Product.findById(item.productId).session(session),
                Variant.findById(item.variantId).session(session)
            ]);

            if (!product) {
                throw new AppError(StatusCodes.NOT_FOUND, `Product not found with ID: ${item.productId}`);
            }

            if (!variant) {
                throw new AppError(StatusCodes.NOT_FOUND, `Variant not found with ID: ${item.variantId}`);
            }

            // Check if variant already exists in cart
            const existingItemIndex = cart.items.findIndex(
                i => i.productId.toString() === item.productId && 
                     i.variantId.toString() === item.variantId
            );

            if (existingItemIndex > -1) {
                // Update quantity if item already exists
                cart.items[existingItemIndex].variantQuantity += item.variantQuantity;
                cart.items[existingItemIndex].totalPrice = 
                    cart.items[existingItemIndex].variantPrice * 
                    cart.items[existingItemIndex].variantQuantity;
            } else {
                // Add new item
                const totalPrice = variant.price * item.variantQuantity;
                cart.items.push({
                    productId: new Types.ObjectId(item.productId),
                    variantId: new Types.ObjectId(item.variantId),
                    variantPrice: variant.price,
                    variantQuantity: item.variantQuantity,
                    totalPrice
                });
            }
        }

        // Calculate cart total
        const cartTotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

        const savedCart = await cart.save({ session });
        await session.commitTransaction();

        return {
            cart: await savedCart.populate('items.productId', 'name images')
                                .populate('items.variantId', 'color storage ram'),
            total: cartTotal
        };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
};

export const updateCartItem = async (
    userId: string, 
    itemId: string, 
    updateData: { variantQuantity: number }
) => {
    const session = await Cart.startSession();
    session.startTransaction();

    try {
        const cart = await Cart.findOne({ userId }).session(session);
        if (!cart) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Cart not found');
        }

        const itemIndex = cart.items.findIndex(
            item => item._id.toString() === itemId
        );

        if (itemIndex === -1) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Item not found in cart');
        }

        // Update quantity and total price
        cart.items[itemIndex].variantQuantity = updateData.variantQuantity;
        cart.items[itemIndex].totalPrice = 
            cart.items[itemIndex].variantPrice * updateData.variantQuantity;

        const savedCart = await cart.save({ session });
        await session.commitTransaction();

        return await savedCart.populate('items.productId', 'name images')
                            .populate('items.variantId', 'color storage ram');
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
};

export const removeFromCart = async (userId: string, itemId: string) => {
    const session = await Cart.startSession();
    session.startTransaction();

    try {
        const cart = await Cart.findOne({ userId }).session(session);
        if (!cart) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Cart not found');
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter(item => item._id.toString() !== itemId);

        if (cart.items.length === initialLength) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Item not found in cart');
        }

        const savedCart = await cart.save({ session });
        await session.commitTransaction();

        return await savedCart.populate('items.productId', 'name images')
                            .populate('items.variantId', 'color storage ram');
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
};

export const clearCart = async (userId: string) => {
    const cart = await Cart.findOneAndUpdate(
        { userId },
        { $set: { items: [] } },
        { new: true }
    );

    if (!cart) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Cart not found');
    }

    return cart;
};