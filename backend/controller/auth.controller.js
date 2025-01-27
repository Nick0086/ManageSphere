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

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
};

export const checkUserEmailOrNumber = async (req, res) => {
    try {
        const { loginType, loginId } = req.body;

        const sql = `SELECT unique_id, first_name, last_name, mobile, email FROM users WHERE email = ? OR mobile = ?`;
        const params = [loginId, loginId];

        const result = await query(sql, params);

        if (result.length === 0) {
            return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'This account cannot be found. Please use a different account' });
        }

        return res.status(200).json({ code: 'USER_EXISTS', message: 'User exists' });

    } catch (error) {
        console.log("Error in checkUserEmailOrNumber: ", error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

export const verifyPassword = async (req, res) => {
    try {
        const { loginId, loginType, password } = req.body;

        if (!loginId || !loginType || !password) {
            return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Invalid request' });
        }

        const sql = `SELECT password, unique_id, first_name, last_name, mobile, email, profile_picture  FROM users WHERE email = ? OR mobile = ?`;
        const params = [loginId, loginId];
        const result = await query(sql, params);

        if (result?.length === 0) { return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User not found' }); }

        const hashedPassword = result[0].password;
        const isValid = await bcrypt.compare(password, hashedPassword);

        if (!isValid) { return res.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' }); }

        const isAceesTokenSet = await userSessionsManager(req, res, { ...result[0], loginId, loginType })

        // Check if session creation failed
        if (!isAceesTokenSet) {
            return res.status(500).json({ code: 'SESSION_NOT_CREATED', message: 'Failed to create session' });
        }

        return res.status(200).json({ code: 'PASSWORD_VERIFIED', message: 'Password verified' });
    }
    catch (error) {
        console.log("Error in verifyPassword: ", error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

export const sendOTP = async (req, res) => {
    try {
        const { loginId, loginType } = req.body;

        if (!loginId || !loginType) {
            return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Invalid request' });
        }

        const sql = `SELECT unique_id FROM users WHERE email = ? OR mobile = ?`;
        const params = [loginId, loginId];
        const result = await query(sql, params);

        if (result.length === 0) {
            return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User not found' });
        }

        const otp = generateOtp();
        const sessionId = uuidv4();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

        // Send OTP
        let response = false;

        // Store OTP in the database
        const otpSql = `INSERT INTO otps (session_id, otp, expires_at, login_type, login_id) VALUES (?, ?, ?, ?, ?)`;
        const otpParams = [sessionId, otp, expiresAt, loginType, loginId];
        const otpResult = await query(otpSql, otpParams);

        if (otpResult.affectedRows === 0) {
            return res.status(500).json({ code: 'OTP_STORE_FAILED', message: 'Failed to store OTP' });
        }

        const message = `${otp} is your verification code. This code will expire in 5 minutes`

        if (loginType === 'EMAIL') {
            response = await sendOtpEmail({ toEmail: loginId, otp });
        } else {
            response = await sendSMS({ to: loginId, body: message })
        }

        if (!response) {
            return res.status(500).json({ code: 'OTP_SEND_FAILED', message: 'Failed to send OTP' });
        }

        res.cookie('otp_session_id', sessionId, {
            ...COOKIE_OPTIONS,
            maxAge: 5 * 60 * 1000,
        });

        return res.status(200).json({ code: 'OTP_SENT', message: 'OTP sent successfully' });
    } catch (error) {
        handleError('auth.controller.js', 'sendOTP', res, error, 'Error in sendOTP');
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { OTP } = req.body;
        const sessionId = req.cookies?.otp_session_id;

        if (!sessionId || !OTP) {
            return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Invalid request' });
        }

        const sql = `SELECT * FROM otps WHERE session_id = ? AND otp = ? AND expires_at > NOW()`;
        const params = [sessionId, OTP];
        const result = await query(sql, params);

        if (result.length === 0) {
            return res.status(401).json({ code: 'INVALID_OTP', message: 'Invalid or expired OTP' });
        }

        // Fetch user details
        const userSql = `SELECT unique_id, first_name, last_name, mobile, email, profile_picture FROM users WHERE email = ? OR mobile = ?`;
        const userParams = [result[0].login_id, result[0].login_id];
        const userResult = await query(userSql, userParams);

        if (userResult.length === 0) {
            return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User not found' });
        }

        // Create session and tokens for OTP-based login
        const newSessionId = await userSessionsManager(req, res, { ...userResult[0], loginId: result[0].login_id, loginType: result[0].login_type });

        // Check if session creation failed
        if (!newSessionId) {
            return res.status(500).json({ code: 'SESSION_NOT_CREATED', message: 'Failed to create session' });
        }

        res.clearCookie('otp_session_id');

        return res.status(200).json({
            code: 'OTP_VERIFIED',
            message: 'OTP verified successfully',
            sessionId: newSessionId
        });
    } catch (error) {
        handleError("auth.controller.js", 'verifyOTP', res, error, 'Error in verifyOTP');
    }
}

const userSessionsManager = async (req, res, userData) => {
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
        console.log('userSessionsManager', error)
        return null;
    }
};


export const userActiveSessionCheck = async (req, res) => {
    try {
        const { unique_id } = req.user;
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const refreshToken = req.cookies?.refreshToken;

        const revokeSql = `SELECT * FROM user_sessions WHERE is_revoke = 0 AND user_id = ? AND user_agent = ? AND refresh_token = ?`;
        const revokeParams = [unique_id, userAgent, refreshToken];
        const response = await query(revokeSql, revokeParams);

        if (response?.length) {
            return res.status(200).json({ code: 'AUTHORIZED' })
        } else {
            return res.status(401).json({ message: 'Unauthorized' });
        }

    } catch (error) {
        handleError("auth.controller.js", 'userActiveSessionCheck', res, error, 'Error in userActiveSessionCheck');
    }

}