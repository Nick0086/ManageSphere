import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createOrder } from '../controller/order.controller.js';

const router = express.Router();

router.post('/', authMiddleware, createOrder);

export default router;
