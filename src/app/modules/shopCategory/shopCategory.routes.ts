import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../user/user.enums';
import validateRequest from '../../middleware/validateRequest';
import { shopCategoryValidation } from './shopCategory.validation';
import { ShopCategoryController } from './shopCategory.controller';

const router = Router();

router.get("/", ShopCategoryController.getAllShopCategory)

router.post(
    '/create',
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN),
    validateRequest(shopCategoryValidation.createShopCategoryValidationSchema),
    ShopCategoryController.createShopCategory
);

router.patch(
    '/:id',
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN),
    validateRequest(shopCategoryValidation.updateShopCategoryValidationSchema),
    ShopCategoryController.updateShopCategory
)

router.delete(
    '/:id',
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN),
    ShopCategoryController.deleteShopCategory
)

export const ShopCategoryRoutes = router;
