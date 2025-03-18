import express from 'express';
import { getMenuForCustomerByTableId } from '../controller/customer-menu.controller.js';

const router = express.Router();

router.get('/:userId/:tableId', getMenuForCustomerByTableId);

export default router;
