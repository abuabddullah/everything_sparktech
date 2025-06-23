import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLES } from '../user/user.enums';
import { ProductController } from './product.controller';
import { ProductValidation } from './product.validation';
import express from 'express';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import { Request, Response, NextFunction } from 'express';
import { getMultipleFilesPath } from '../../../shared/getFilePath';
const router = express.Router();

// Create product (only vendors can create products)
router.post('/create',
    auth(USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN,USER_ROLES.SUPER_ADMIN,USER_ROLES.ADMIN),
    // validateRequest(ProductValidation.createProductZodSchema),
    fileUploadHandler(), (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.body.data) {
                const parsedData = JSON.parse(req.body.data);
                // Attach image path or filename to parsed data
                if (req.files) {
                    let image = getMultipleFilesPath(req.files, 'image');
                    parsedData.images = image;
                }


                // Validate and assign to req.body
                let formattedParsedData = ProductValidation.createProductZodSchema.parse({ body: parsedData });
                req.body = formattedParsedData.body;
            }

            // Proceed to controller
            return ProductController.createProduct(req, res, next);

        } catch (error) {
            next(error); // Pass validation errors to error handler
        }
    },
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
