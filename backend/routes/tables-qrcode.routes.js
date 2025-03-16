import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createTables, getAllTables, getTableById, updateTable } from '../controller/tables-qrcode.controller.js';

const router = express.Router();

// Route to create one or multiple tables
router.post('/', authMiddleware, createTables);

// Route to update an existing table by its unique ID
router.put('/:tableId', authMiddleware, updateTable);

// Route to get all tables for the authMiddlewared user
router.get('/', authMiddleware, getAllTables);

// Route to get a single table by its unique ID
router.get('/:tableId', authMiddleware, getTableById);

export default router;
