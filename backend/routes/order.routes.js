import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createOrder, getAllOrders, getOrderById, updateOrderStatus } from '../controller/order.controller.js';

const router = express.Router();

router.post('/add/:restaurantId', createOrder);

router.post('/all', authMiddleware, getAllOrders)

router.get('/:orderId', authMiddleware, getOrderById);

router.put('/status', authMiddleware, updateOrderStatus);

export default router;
