import { IVariant } from "./variant.interfaces";

export const generateSlug = (categoryName: string, subCategoryName: string, payload: IVariant | unknown): string => {
    // Helper function to get the first word of a string or array
    const getFirstWord = (value: string | string[] | undefined): string => {
        if (Array.isArray(value)) {
            // If it's an array, get the first word of the first element
            return value[0] ? value[0].split(' ')[0] : '';
        }
        return value ? value.split(' ')[0] : ''; // For string or undefined
    };
    // Function to check if a value is an ObjectId (for MongoDB)
    const isObjectId = (value: any): boolean => {
        // Check if the value matches a typical ObjectId pattern (24 characters, hexadecimal)
        return typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);
    };


    // Assert the payload is of type IVariant
    const variantPayload = payload as IVariant;

    // Generate the slug dynamically by iterating over the fields of the payload
    const slug = [
        getFirstWord(categoryName),  // Use the first word of the category name
        getFirstWord(subCategoryName),  // Use the first word of the subcategory name
        ...Object.values(variantPayload)     // Include the first word from each field in payload
            .map(value => {
                if (isObjectId(value)) return '';  // Skip ObjectId fields
                return getFirstWord(value);  // Get first word from each non-ObjectId field
            })
            .filter(Boolean),  // Remove undefined, null, or empty values
    ]
        .join('-')  // Join all the first words with a hyphen
        .toLowerCase();  // Convert the slug to lowercase


    return slug
};
