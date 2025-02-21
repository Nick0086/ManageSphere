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
        const { name } = req.body;
        

        // Validate category name
        if (!name || typeof name !== 'string' || name.trim() === '' || name.length > 255) {
            return res.status(400).json({
                status: "error",
                code: "INVALID_NAME",
                message: "Category name must be a non-empty string and less than 255 characters"
            });
        }

        // Check for duplicate category name
        const [categoryExists] = await query(
            'SELECT COUNT(*) AS total FROM categories WHERE user_id = ? AND name = ?',
            [userId, name.trim()]
        );
        if (categoryExists?.total > 0) {
            return res.status(400).json({
                status: "error",
                code: "CATEGORY_EXISTS",
                message: `Category ${name} already exists`
            });
        }

        // Calculate the next position
        const [categoryCountResult] = await query(
            'SELECT COUNT(*) AS total FROM categories WHERE user_id = ?',
            [userId]
        );
        const position = (categoryCountResult?.total || 0) + 1;
        const categoryId = createUniqueId('CAT');

        // Insert new category
        const insertQuery = `
            INSERT INTO categories (unique_id, user_id, name, status, position)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [categoryId, userId, name.trim(), 1, position];
        const result = await query(insertQuery, values);

        if (result?.affectedRows > 0) {
            return res.status(201).json({
                status: "success",
                message: `Category ${name} added successfully`,
                data: { categoryId }
            });
        }
        return res.status(500).json({
            status: "error",
            code: "CATEGORY_ADD_FAILED",
            message: `Failed to add category ${name}`
        });
    } catch (error) {
        handleError('menu.controller.js', 'addCategory', res, error, 'An unexpected error occurred while adding the category');
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const { name, status } = req.body;
        const { categoryId } = req.params;

        // Validate inputs
        if (!name || typeof name !== 'string' || name.trim() === '' || name.length > 255) {
            return res.status(400).json({
                status: "error",
                code: "INVALID_NAME",
                message: "Category name must be a non-empty string and less than 255 characters"
            });
        }
        if (typeof status !== 'number' || ![0, 1].includes(status)) {
            return res.status(400).json({
                status: "error",
                code: "INVALID_STATUS",
                message: "Status must be 0 or 1"
            });
        }

        // Check if the category exists
        const [category] = await query(
            'SELECT 1 FROM categories WHERE user_id = ? AND unique_id = ?',
            [userId, categoryId]
        );
        if (!category) {
            return res.status(404).json({
                status: "error",
                code: "CATEGORY_NOT_FOUND",
                message: "Category not found"
            });
        }

        // Check for duplicate category name (excluding current category)
        const [categoryCheck] = await query(
            'SELECT COUNT(*) AS total FROM categories WHERE user_id = ? AND name = ? AND unique_id != ?',
            [userId, name.trim(), categoryId]
        );
        if (categoryCheck?.total > 0) {
            return res.status(400).json({
                status: "error",
                code: "CATEGORY_EXISTS",
                message: `Another category with name ${name} already exists`
            });
        }

        // Update the category
        const updateQuery = `
            UPDATE categories
            SET name = ?, status = ?
            WHERE user_id = ? AND unique_id = ?
        `;
        await query(updateQuery, [name.trim(), status, userId, categoryId]);

        return res.status(200).json({
            status: "success",
            message: "Category updated successfully"
        });
    } catch (error) {
        handleError('menu.controller.js', 'updateCategory', res, error, 'An unexpected error occurred while updating the category');
    }
};

