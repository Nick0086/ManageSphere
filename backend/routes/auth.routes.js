import express from 'express';
import { checkUserExists, logoutUser, performPasswordReset, requestPasswordReset, sendOneTimePassword, validateActiveUserSession, validatePasswordResetToken, verifyOneTimePassword, verifyUserPassword } from '../controller/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// User Authentication Routes
router.post('/user/check', checkUserExists);
router.post('/user/verify-password', verifyUserPassword);
router.post('/user/send-otp', sendOneTimePassword);
router.post('/user/verify-otp', verifyOneTimePassword);

// Password Management Routes
router.get('/password/forgot/:email', requestPasswordReset);
router.post('/password/reset', performPasswordReset);
router.get('/password/check-reset-token/:token', validatePasswordResetToken);

// Session Management Routes
router.get('/session/active', authMiddleware, validateActiveUserSession);
router.get('/session/logout', authMiddleware, logoutUser);

export default router;