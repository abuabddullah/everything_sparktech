import { Product } from './product.model';
import { ICreateProductRequest, IProduct, IProductSingleVariant, IProductSingleVariantByFieldName } from './product.interface';
import { StatusCodes } from 'http-status-codes';
import { IJwtPayload } from '../auth/auth.interface';
import mongoose from 'mongoose';
import AppError from '../../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import unlinkFile from '../../../shared/unlinkFile';
import { generateSlug } from '../variant/variant.utils';
import Variant from '../variant/variant.model';

const createProduct = async (payload: IProduct, user: IJwtPayload) => {
    try {
        // Check if shop exists and user is authorized
        const shop = await Product.findOne({ shopId: payload.shopId });
        if (!shop) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
        }

        // Validate category, subcategory and brand
        const category = await Product.findOne({ _id: payload.categoryId });
        const isExistSubCategory = await Product.findOne({ _id: payload.subcategoryId });
        const brand = await Product.findOne({ _id: payload.brandId });
        if (!category) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
        }
        if (!isExistSubCategory) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Subcategory not found');
        }
        if (!brand) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Brand not found');
        }


        // Validate variants
        if (!payload.product_variant_Details || payload.product_variant_Details.length === 0) {
            throw new AppError(StatusCodes.BAD_REQUEST, 'At least one variant is required');
        }

        const variantsWithSlug = payload.product_variant_Details.map(async (variant, index) => {
            if (variant.variantId) {
                const isExistVariant = await Variant.findOne({ _id: variant.variantId });
                if (!isExistVariant) {
                    throw new AppError(StatusCodes.NOT_FOUND, `Variant not found ${variant.variantId}`);
                }
                return {
                    variantId: variant.variantId,
                    variantQuantity: variant.variantQuantity,
                    variantPrice: variant.variantPrice,
                } as IProductSingleVariant;
            }

            // Create a new Variant
            const createVariant = new Variant({
                ...variant,
                createdBy: user.id,
                categoryId: payload.categoryId,
                subCategoryId: payload.subcategoryId,
                
            });
            // create variant
            const variantSlug = generateSlug(category.name, isExistSubCategory.name, variant as IProductSingleVariantByFieldName);

            // Check if variant with same slug already exists
            const isVariantExistSlug = await Variant.findOne({ slug: variantSlug });
            if (isVariantExistSlug) {
                throw new AppError(StatusCodes.NOT_ACCEPTABLE, `This ${index} no product_variant_Details ${variantSlug} slug is exists under ${isExistSubCategory.name} subcategory so use that variant id : ${isVariantExistSlug._id}`);
            }

            // Set the generated slug
            createVariant.slug = variantSlug;

            // Save the variant to the database
            await createVariant.save();
            if (!createVariant) {
                throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create Variant');
            }
            return {
                variantId: createVariant._id,
                variantQuantity: variant.variantQuantity,
                variantPrice: variant.variantPrice,
            } as IProductSingleVariant;
        });



        // Validate variant quantities and prices
        const totalStock = payload.product_variant_Details.reduce((sum, variant) => {
            if (variant.variantQuantity < 0) {
                throw new AppError(StatusCodes.BAD_REQUEST, 'Variant quantity cannot be negative');
            }
            if (variant.variantPrice < 0) {
                throw new AppError(StatusCodes.BAD_REQUEST, 'Variant price cannot be negative');
            }
            return sum + variant.variantQuantity;
        }, 0);

        // Create product
        const product = new Product({
            ...payload,
            createdBy: user.id,
            totalStock,
            product_variant_Details: variantsWithSlug
        });

        return await product.save();
    } catch (error) {
        if (payload.images) {
            payload.images.forEach(image => unlinkFile(image));
        }
        throw error;
    }
};

const getProducts = async (query: Record<string, unknown>) => {
    const productQuery = new QueryBuilder(Product.find().populate('shopId', 'name').populate('categoryId', 'name').populate('subcategoryId', 'name').populate('brandId', 'name'), query)
        .search(['name', 'description', 'tags'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await productQuery.modelQuery;
    const meta = await productQuery.countTotal();

    return {
        meta,
        result
    };
};

const getProductById = async (id: string) => {
    const product = await Product.findById(id)
        .populate('shopId', 'name')
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name')
        .populate('brandId', 'name')
        .populate('product_variant_Details.variantId', 'name');

    if (!product) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
    }

    return product;
};

const updateProduct = async (id: string, payload: Partial<IProduct>, user: IJwtPayload) => {
    // Get existing product
    const product = await Product.findById(id);
    if (!product) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
    }

    // Check if user is authorized to update
    if (product.shopId.toString() !== user.id) {
        throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to update this product');
    }

    // Handle variant updates
    if (payload.product_variant_Details) {
        if (!payload.product_variant_Details.length) {
            throw new AppError(StatusCodes.BAD_REQUEST, 'At least one variant is required');
        }

        // Validate variant quantities and prices
        const totalStock = payload.product_variant_Details.reduce((sum, variant) => {
            if (variant.variantQuantity < 0) {
                throw new AppError(StatusCodes.BAD_REQUEST, 'Variant quantity cannot be negative');
            }
            if (variant.variantPrice < 0) {
                throw new AppError(StatusCodes.BAD_REQUEST, 'Variant price cannot be negative');
            }
            return sum + variant.variantQuantity;
        }, 0);

        if (payload.totalStock && totalStock !== payload.totalStock) {
            throw new AppError(StatusCodes.BAD_REQUEST, 'Total stock does not match sum of variant quantities');
        }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        payload,
        { new: true }
    );

    if (!updatedProduct) {
        throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update product');
    }

    // Handle image cleanup if product was not updated successfully
    if (payload.images && !updatedProduct) {
        payload.images.forEach(image => unlinkFile(image));
    }

    return updatedProduct;
};

const deleteProduct = async (id: string, user: IJwtPayload) => {
    const product = await Product.findById(id);
    if (!product) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
    }

    if (product.shopId.toString() !== user.id) {
        throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to delete this product');
    }

    // Soft delete the product
    product.isDeleted = true;
    product.deletedAt = new Date();
    await product.save();

    return product;
};

const getProductsByCategory = async (categoryId: string) => {
    const products = await Product.find({ categoryId })
        .populate('shopId', 'name')
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name')
        .populate('brandId', 'name')
        .populate('product_variant_Details.variantId', 'name');

    if (!products || products.length === 0) {
        throw new AppError(StatusCodes.NOT_FOUND, 'No products found in this category');
    }

    return products;
};

export const ProductService = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategory
};
