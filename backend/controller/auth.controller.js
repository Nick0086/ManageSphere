import query from "../utils/query.utils.js";
import bcrypt from 'bcrypt';

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

        const sql = `SELECT password FROM users WHERE email = ? OR mobile = ?`;
        const params = [loginId, loginId];
        const result = await query(sql, params);

        if (result.length === 0) {return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User not found' });}

        const hashedPassword = result[0].password;
        const isValid = await bcrypt.compare(password, hashedPassword);

        if (!isValid) {return res.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' });}

        return res.status(200).json({ code: 'PASSWORD_VERIFIED', message: 'Password verified' });
    }
    catch (error) {
        console.log("Error in verifyPassword: ", error);
        return res.status(500).json({message: 'Internal server error', error: error.message});
    }
}