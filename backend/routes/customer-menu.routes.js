import express from 'express';
import { getMenuForCustomerByTableId } from '../controller/customer-menu.controller.js';

const router = express.Router();

router.get('/:tableId/:userId', getMenuForCustomerByTableId);

export default router;
