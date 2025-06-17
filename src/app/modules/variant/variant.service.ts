import { StatusCodes } from "http-status-codes";
import AppError from "../../../errors/AppError";
import { Category } from "../category/category.model";
import { SubCategory } from "../subCategorys/subCategory.model";
import { IVariantZod } from "./variant.validation";
import Variant from "./variant.model";
import { generateSlug } from "./variant.utils";
import { IVariant } from "./variant.interfaces";
import QueryBuilder from "../../builder/QueryBuilder";


// create sub category
const createVariant = async (payload: IVariant) => {
    const isExistCategory = await Category.findById(payload.categoryId);
    if (!isExistCategory) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Category not found!');
    }
    const isExistSubCategory = await SubCategory.findById(payload.subCategoryId);
    if (!isExistSubCategory) {
        throw new AppError(StatusCodes.NOT_FOUND, 'SubCategory not found!');
    }

    const variantSlug = generateSlug(isExistCategory.name, isExistSubCategory.name, payload)
    const isVariantExistSlug = await Variant.findOne({ slug: variantSlug });
    if (isVariantExistSlug) {
        throw new AppError(StatusCodes.NOT_ACCEPTABLE, `This Variant Already Exists under ${isExistSubCategory.name} subcategory`);
    }
    const createVariant = new Variant({
        ...payload, slug: variantSlug
    });
    await createVariant.save()
    if (!createVariant) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create Variant');
    }
    await SubCategory.findByIdAndUpdate(
        payload.subCategoryId,
        {
            $push: { variants: createVariant._id },
        },
        { new: true },
    );

    return createVariant;
};



export const getAllVariantsFromDB = async (query: Record<string, unknown>) => {
    const variantQuery = new QueryBuilder(Variant.find().populate([
        { path: "categoryId", select: "name" },  // Only populate the "name" field of categoryId
        { path: "subCategoryId", select: "name" } // Only populate the "name" field of subCategoryId
    ]), query)
    const result = await variantQuery.fields().sort().paginate().filter().search(['slug']).modelQuery
    const meta = await variantQuery.countTotal();
    return {
        meta,
        result
    }
};


export const getSingleVariantByIdFromDB = async (id: string) => {
    const result = await Variant.findById(id).populate([
        { path: "categoryId", select: "name" },  // Only populate the "name" field of categoryId
        { path: "subCategoryId", select: "name" } // Only populate the "name" field of subCategoryId
    ])
    return {
        result
    }
};


// Update Variant
export const updateVariant = async (id: string, data: Partial<IVariant>) => {
    // Find and update the variant
    const updatedVariant = await Variant.findById(id)
        .populate({ path: "categoryId", select: "name" })  // Populate categoryId's name field
        .populate({ path: "subCategoryId", select: "name" }); // Populate subCategoryId's name field
    // If no variant was found, throw an error
    if (!updatedVariant) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Variant not found');
    }
    // Make sure that categoryId and subCategoryId are populated and contain 'name' field
    const categoryName = updatedVariant.categoryId?.name;
    const subCategoryName = updatedVariant.subCategoryId?.name;

    if (!categoryName || !subCategoryName) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Category or SubCategory name is missing');
    }

    // Generate the slug based on category name, subcategory name, and variant details
    const variantSlug = generateSlug(categoryName, subCategoryName, data);
    // Update the variant with the new slug and the provided data
    updatedVariant.set({
        ...data,  // Apply the incoming data
        slug: variantSlug  // Update the slug
    });

    // Save the updated variant
    await updatedVariant.save();


    return updatedVariant;
};

// Delete Variant
export const deleteVariant = async (id: string) => {
    // Find and delete the variant
    const deletedVariant = await Variant.findByIdAndDelete(id);

    // If no variant was found, throw an error
    if (!deletedVariant) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Variant not found');
    }

    return deletedVariant;
};


export const VariantService = {
    createVariant,
    getAllVariantsFromDB,
    getSingleVariantByIdFromDB,
    updateVariant,
    deleteVariant,
}