import express from 'express';
import { captureInvoiceSnapshot, checkSnapshotExists, createInvoiceTemplate, getAllInvoiceTemplates, getAllInvoiceTemplatesWithItems, getInvoiceTemplateById, getInvoiceTemplateByIdWithItems, setDefaultInvoiceTemplate, updateInvoiceTemplate } from '../controller/invoices.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/',authMiddleware, createInvoiceTemplate);
router.put('/:templateId',authMiddleware,  updateInvoiceTemplate);
router.get('/', authMiddleware, getAllInvoiceTemplates);   
router.get('/:templateId', authMiddleware, getInvoiceTemplateById);
router.get('/items/:templateId', authMiddleware, getInvoiceTemplateByIdWithItems);
router.get('/items', authMiddleware, getAllInvoiceTemplatesWithItems);
router.put('/default/:templateId', authMiddleware, setDefaultInvoiceTemplate);
router.post('/capture-snapshot/:orderId/:restaurantId', captureInvoiceSnapshot);
router.get('/check-snapshot/:orderId', authMiddleware, checkSnapshotExists);

export default router;