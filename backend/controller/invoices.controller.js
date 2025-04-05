import query from "../utils/query.utils.js";
import { createUniqueId, handleError } from "../utils/utils.js";
import { v4 as uuidv4 } from 'uuid';

// SQL table schemas preserved as comments...
/* -- Table: invoice_templates
-- Purpose: Defines reusable invoice layouts
CREATE TABLE invoice_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    user_id CHAR(36) NOT NULL,  -- Reference to users.unique_id
    name VARCHAR(255) NOT NULL,
    header_content TEXT,
    footer_content TEXT,
    logo_url VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(unique_id) ON DELETE CASCADE
); 
*/

/* -- Table: tax_configurations
-- Purpose: Stores current tax settings
CREATE TABLE tax_configurations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    invoice_template_id CHAR(36) NOT NULL,  -- Reference to invoice_templates.unique_id
    user_id CHAR(36) NOT NULL,  -- Reference to users.unique_id
    name VARCHAR(100) NOT NULL,
    rate DECIMAL(5,2) NOT NULL,
    tax_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
    applies_to ENUM('all', 'food', 'beverage', 'specific_items') NOT NULL DEFAULT 'all',
    is_additional BOOLEAN DEFAULT FALSE,
    is_compound BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_template_id) REFERENCES invoice_templates(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(unique_id) ON DELETE CASCADE
);
*/

/* -- Table: additional_charges
-- Purpose: Stores current additional charge settings
CREATE TABLE additional_charges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    user_id CHAR(36) NOT NULL,  -- Reference to users.unique_id
    invoice_template_id CHAR(36) NOT NULL,  -- Reference to invoice_templates.unique_id
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    charge_type ENUM('fixed', 'percentage') NOT NULL DEFAULT 'fixed',
    applies_to ENUM('all', 'delivery', 'dine_in', 'takeaway') NOT NULL DEFAULT 'all',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_template_id) REFERENCES invoice_templates(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(unique_id) ON DELETE CASCADE
);
*/

/* -- Table: invoices
-- Purpose: Represents generated invoices
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    order_id CHAR(36) NOT NULL,  -- Reference to orders.unique_id
    invoice_template_id CHAR(36) NOT NULL,  -- Reference to invoice_templates.unique_id
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL,  -- Matches orders.total_amount
    tax_amount DECIMAL(10,2) DEFAULT 0,  -- Sum from invoice_taxes
    additional_charges DECIMAL(10,2) DEFAULT 0,  -- Sum from invoice_additional_charges
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,  -- subtotal + tax_amount + additional_charges - discount_amount
    header_content TEXT,  -- Snapshot from invoice_templates
    footer_content TEXT,  -- Snapshot from invoice_templates
    logo_url VARCHAR(255),  -- Snapshot from invoice_templates
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'paid', 'partially_paid') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (invoice_template_id) REFERENCES invoice_templates(unique_id) ON DELETE CASCADE
);*/

/* -- Table: invoice_taxes
-- Purpose: Stores snapshot of taxes applied to each invoice
CREATE TABLE invoice_taxes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id CHAR(36) NOT NULL,  -- Reference to invoices.unique_id
    tax_name VARCHAR(100) NOT NULL,
    tax_rate DECIMAL(5,2) NOT NULL,  -- Snapshot of rate at invoice time
    tax_type ENUM('percentage', 'fixed') NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,  -- Calculated tax amount
    FOREIGN KEY (invoice_id) REFERENCES invoices(unique_id) ON DELETE CASCADE
);*/

/* -- Table: invoice_additional_charges
-- Purpose: Stores snapshot of additional charges applied to each invoice
CREATE TABLE invoice_additional_charges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id CHAR(36) NOT NULL,  -- Reference to invoices.unique_id
    charge_name VARCHAR(100) NOT NULL,
    charge_type ENUM('fixed', 'percentage') NOT NULL,
    charge_rate DECIMAL(5,2),  -- Percentage rate if charge_type is 'percentage', else NULL
    charge_amount DECIMAL(10,2) NOT NULL,  -- Calculated charge amount
    FOREIGN KEY (invoice_id) REFERENCES invoices(unique_id) ON DELETE CASCADE
    );*/

// Configuration constants
const MAX_BATCH_SIZE = 50;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

// Optimized batch insert with prepared statements
async function batchInsert(table, columns, rows, batchSize) {
    const batches = [];
    for (let i = 0; i < rows.length; i += batchSize) {
        batches.push(rows.slice(i, i + batchSize));
    }

    for (const batch of batches) {
        const placeholders = batch.map(() => `(${columns.map(() => '?').join(',')})`).join(',');
        const values = batch.flat();
        const sql = `INSERT INTO ${table} (${columns.join(',')}) VALUES ${placeholders}`;

        const result = await executeWithRetry(sql, values);

        if (result.affectedRows !== batch.length) {
            throw new Error(`Batch insert failed: Expected ${batch.length} rows, got ${result.affectedRows}`);
        }
    }
}

// Optimized batch update with transaction and prepared statements
async function batchUpdate(tableName, keyColumns, updateColumns, rows, errorMessage) {
    const setClause = updateColumns.map(col => `${col} = ?`).join(', ');
    const whereClause = keyColumns.map(col => `${col} = ?`).join(' AND ');
    const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`;

    try {
        const updates = rows.map(row =>
            executeWithRetry(sql, row).then(result => {
                    if (result.affectedRows === 0) {
                        throw new Error(`${errorMessage}: No rows affected`);
                    }
                    return result;
                })
        );
        await Promise.all(updates);
    } catch (error) {
        throw error;
    }
}

// Enhanced retry logic with exponential backoff
async function executeWithRetry(sql, params, maxRetries = MAX_RETRIES, initialDelay = RETRY_DELAY_MS) {
    const retryableErrors = new Set([
        'ER_LOCK_DEADLOCK',
        'ER_LOCK_WAIT_TIMEOUT',
        'ETIMEDOUT',
        'ECONNRESET'
    ]);
    let lastError;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await query(sql, params);
        } catch (error) {
            lastError = error;

            if (!retryableErrors.has(error.code) &&
                !error.message.includes('timeout') &&
                !error.message.includes('connection')) {
                throw error;
            }

            if (attempt === maxRetries - 1) break;

            const delay = initialDelay * Math.pow(2, attempt);
            console.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms: ${error.message}`);
        }
    }

    throw new Error(`Query failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
}

// Optimized function to get existing items with single query
async function getExistingItems(tableName, templateId) {
    const items = await query(`SELECT unique_id FROM ${tableName} WHERE invoice_template_id = ?`, [templateId]);
    return new Set(items.map(item => item.unique_id));
}

// Optimized function to process associated items with bulk operations
async function processAssociatedItems({
    tableName,
    parentId,
    existingItems,
    incomingItems,
    newIds,
    userId,
    columns,
    columnsComeFromUser,
    itemIdentifier
}) {
    try {
        const existingSet = new Set(existingItems);
        const incomingIds = new Set(incomingItems.map(item => item.unique_id).filter(Boolean));

        // Efficiently determine items to delete
        const itemsToDelete = [...existingSet].filter(id => !incomingIds.has(id));
        // Bulk delete removed items
        if (itemsToDelete.length > 0) {
            await executeWithRetry(`DELETE FROM ${tableName} WHERE unique_id IN (?)`,[itemsToDelete]);
        }

        // Prepare bulk updates and inserts
        const updates = [];
        const inserts = [];
        let newIdIndex = 0;


        for (const item of incomingItems) {
            if (item.unique_id) {
                updates.push([...columnsComeFromUser.map(col => item[col]), item.unique_id]);
            } else {
                inserts.push([newIds[newIdIndex++], parentId, userId, ...columnsComeFromUser.map(col => item[col])]);
            }
        }

        // Execute bulk operations
        if (updates.length > 0) {
            await batchUpdate(tableName, ['unique_id'], columns, updates, `Failed to update ${itemIdentifier}`);
        }

        if (inserts.length > 0) {
            await batchInsert(tableName, ['unique_id', 'invoice_template_id', 'user_id', ...columns], inserts, MAX_BATCH_SIZE);
        }
    } catch (error) {
        console.log('error', error);
    }
}

// Main controller functions
export const createInvoiceTemplate = async (req, res) => {
    try {
        const { name, headerText, footerText, logoUrl, tax_configurations = [], additional_charges = [], isDefault } = req.body;
        const { unique_id: userId } = req.user;

        // Input validation
        if (!name?.trim() || name.trim().length > 255) {
            return res.status(400).json({
                status: "error",
                code: "INVALID_NAME",
                message: "Invalid invoice template name"
            });
        }

        if (!Array.isArray(tax_configurations) || !Array.isArray(additional_charges)) {
            return res.status(400).json({
                status: "error",
                code: "INVALID_INPUT",
                message: "Tax configurations and additional charges must be arrays"
            });
        }

        const invoiceTemplateName = name.trim();

        // Check for duplicate name
        const [exists] = await query('SELECT 1 FROM invoice_templates WHERE user_id = ? AND name = ?', [userId, invoiceTemplateName]);

        if (exists) {
            return res.status(400).json({
                status: "error",
                code: "DUPLICATE_NAME",
                message: "Template name already exists"
            });
        }

        // Generate IDs
        const templateId = createUniqueId('IT');
        const taxIds = Array(tax_configurations.length).fill().map(() => uuidv4());
        const chargeIds = Array(additional_charges.length).fill().map(() => uuidv4());

        // Execute transaction

        try {
            // Create template
            await query('INSERT INTO invoice_templates (unique_id, user_id, name, header_content, footer_content, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?)',[templateId, userId, invoiceTemplateName, headerText, footerText, logoUrl]);

            if(isDefault){
                await executeWithRetry('UPDATE invoice_templates SET is_default = 0 WHERE user_id = ?',[userId]);
                await executeWithRetry('UPDATE invoice_templates SET is_default = 1 WHERE unique_id = ?',[templateId]);
            }

            // Process tax configurations and additional charges
            if (tax_configurations.length) {
                await batchInsert(
                    'tax_configurations',
                    ['unique_id', 'invoice_template_id', 'user_id', 'name', 'rate', 'tax_type', 'applies_to', 'is_additional', 'is_compound', 'is_active'],
                    tax_configurations.map((tax, i) => [
                        taxIds[i],
                        templateId,
                        userId,
                        tax.name,
                        tax.rate,
                        tax.tax_type || 'percentage',
                        tax.applies_to || 'all',
                        tax.is_additional || false,
                        tax.is_compound || false,
                        tax.is_active || true
                    ]),
                    MAX_BATCH_SIZE
                );
            }

            if (additional_charges.length) {
                await batchInsert(
                    'additional_charges',
                    ['unique_id', 'invoice_template_id', 'user_id', 'name', 'amount', 'charge_type', 'applies_to', 'is_active'],
                    additional_charges.map((charge, i) => [
                        chargeIds[i],
                        templateId,
                        userId,
                        charge.name,
                        charge.amount,
                        charge.type || 'fixed',
                        charge.applies_to || 'all',
                        charge.is_active || true
                    ]),
                    MAX_BATCH_SIZE
                );
            }

            return res.status(201).json({
                status: "success",
                message: "Invoice template created successfully",
                data: {
                    templateId,
                    name: invoiceTemplateName,
                    taxCount: tax_configurations.length,
                    chargeCount: additional_charges.length
                }
            });

        } catch (error) {
            throw error;
        }

    } catch (error) {
        handleError('invoices.controller.js', 'createInvoiceTemplate', res, error);
    }
}

// Update invoice template
export const updateInvoiceTemplate = async (req, res) => {
    try {
        const { templateId } = req.params;
        const { name, headerText, footerText, logoUrl, tax_configurations = [], additional_charges = [], isDefault } = req.body;
        const { unique_id: userId } = req.user;

        // Input validation
        if (!name?.trim() || name.trim().length > 255) {
            return res.status(400).json({
                status: "error",
                code: "INVALID_NAME",
                message: "Invalid invoice template name"
            });
        }

        if (!Array.isArray(tax_configurations) || !Array.isArray(additional_charges)) {
            return res.status(400).json({
                status: "error",
                code: "INVALID_INPUT",
                message: "Tax configurations and additional charges must be arrays"
            });
        }

        const invoiceTemplateName = name.trim();

        // Verify template ownership
        const template = await query('SELECT 1 FROM invoice_templates WHERE unique_id = ? AND user_id = ?', [templateId, userId]);

        if (!template.length) {
            return res.status(404).json({
                status: "error",
                code: "NOT_FOUND",
                message: "Template not found or access denied"
            });
        }

        // Check for name conflicts
        const [nameConflict] = await query('SELECT 1 FROM invoice_templates WHERE user_id = ? AND name = ? AND unique_id != ?', [userId, invoiceTemplateName, templateId]);

        if (nameConflict) {
            return res.status(400).json({
                status: "error",
                code: "DUPLICATE_NAME",
                message: "Template name already exists"
            });
        }

        // Generate IDs for new items
        const newTaxIds = Array(tax_configurations.filter(t => !t.unique_id).length).fill().map(() => uuidv4());
        const newChargeIds = Array(additional_charges.filter(c => !c.unique_id).length).fill().map(() => uuidv4());


        try {
            // Update template
            await query('UPDATE invoice_templates SET name = ?, header_content = ?, footer_content = ?, logo_url = ? WHERE unique_id = ?', [invoiceTemplateName, headerText, footerText, logoUrl, templateId]);

            if(isDefault){
                await executeWithRetry('UPDATE invoice_templates SET is_default = 0 WHERE user_id = ?',[userId]);
                await executeWithRetry('UPDATE invoice_templates SET is_default = 1 WHERE unique_id = ?',[templateId]);
            }

            // Process associated items
            const existingTaxes = await getExistingItems('tax_configurations', templateId);
            const existingCharges = await getExistingItems('additional_charges', templateId);

            await Promise.all([
                processAssociatedItems({
                    tableName: 'tax_configurations',
                    parentId: templateId,
                    existingItems: existingTaxes,
                    incomingItems: tax_configurations,
                    newIds: newTaxIds,
                    userId,
                    columns: ['name', 'rate', 'applies_to'],
                    columnsComeFromUser: ['name', 'rate', 'appliesTo'],
                    itemIdentifier: 'tax configuration'
                }),
                processAssociatedItems({
                    tableName: 'additional_charges',
                    parentId: templateId,
                    existingItems: existingCharges,
                    incomingItems: additional_charges,
                    newIds: newChargeIds,
                    userId,
                    columns: ['name', 'amount', 'charge_type'],
                    columnsComeFromUser: ['name', 'amount', 'type'],
                    itemIdentifier: 'additional charge'
                })
            ]);

            return res.status(200).json({
                status: "success",
                message: "Invoice template updated successfully",
                data: {
                    templateId,
                    name: invoiceTemplateName,
                    taxCount: tax_configurations.length,
                    chargeCount: additional_charges.length
                }
            });

        } catch (error) {
            throw error;
        }

    } catch (error) {
        handleError('invoices.controller.js', 'updateInvoiceTemplate', res, error);
    }
}

// get all invoice templates
export const getAllInvoiceTemplates = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;

        const templates = await query(
            'SELECT id, unique_id, name, is_default, created_at FROM invoice_templates WHERE user_id = ?',
            [userId]
        );

        return res.status(200).json({
            status: "success",
            data: templates
        });

    } catch (error) {
        handleError('invoices.controller.js', 'getAllInvoiceTemplates', res, error);
    }
}

// get invoice template by id
export const getInvoiceTemplateById = async (req, res) => {
    try {
        const { templateId } = req.params;
        const { unique_id: userId } = req.user;

        const template = await query(
            'SELECT unique_id, name, created_at FROM invoice_templates WHERE unique_id = ? AND user_id = ?',
            [templateId, userId]
        );

        if (!template.length) {
            return res.status(404).json({
                status: "error",
                code: "NOT_FOUND",
                message: "Template not found or access denied"
            });
        }

        return res.status(200).json({
            status: "success",
            data: template
        });

    } catch (error) {
        handleError('invoices.controller.js', 'getInvoiceTemplateById', res, error);
    }
}

// get all invoice templates with their associated items use left join
export const getAllInvoiceTemplatesWithItems = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;

        // get all invoice templates with their associated items use left join and get array of tax_configurations and additional_charges with invoce row
        const templates = await query(
            'SELECT invoice_templates.*, tax_configurations.*, additional_charges.* FROM invoice_templates LEFT JOIN tax_configurations ON invoice_templates.unique_id = tax_configurations.invoice_template_id LEFT JOIN additional_charges ON invoice_templates.unique_id = additional_charges.invoice_template_id WHERE invoice_templates.user_id = ?',
            [userId]
        );

        // return array of invoice templates with their associated items
        const invoiceTemplatesWithItems = templates.map(template => {
            return {
                ...template,
                tax_configurations: template.tax_configurations,
                additional_charges: template.additional_charges
            };
        });

        return res.status(200).json({
            status: "success",
            data: invoiceTemplatesWithItems
        });

    } catch (error) {
        handleError('invoices.controller.js', 'getAllInvoiceTemplatesWithItems', res, error);
    }
}

// get invoice template by id with their associated items
export const getInvoiceTemplateByIdWithItems = async (req, res) => {
    try {
        const { templateId } = req.params;
        const { unique_id: userId } = req.user;

        // Step 1: Get the basic invoice template first
        const templateQuery = `SELECT * FROM invoice_templates WHERE unique_id = ? AND user_id = ?LIMIT 1`;
        const [templateResults] = await query(templateQuery, [templateId, userId]);

        if (!templateResults || templateResults.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Invoice template not found"
            });
        }

        const template = templateResults[0] || templateResults;

        // Step 2: Get tax configurations separately
        const taxConfigQuery = `SELECT id, unique_id, name as tax_name, rate as tax_percentage, tax_type, applies_to, is_additional, is_compound, is_active, created_at, updated_at FROM tax_configurations WHERE invoice_template_id = ?`;
        const taxConfigurations = await query(taxConfigQuery, [templateId]);

        // Step 3: Get additional charges separately
        const additionalChargesQuery = `SELECT id, unique_id, name as charge_name, amount as charge_amount, charge_type, applies_to, is_active, created_at, updated_at FROM additional_charges WHERE invoice_template_id = ?`;

        const additionalCharges = await query(additionalChargesQuery, [templateId]);

        // Step 4: Combine the results
        const result = {
            ...template,
            tax_configurations: taxConfigurations || [],
            additional_charges: additionalCharges || []
        };

        return res.status(200).json({
            status: "success",
            data: result
        });

    } catch (error) {
        handleError('invoices.controller.js', 'getInvoiceTemplateByIdWithItems', res, error);
    }
};

// set default invoice template 
export const setDefaultInvoiceTemplate = async (req, res) => {
    try {
        const { templateId } = req.params;
        const { unique_id: userId } = req.user;

        await query('UPDATE invoice_templates SET is_default = 0 WHERE user_id = ?', [userId]);
        await query('UPDATE invoice_templates SET is_default = 1 WHERE unique_id = ?', [templateId]);

        return res.status(200).json({
            status: "success",
            message: "Default invoice template set successfully"
        });
    } catch (error) {
        handleError('invoices.controller.js', 'setDefaultInvoiceTemplate', res, error);
    }
}

