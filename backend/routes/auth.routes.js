import express from 'express';
import { checkUserEmailOrNumber, forgotPassword, resetPassword, sendOTP, userActiveSessionCheck, verifyOTP, verifyPassword } from '../controller/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/check-user', checkUserEmailOrNumber);
router.post('/verify-password', verifyPassword);
router.post('/verify-otp', verifyOTP);

router.post('/send-otp', sendOTP);

router.get('/forgot-password/:email', forgotPassword)
router.post('/reset-password', resetPassword)

router.get('/check-user-session', authMiddleware, userActiveSessionCheck);

export default router;