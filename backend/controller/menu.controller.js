import { createUniqueId, handleError } from "../utils/utils.js";
import query from "../utils/query.utils.js";

/*CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,  -- UUID as a unique identifier
    user_id CHAR(36) NOT NULL,  -- Should match the type of users.unique_id
    name VARCHAR(255) NOT NULL,
    status INT DEFAULT 1,
    position INT DEFAULT 0,  -- Drag-and-drop sorting
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(unique_id) ON DELETE CASCADE
); */

/*
    CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,  -- UUID as a unique identifier
    user_id CHAR(36) NOT NULL,  -- Each item belongs to a user (café)
    category_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    availability ENUM('in_stock', 'out_of_stock') DEFAULT 'in_stock',
    status INT DEFAULT 1,
    position INT DEFAULT 0,  -- Drag-and-drop sorting
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(unique_id) ON DELETE CASCADE
);
*/

export const getAllCategory = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const filterParams = [userId];

        let sql = `SELECT * FROM categories WHERE user_id = ?`;

        // Fetch categories
        const result = await query(sql, filterParams);

        return res.status(200).json({
            success: true,
            message: result?.length > 0 ? "Categories fetched successfully" : "No categories found.",
            categories: result || [],
            status: "success"
        });

    } catch (error) {
        handleError('menu.controller.js', 'getCategory', res, error, 'An unexpected error occurred while fetching categories.');
    }
};

export const addCategory = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const categoryId = createUniqueId('CAT');
        const { name } = req.body;

        // Check if category with the same name already exists
        const [categoryExists] = await query('SELECT COUNT(*) AS total FROM categories WHERE user_id = ? AND name = ?', [userId, name]);

        if (categoryExists?.total > 0) {
            return res.status(400).json({ code: 'CATEGORY_EXISTS', message: `Category ${name} already exists.` });
        }

        // Get the total number of categories for this user to set the position
        const [categoryCountResult] = await query('SELECT COUNT(*) AS total FROM categories WHERE user_id = ?', [userId]);
        const totalCategories = categoryCountResult?.total || 0;

        // Insert new category
        const insertQuery = `INSERT INTO categories (unique_id, user_id, name, status, position) VALUES (?, ?, ?, ?, ?)`;
        const values = [categoryId, userId, name, 1, parseInt(totalCategories || 0) + 1];
        const result = await query(insertQuery, values);

        if (result?.affectedRows > 0) {
            return res.status(201).json({ code: 'CATEGORY_ADDED', message: `Category ${name} added successfully.` });
        } else {
            return res.status(500).json({ code: 'CATEGORY_ADD_FAILED', message: `Failed to add category ${name}.` });
        }
    } catch (error) {
        handleError('menu.controller.js', 'addCategory', res, error, 'An unexpected error occurred while adding the category.');
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const { name, status } = req.body;
        const { categoryId } = req.params;

        // Check if another category with the same name exists
        const [categoryCheck] = await query('SELECT COUNT(*) AS total FROM categories WHERE user_id = ? AND name = ? AND unique_id != ?', [userId, name, categoryId]);

        if (categoryCheck?.total > 0) {
            return res.status(400).json({ code: 'CATEGORY_EXISTS', message: `Category ${name} already exists.` });
        }

        const updateQuery = `UPDATE categories SET name = ?, status = ? WHERE user_id = ? AND unique_id = ?`;
        const values = [name, status, userId, categoryId];
        const result = await query(updateQuery, values);

        if (result?.affectedRows > 0) {
            return res.status(200).json({ code: 'CATEGORY_UPDATED', message: `Category ${name} updated successfully.` });
        } else {
            return res.status(400).json({ code: 'CATEGORY_UPDATE_FAILED', message: `No changes made or category not found.` });
        }
    } catch (error) {
        handleError('menu.controller.js', 'updateCategory', res, error, 'An unexpected error occurred while updating the category.');
    }
};



