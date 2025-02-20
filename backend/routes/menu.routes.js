import express from 'express';
import { addCategory, getAllCategory, updateCategory } from '../controller/menu.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/category',authMiddleware, getAllCategory);
router.post('/category',authMiddleware, addCategory);
router.put('/category/:categoryId',authMiddleware,  updateCategory);

export default router;