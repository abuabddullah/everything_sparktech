import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLES } from '../user/user.enums';
import { ProductController } from './product.controller';
import { ProductValidation } from './product.validation';
import express from 'express';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseMultipleFilesData from '../../middleware/parseMultipleFiledata';
import { FOLDER_NAMES } from '../../../enums/files';
const router = express.Router();

// Create product (only vendors can create products)
router.post('/',
    auth(USER_ROLES.VENDOR),
    fileUploadHandler(),
    validateRequest(ProductValidation.createProductZodSchema),
    parseMultipleFilesData(FOLDER_NAMES.IMAGES),
    ProductController.createProduct
);

// Get all products (public endpoint)
router.get('/',
    // validateRequest(ProductValidation.getProductsZodSchema),
    ProductController.getProducts
);

// Get product by ID (public endpoint)
router.get('/:id',
    validateRequest(ProductValidation.getProductByIdZodSchema),
    ProductController.getProductById
);

// Get products by category (public endpoint)
router.get('/category/:categoryId',
    validateRequest(ProductValidation.getProductsByCategoryZodSchema),
    ProductController.getProductsByCategory
);

// Update product (only vendor who owns the product)
router.patch('/:id',
    auth(USER_ROLES.VENDOR),
    validateRequest(ProductValidation.updateProductZodSchema),
    ProductController.updateProduct
);

// Delete product (only vendor who owns the product)
router.delete('/:id',
    auth(USER_ROLES.VENDOR),
    validateRequest(ProductValidation.deleteProductZodSchema),
    ProductController.deleteProduct
);

export const ProductRoutes = router;
