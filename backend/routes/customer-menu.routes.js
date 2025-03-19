import express from 'express';
import { getMenuCategoryForConsumer, getMenuForCustomerByTableId, getMenuItemsForConsumer } from '../controller/customer-menu.controller.js';

const router = express.Router();

router.get('/template/:userId/:tableId', getMenuForCustomerByTableId);
router.get('/category/:userId', getMenuCategoryForConsumer);
router.get('/items/:userId', getMenuItemsForConsumer);

export default router;
