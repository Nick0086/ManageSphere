import query from "../utils/query.utils.js";
import { createUniqueId, handleError } from "../utils/utils.js";

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

// Controller to retrieve all tables for the authenticated user
export const getAllTables = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const tables = await query(
            'SELECT * FROM tables WHERE user_id = ?',
            [userId]
        );

        return res.status(200).json({
            status: "success",
            message: "Tables retrieved successfully.",
            data: tables
        });
    } catch (error) {
        handleError('tables.controller.js', 'getAllTables', res, error, 'An unexpected error occurred while retrieving tables.');
    }
};

// Controller to retrieve a single table by its unique ID
export const getTableById = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const { tableId } = req.params;
        const table = await query(
            'SELECT * FROM tables WHERE unique_id = ? AND user_id = ?',
            [tableId, userId]
        );

        if (!table.length) {
            return res.status(404).json({
                status: "error",
                code: "TABLE_NOT_FOUND",
                message: "Table not found."
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Table retrieved successfully.",
            data: table[0]
        });
    } catch (error) {
        handleError('tables.controller.js', 'getTableById', res, error, 'An unexpected error occurred while retrieving the table.');
    }
};

// Controller to create one or multiple tables
export const createTables = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const { table_number: tableNumberInput, template_id: templateId } = req.body;

        // Validate that the template exists for this user
        const template = await query(
            'SELECT * FROM templates WHERE unique_id = ? AND user_id = ?',
            [templateId, userId]
        );
        if (!template.length) {
            return res.status(400).json({
                status: "error",
                code: "INVALID_TEMPLATE",
                message: "Template does not exist."
            });
        }

        // Ensure tableNumberInput is an array for consistent processing
        const tableNumbers = Array.isArray(tableNumberInput) ? tableNumberInput : [tableNumberInput];

        // Arrays to track processing results
        const existingTables = [];
        const addedTables = [];
        const failedTables = [];

        // Process each table number
        for (const table of tableNumbers) {
            const trimmedTableNumber = table.trim();

            // Check if the table already exists for the given template and user
            const [existing] = await query(
                'SELECT table_number FROM tables WHERE table_number = ? AND template_id = ? AND user_id = ?',
                [trimmedTableNumber, templateId, userId]
            );

            if (existing.length > 0) {
                existingTables.push(trimmedTableNumber);
            } else {
                const uniqueId = createUniqueId('TWQR'); // Use your unique ID generator
                const [result] = await query(
                    'INSERT INTO tables (unique_id, user_id, template_id, table_number, status) VALUES (?, ?, ?, ?, ?)',
                    [uniqueId, userId, templateId, trimmedTableNumber, 1]
                );

                if (result.affectedRows > 0) {
                    addedTables.push(trimmedTableNumber);
                } else {
                    failedTables.push(trimmedTableNumber);
                }
            }
        }

        // Build a comprehensive return message
        let message = "Tables processed successfully.";
        if (existingTables.length) {
            message += ` ${existingTables.length} table(s) already exist: ${existingTables.join(', ')}.`;
        }
        if (addedTables.length) {
            message += ` ${addedTables.length} table(s) added successfully: ${addedTables.join(', ')}.`;
        }
        if (failedTables.length) {
            message += ` ${failedTables.length} table(s) failed to add: ${failedTables.join(', ')}.`;
        }

        return res.status(200).json({
            status: "success",
            message,
            data: {
                existingTables,
                addedTables,
                failedTables
            }
        });

    } catch (error) {
        handleError('tables.controller.js', 'createTables', res, error, 'An unexpected error occurred while creating tables.');
    }
};

// Controller to update an existing table
export const updateTable = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const { tableId } = req.params;
        const { table_number: tableNumberInput, template_id: templateId } = req.body;
        const trimmedTableNumber = tableNumberInput.trim();

        // Validate that the template exists for this user
        const template = await query(
            'SELECT * FROM templates WHERE unique_id = ? AND user_id = ?',
            [templateId, userId]
        );
        if (!template.length) {
            return res.status(400).json({
                status: "error",
                code: "INVALID_TEMPLATE",
                message: "Template does not exist."
            });
        }

        // Validate that the table to update exists
        const tableRecord = await query(
            'SELECT * FROM tables WHERE unique_id = ? AND user_id = ?',
            [tableId, userId]
        );
        if (!tableRecord.length) {
            return res.status(400).json({
                status: "error",
                code: "TABLE_NOT_FOUND",
                message: "Table does not exist."
            });
        }

        // Check if any other table (other than the current one) already uses the provided table number
        const duplicateTable = await query(
            'SELECT table_number FROM tables WHERE table_number = ? AND unique_id != ? AND user_id = ?',
            [trimmedTableNumber, tableId, userId]
        );
        if (duplicateTable.length) {
            return res.status(400).json({
                status: "error",
                code: "TABLE_EXISTS",
                message: `A table with the name "${trimmedTableNumber}" already exists.`
            });
        }

        // Update the table record in the correct "tables" table
        const result = await query(
            'UPDATE tables SET table_number = ?, template_id = ? WHERE user_id = ? AND unique_id = ?',
            [trimmedTableNumber, templateId, userId, tableId]
        );

        if (result?.affectedRows > 0) {
            return res.status(200).json({
                status: "success",
                message: `Table "${trimmedTableNumber}" updated successfully.`
            });
        }

        return res.status(500).json({
            status: "error",
            code: "TABLE_UPDATE_FAILED",
            message: `Failed to update table "${trimmedTableNumber}".`
        });

    } catch (error) {
        handleError('tables.controller.js', 'updateTable', res, error, 'An unexpected error occurred while updating the table.');
    }
};