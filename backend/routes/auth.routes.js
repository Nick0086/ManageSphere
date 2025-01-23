import express from 'express';
import { checkUserEmailOrNumber, verifyPassword } from '../controller/auth.controller.js';

const router = express.Router();

router.post('/check-user', checkUserEmailOrNumber);
router.post('/verify-password', verifyPassword);

export default router;