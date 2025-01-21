import query from "../utils/query.utils.js";
import bcrypt from 'bcrypt';
import { createUniqueId, handleError } from "../utils/utils.js";

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


export const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, mobileNo, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `INSERT INTO users (unique_id, first_name, last_name, mobile, email, password) VALUES (?, ?, ?, ?, ?, ?)`;
        const result = await query(sql, [createUniqueId('USER'),firstName, lastName, mobileNo, email, hashedPassword]);

        if (result?.affectedRows > 0) {
            return res.status(201).json({ message: 'User created successfully' });
        } else {
            return res.status(400).json({ message: 'Failed to create user' });
        }
        
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            handleError('user.controller.js', 'registerUser', res, error, 'Email or mobile already exists')
        } else {
            handleError('user.controller.js', 'registerUser', res, error, error.message)
        }
    }
}
