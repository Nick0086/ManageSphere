import query from "../utils/query.utils.js";
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { handleError } from "../utils/utils.js";
import { sendOtpEmail } from "../services/nodemailer/nodemailer.service.js";
import { sendSMS } from "../services/twilio/twilio.service.js";

/* CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,  -- UUID as a unique identifier
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    mobile VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,  -- For storing hashed password
    gender ENUM('Male', 'Female', 'Other', 'Prefer not to say') NOT NULL,
    date_of_birth DATE,
    address VARCHAR(500),
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);*/

/*  CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id CHAR(36) NOT NULL UNIQUE,  -- UUID as a unique identifier
    user_id CHAR(36) NOT NULL,  -- Reference to users.unique_id
    user_agent TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    login_type VARCHAR(45) NOT NULL,
    login_id VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    refresh_token TEXT NOT NULL,
    is_revoke INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(unique_id)
);*/

/* CREATE TABLE otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id CHAR(36) NOT NULL,  -- Reference to user_sessions.session_id
    otp VARCHAR(6) NOT NULL,
    login_type VARCHAR(45) NOT NULL,
    login_id VARCHAR(45) NOT NULL,
    expires_at TIMESTAMP NOT NULL
); */

/* CREATE TABLE password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,  -- Reference to users.unique_id
    token CHAR(36) NOT NULL UNIQUE,  -- UUID as a unique identifier
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(unique_id)
);*/

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
};

// Checks if a user exists based on email or mobile number
export const checkUserExists = async (req, res) => {
    try {
        const { loginId } = req.body;
        const sql = `SELECT unique_id, first_name, last_name, mobile, email FROM users WHERE email = ? OR mobile = ?`;
        const params = [loginId, loginId];
        const result = await query(sql, params);

        if (result.length === 0) {
            return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User account not found. Please verify the provided email or mobile number.' });
        }

        return res.status(200).json({ code: 'USER_FOUND', message: 'User account exists.' });

    } catch (error) {
        console.log("Error in checkUserExists: ", error);
        return res.status(500).json({ code: 'SERVER_ERROR', message: 'An unexpected error occurred while checking user existence.', error: error.message });
    }
}

// Verifies the user's password and creates a session if valid
export const verifyUserPassword = async (req, res) => {
    try {
        const { loginId, loginType, password } = req.body;

        if (!loginId || !loginType || !password) {
            return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Login identifier, method, and password are required.' });
        }

        const sql = `SELECT password, unique_id, first_name, last_name, mobile, email, profile_picture  FROM users WHERE email = ? OR mobile = ?`;
        const params = [loginId, loginId];
        const result = await query(sql, params);

        if (result.length === 0) {
            return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User account not found.' });
        }

        const hashedPassword = result[0].password;
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);

        if (!isPasswordValid) {
            return res.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'The password you entered is incorrect.' });
        }

        const sessionId = await createUserSession(req, res, { ...result[0], loginId, loginType })

        // Check if session creation failed
        if (!sessionId) {
            return res.status(500).json({ code: 'SESSION_CREATION_FAILED', message: 'Unable to create a user session at this time.' });
        }

        return res.status(200).json({ code: 'AUTH_SUCCESS', message: 'Password verified and session created successfully.', userData: result[0] });
    }
    catch (error) {
        console.error('Error in verifyUserPassword:', error);
        return res.status(500).json({ code: 'SERVER_ERROR', message: 'An unexpected error occurred during password verification.', error: error.message });
    }
}

// Sends a one-time password (OTP) to the user's email or mobile
export const sendOneTimePassword = async (req, res) => {
    try {
        const { loginId: identifier, loginType: method } = req.body;

        if (!identifier || !method) {
            return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Both login identifier and login method are required.' });
        }

        const sql = `SELECT unique_id FROM users WHERE email = ? OR mobile = ?`;
        const params = [identifier, identifier];
        const result = await query(sql, params);

        if (result.length === 0) {
            return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User account not found.' });
        }

        const otp = generateOtp();
        const otpSessionId = uuidv4();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

        // Store OTP in the database
        const insertOtpSql = `INSERT INTO otps (session_id, otp, expires_at, login_type, login_id) VALUES (?, ?, ?, ?, ?)`;
        const otpParams = [otpSessionId, otp, expiresAt, method, identifier];
        const otpInsertResult = await query(insertOtpSql, otpParams);

        if (otpInsertResult.affectedRows === 0) {
            return res.status(500).json({ code: 'OTP_STORE_FAILED', message: 'Failed to store the OTP. Please try again later.' });
        }

        const message = `${otp} is your verification code. It will expire in 5 minutes.`;
        let sendResponse = false;

        if (method === 'EMAIL') {
            sendResponse = await sendOtpEmail({ toEmail: identifier, otp });
        } else {
            sendResponse = await sendSMS({ to: identifier, body: message });
        }

        if (!sendResponse) {
            return res.status(500).json({ code: 'OTP_SEND_FAILED', message: 'Failed to send the OTP. Please try again later.' });
        }

        res.cookie('otp_session_id', otpSessionId, {
            ...COOKIE_OPTIONS,
            maxAge: 5 * 60 * 1000,
        });

        return res.status(200).json({ code: 'OTP_SENT', message: 'One-time password sent successfully.' });
    } catch (error) {
        handleError('auth.controller.js', 'sendOneTimePassword', res, error, 'An unexpected error occurred while sending the OTP.');
    }
};

// Verifies the provided OTP and creates a session if valid
export const verifyOneTimePassword = async (req, res) => {
    try {
        const { OTP } = req.body;
        const otpSessionId = req.cookies?.otp_session_id;

        if (!otpSessionId || !OTP) {
            return res.status(400).json({ code: 'INVALID_REQUEST', message: 'OTP and session identifier are required.' });
        }

        const otpSql = `SELECT * FROM otps WHERE session_id = ? AND otp = ? AND expires_at > NOW()`;
        const params = [otpSessionId, OTP];
        const otpResults = await query(otpSql, params);

        if (otpResults.length === 0) {
            return res.status(401).json({ code: 'INVALID_OTP', message: 'The provided OTP is invalid or has expired.' });
        }

        // Fetch user details
        const userSql = `SELECT unique_id, first_name, last_name, mobile, email, profile_picture FROM users WHERE email = ? OR mobile = ?`;
        const userParams = [otpResults[0].login_id, otpResults[0].login_id];
        const userResults = await query(userSql, userParams);

        if (userResults.length === 0) {
            return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User account not found.' });
        }

        // Create session and tokens for OTP-based login
        const sessionId = await createUserSession(req, res, { ...userResults[0], loginId: result[0].login_id, loginType: result[0].login_type });

        // Check if session creation failed
        if (!sessionId) {
            return res.status(500).json({ code: 'SESSION_CREATION_FAILED', message: 'Failed to create a user session.', });
        }

        res.clearCookie('otp_session_id');

        return res.status(200).json({
            code: 'OTP_VERIFIED',
            message: 'OTP verified and session created successfully.',
            sessionId,
            userData: userResults[0],
        });
    } catch (error) {
        handleError("auth.controller.js", 'verifyOneTimePassword', res, error, 'An unexpected error occurred during OTP verification.');
    }
}

// Creates a new user session, issues JWT tokens, and sets them as cookies
const createUserSession = async (req, res, userData) => {
    try {
        const sessionId = uuidv4();
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const ipAddress = req.ip || 'Unknown';
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        const { unique_id, loginId, loginType } = userData;

        const refreshToken = jwt.sign(
            { userDetails: { ...userData, password: null }, type: 'refresh' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
        );

        const accessToken = jwt.sign(
            { userDetails: { ...userData, password: null }, type: 'access' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );


        // Revoke all old sessions for the same user and user-agent
        const revokeSql = `UPDATE user_sessions SET  is_revoke = ? WHERE  user_id = ? AND user_agent = ?`;
        const revokeParams = [1, unique_id, userAgent];
        await query(revokeSql, revokeParams);

        const sessionSql = `INSERT INTO user_sessions (session_id, user_id, user_agent, login_id, login_type, ip_address, expires_at, refresh_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const sessionParams = [sessionId, unique_id, userAgent, loginId, loginType, ipAddress, expiresAt, refreshToken];
        const sessionResult = await query(sessionSql, sessionParams);

        if (sessionResult.affectedRows === 0) {
            return null;
        }

        res.cookie('accessToken', accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        });

        res.cookie('refreshToken', refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        });

        return sessionId;
    } catch (error) {
        console.log('Error in createUserSession', error)
        return null;
    }
};

// Initiates a password reset request by generating a reset token and sending a reset email
export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Email is required for password reset.' });
        }

        const sql = `SELECT unique_id, email FROM users WHERE email = ?`;
        const params = [email];
        const result = await query(sql, params);

        if (result.length === 0) {
            return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'No user account found with the provided email address.' });
        }

        const user = result[0];
        const resetToken = uuidv4();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration

        // Store the reset token in the database
        const tokenSql = `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`;
        const tokenParams = [user.unique_id, resetToken, expiresAt];
        const response = await query(tokenSql, tokenParams);

        // Send the reset password email
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const emailResponse = await sendOtpEmail({
            toEmail: user.email,
            subject: 'Password Reset Request',
            otp: resetLink,
            type: "reset"
        });

        if (!emailResponse) {
            return res.status(500).json({ code: 'EMAIL_SEND_FAILED', message: 'Unable to send the password reset email. Please try again later.' });
        }

        return res.status(200).json({ code: 'RESET_EMAIL_SENT', message: 'A password reset link has been sent to your email address.' });
    } catch (error) {
        handleError("auth.controller.js", 'requestPasswordReset', res, error, 'An error occurred while processing the password reset request.');
    }
};

// Resets the user password using a valid reset token
export const performPasswordReset = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Both reset token and new password are required.' });
        }

        const tokenSql = `SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()`;
        const tokenParams = [token];
        const tokenResult = await query(tokenSql, tokenParams);

        if (tokenResult.length === 0) {
            return res.status(401).json({ code: 'INVALID_TOKEN', message: 'The password reset token is invalid or has expired.' });
        }

        const tokenData = tokenResult[0];
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateSql = `UPDATE users SET password = ? WHERE unique_id = ?`;
        const updateParams = [hashedPassword, tokenData.user_id];
        await query(updateSql, updateParams);

        const deleteSql = `DELETE FROM password_reset_tokens WHERE token = ?`;
        await query(deleteSql, [token]);

        return res.status(200).json({ code: 'PASSWORD_RESET_SUCCESS', message: 'Your password has been reset successfully.' });

    } catch (error) {
        handleError("auth.controller.js", 'performPasswordReset', res, error, 'An error occurred while resetting the password.');
    }
};

// Validates if a given password reset token is valid
export const validatePasswordResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({ code: 'INVALID_REQUEST', message: 'A reset token is required.' });
        }

        const tokenSql = `SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()`;
        const tokenParams = [token];
        const tokenResult = await query(tokenSql, tokenParams);

        if (tokenResult.length === 0) {
            return res.status(401).json({ code: 'INVALID_TOKEN', message: 'The reset token is invalid or has expired.' });
        }

        return res.status(200).json({ code: 'VALID_TOKEN', message: 'The reset token is valid.' });
    } catch (error) {
        handleError("auth.controller.js", 'validatePasswordResetToken', res, error, 'An error occurred while validating the reset token.');
    }
}

// Validates whether the current user session is active
export const validateActiveUserSession = async (req, res) => {
    try {
        const { unique_id } = req.user;
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken || !unique_id) {
            return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing authentication tokens or user identifier.' });
        }

        const revokeSql = `SELECT * FROM user_sessions WHERE is_revoke = 0 AND user_id = ? AND user_agent = ? AND refresh_token = ?`;
        const revokeParams = [unique_id, userAgent, refreshToken];
        const sessions = await query(revokeSql, revokeParams);

        if (sessions.length > 0) {
            return res.status(200).json({ code: 'AUTHORIZED', message: 'Active session confirmed.' });
        } else {
            return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Session is not active or has expired.' });
        }

    } catch (error) {
        handleError("auth.controller.js", 'validateActiveUserSession', res, error, 'An error occurred while validating the user session.');
    }

}

// Logs out the user by revoking the current session
export const logoutUser = async (req, res) => {
    try {

        const userAgent = req.headers['user-agent'] || 'Unknown';
        const unique_id = req.user?.unique_id

        const revokeSql = `UPDATE user_sessions SET  is_revoke = ? WHERE  user_id = ? AND user_agent = ?`;
        const revokeParams = [1, unique_id, userAgent];
        const result = await query(revokeSql, revokeParams);

        if (result.affectedRows > 0) {
            return res.status(200).json({ code: 'LOGOUT_SUCCESS', message: 'You have been logged out successfully.' });
        } else {
            return res.status(400).json({ code: 'LOGOUT_FAILED', message: 'Logout failed. Please try again.' });
        }
    } catch (error) {
        handleError("auth.controller.js", 'logOut', res, error, 'error occurred during logout.');
    }
}