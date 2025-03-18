import query from "../utils/query.utils.js";
import { handleError } from "../utils/utils.js";

/* 
CREATE TABLE tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    user_id CHAR(36) NOT NULL,
    template_id CHAR(36) NOT NULL,
    table_number VARCHAR(50) NOT NULL,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES templates(unique_id) ON DELETE CASCADE
);
*/

/*CREATE TABLE templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,  -- UUID for the template
    user_id CHAR(36) NOT NULL,           -- Owner of the template (café admin)
    name VARCHAR(255) NOT NULL,          -- Template name (e.g., "Modern Coffee Shop")
    config JSON NOT NULL,                -- Template settings (colors, fonts, layout)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(unique_id) ON DELETE CASCADE
);*/

export const getMenuForCustomerByTableId = async (req, res) => {
    try {
        const { tableId, userId } = req.params;
        
        const table = await query('SELECT * FROM tables WHERE unique_id = ? AND user_id = ?', [tableId, userId]);
        
        if (!table.length) {
            return res.status(404).json({ status: "error", code: "TABLE_NOT_FOUND", message: "Table not found." });
        }
        
        const menuTemplate = await query(`SELECT * FROM templates WHERE unique_id = ? AND user_id = ?`, 
            [table[0].template_id, userId]);
        
        if (!menuTemplate || menuTemplate.length === 0) {
            return res.status(404).json({
                status: "error",
                code: "TEMPLATE_NOT_FOUND",
                message: "Menu template not found."
            });
        }
        
        return res.status(200).json({
            status: "success",
            message: "Menu retrieved successfully.",
            menu: menuTemplate[0]
        });
    } catch (error) {
        handleError('tables.controller.js', 'getMenuForCustomerByTableId', res, error, 'An unexpected error occurred while retrieving the menu.');
    }
};