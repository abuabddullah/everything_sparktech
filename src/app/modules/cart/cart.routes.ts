// src/app/modules/cart/cart.routes.ts
import { Router } from 'express';
import { USER_ROLES } from '../user/user.enums';
import { 
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from './cart.controller';
import { createCartValidation, updateCartValidation } from './cart.validation';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';

const router = Router();

// All routes require authentication
router.use(auth(USER_ROLES.USER));

// GET /api/v1/cart - Get user's cart
router.get('/', getCart);

// POST /api/v1/cart - Add items to cart
router.post('/', validateRequest(createCartValidation), addToCart);

// PATCH /api/v1/cart/items/:itemId - Update cart item quantity
router.patch('/items/:itemId', validateRequest(updateCartValidation), updateCartItem);

// DELETE /api/v1/cart/items/:itemId - Remove item from cart
router.delete('/items/:itemId', removeFromCart);

// DELETE /api/v1/cart - Clear cart
router.delete('/', clearCart);

export const CartRoutes = router;