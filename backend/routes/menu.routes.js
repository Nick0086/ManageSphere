import express from 'express';
import { addCategory, addMenuItem, getAllCategory, getAllMenuItems, updateCategory, updateMenuItem } from '../controller/menu.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/category',authMiddleware, getAllCategory);
router.post('/category',authMiddleware, addCategory);
router.put('/category/:categoryId',authMiddleware,  updateCategory);

router.get('/menu-items', authMiddleware, getAllMenuItems);   
router.post('/menu-items', authMiddleware, addMenuItem);
router.put('/menu-items/:menuItemId', authMiddleware, updateMenuItem);

export default router;