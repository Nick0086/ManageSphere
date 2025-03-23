import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createOrder, getAllOrders } from '../controller/order.controller.js';

const router = express.Router();

router.post('/', authMiddleware, createOrder);

router.post('/all', authMiddleware, getAllOrders)

export default router;
