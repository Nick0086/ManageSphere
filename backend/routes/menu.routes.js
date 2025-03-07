import express from 'express';
import { addCategory, addMenuItem, createTemplate, getAllCategory, getAllMenuItems, getAllTemplatesList, updateCategory, updateMenuItem, updateTemplate } from '../controller/menu.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/category',authMiddleware, getAllCategory);
router.post('/category',authMiddleware, addCategory);
router.put('/category/:categoryId',authMiddleware,  updateCategory);

router.get('/menu-items', authMiddleware, getAllMenuItems);   
router.post('/menu-items', authMiddleware, addMenuItem);
router.put('/menu-items/:menuItemId', authMiddleware, updateMenuItem);

router.get('/template', authMiddleware, getAllTemplatesList);   
router.post('/template', authMiddleware, createTemplate);
router.put('/template/:templateId', authMiddleware, updateTemplate);

export default router;