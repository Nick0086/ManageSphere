import { createUniqueId, handleError } from "../utils/utils.js";
import query from "../utils/query.utils.js";
import multer from "multer";
import { deleteResourceFromCloudinary, uploadStreamToCloudinary } from "../services/cloudinary/cloudinary.service.js";
import sharp from 'sharp';

const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only JPEG And PNG files are allowed'));
        }
        cb(null, true);
    }
});

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
    image_details JSON,
    availability ENUM('in_stock', 'out_of_stock') DEFAULT 'in_stock',
    veg_status ENUM('veg', 'non_veg') NOT NULL DEFAULT 'veg',
    status INT DEFAULT 1,
    position INT DEFAULT 0,  -- Drag-and-drop sorting
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(unique_id) ON DELETE CASCADE
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

export const getAllCategory = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const filterParams = [userId];

        let sql = `
            SELECT 
                categories.*, 
                COUNT(menu_items.id) AS menu_item_count
            FROM 
                categories
            LEFT JOIN 
                menu_items ON categories.unique_id = menu_items.category_id
            WHERE 
                categories.user_id = ?
            GROUP BY 
                categories.id
        `;

        // Fetch categories with menu item counts
        const result = await query(sql, filterParams);

        return res.status(200).json({
            success: true,
            message: result?.length > 0 ? "Categories fetched successfully" : "No categories found.",
            categories: result || [],
            status: "success"
        });

    } catch (error) {
        handleError('menu.controller.js', 'getAllCategory', res, error, 'An unexpected error occurred while fetching categories.');
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
        const position = (parseInt(categoryCountResult?.total || 0) || 0) + 1;
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


// Enhanced input validation with more specific checks
const validateMenuItemInput = ({ name, price, availability }, res) => {
    if (!name || typeof name !== 'string' || name.trim() === '' || name.length > 255) {
        return res.status(400).json({
            status: "error",
            code: "INVALID_NAME",
            message: "Menu Item name must be a non-empty string and less than 255 characters"
        });
    }

    const parsedPrice = parseFloat(price);
    if (!price || isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
            status: "error",
            code: "INVALID_PRICE",
            message: "Menu Item Price is required and must be a valid positive number"
        });
    }

    if (availability && !['in_stock', 'out_of_stock'].includes(availability)) {
        return res.status(400).json({ status: "error", code: "INVALID_AVAILABILITY", message: "Availability must be 'in_stock' or 'out_of_stock'" });
    }
    return false; // Return false if validation passes
};

// Optimized duplicate check
const checkForDuplicateMenuItem = async (userId, categoryId, name, excludeMenuItemId = null) => {
    const queryStr = excludeMenuItemId
        ? 'SELECT COUNT(*) AS total FROM menu_items WHERE user_id = ? AND name = ? AND category_id = ? AND unique_id != ?'
        : 'SELECT COUNT(*) AS total FROM menu_items WHERE user_id = ? AND name = ? AND category_id = ?';
    const params = excludeMenuItemId
        ? [userId, name, categoryId, excludeMenuItemId]
        : [userId, name, categoryId];

    const [result] = await query(queryStr, params);
    return result?.total > 0;
};

const verifyCategoryExists = async (categoryId, userId) => {
    try {
        const [category] = await query(
            'SELECT 1 FROM categories WHERE unique_id = ? AND user_id = ?',
            [categoryId, userId]
        );
        return !!category; // Returns true if category exists, false otherwise
    } catch (error) {
        console.error('Error verifying category:', error);
        throw new Error('Database error while verifying category');
    }
};

// Position calculation remains the same
const calculateMenuItemPosition = async (userId, categoryId) => {
    const [menuItemCountResult] = await query(
        'SELECT COUNT(*) AS total FROM menu_items WHERE user_id = ? AND category_id = ?',
        [userId, categoryId]
    );
    return (menuItemCountResult?.total || 0) + 1;
};

// Enhanced image upload with better error handling
const handleImageUpload = async (file, userId, menuItemId) => {
    if (!file) return null;

    const { originalname, buffer, mimetype } = file;
    const fileName = `${menuItemId}_${Date.now()}_${originalname}`
    const key = `menuItem/${userId}`; // Added timestamp to prevent overwrite conflicts
    // Check file size (buffer.length is in bytes, 1MB = 1048576 bytes)
    let processedBuffer = buffer;

    // Compress images larger than 1MB
    if (buffer.length > 500 * 1024) {
        try {

            // Process image with Sharp - works reliably on servers
            processedBuffer = await sharp(buffer)
                // Convert to JPEG with compression
                .jpeg({
                    quality: 20,
                    mozjpeg: true
                })
                .toBuffer();

            console.log(`Original size: ${buffer.length / 1024} KB`);
            console.log(`Compressed size: ${processedBuffer.length / 1024} KB`);

            if (processedBuffer.length > 250 * 1024) {
                processedBuffer = await sharp(processedBuffer)
                    .jpeg({
                        quality: 10,
                        mozjpeg: true
                    })
                    .toBuffer();
                console.log(`Further compressed size: ${(processedBuffer.length / 1024).toFixed(2)} KB`);
            }

            // If compression didn't reduce size enough, try more aggressive settings
            // if (processedBuffer.length > 300 * 1024) {
            //     processedBuffer = await sharp(buffer)
            //         .jpeg({
            //             quality: 30,
            //             mozjpeg: true
            //         })
            //         .toBuffer();
            //     console.log(`Further compressed size: ${processedBuffer.length / 1024} KB`);
            // }
        } catch (err) {
            console.error("Error compressing image:", err);
            // Fall back to original buffer if compression fails
            processedBuffer = buffer;
        }
    }

    // Set compression options based on file size
    const options = {
        folder: key,
        public_id: fileName,
        resource_type: 'auto',
        overwrite: false,
        format: 'webp',
    };

    try {
        const fileUploadResult = await uploadStreamToCloudinary(processedBuffer, options);
        if (!fileUploadResult?.secure_url) {
            throw new Error('Upload succeeded but no secure URL returned');
        }

        return {
            fileName: originalname,
            public_id: fileName,
            fileMimeType: 'image/webp',
            path: key,
            url: fileUploadResult.secure_url
        };
    } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        throw error; // Let caller handle the error
    }
};

export const getAllMenuItems = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const filterParams = [userId];

        let sql = `
            SELECT menu_items.*, categories.name AS category_name
            FROM menu_items
            JOIN categories ON menu_items.category_id = categories.unique_id
            WHERE menu_items.user_id = ?
        `;

        // Fetch menu items with category names
        const result = await query(sql, filterParams);

        return res.status(200).json({
            success: true,
            message: result?.length > 0 ? "Menu items fetched successfully" : "No menu items found.",
            menuItems: result || [],
            status: "success"
        });

    } catch (error) {
        handleError('menu.controller.js', 'getAllMenuItems', res, error, 'An unexpected error occurred while fetching menu items.');
    }
};

export const addMenuItem = async (req, res) => {
    try {
        // Middleware to handle file upload
        await new Promise((resolve, reject) => {
            upload.single('cover_image')(req, res, (err) => {
                if (err) {
                    console.error("Error uploading image:", err);
                    return res.status(400).json({
                        status: "error",
                        code: "IMAGE_UPLOAD_ERROR",
                        message: err.message || "Error while uploading the image"
                    });
                }
                resolve();
            });
        });

        const { unique_id: userId } = req.user;
        const { category_id, name, description, price, availability, veg_status } = req.body;

        // Validate inputs
        const validationError = validateMenuItemInput({ name, price, availability }, res);
        if (validationError) return;

        const trimmedName = name.trim();

        const categoryExists = await verifyCategoryExists(category_id, userId)
        if (!categoryExists) {
            return res.status(400).json({
                status: "error",
                code: "INVALID_CATEGORY",
                message: "Category not found or does not belong to user"
            });
        }

        // Check for duplicate menu item name within the same category
        // Check for duplicates
        const isDuplicate = await checkForDuplicateMenuItem(userId, category_id, trimmedName);
        if (isDuplicate) {
            return res.status(400).json({
                status: "error",
                code: "MENU_ITEM_EXISTS",
                message: `Menu Item ${trimmedName} already exists in this category`
            });
        }

        // Calculate position
        const position = await calculateMenuItemPosition(userId, category_id);
        const menuItemId = createUniqueId('MI');

        // Handle image upload
        let coverImageDetails = null;
        if (req.file) {
            coverImageDetails = await handleImageUpload(req.file, userId, menuItemId);
            if (!coverImageDetails) {
                return res.status(500).json({
                    status: "error",
                    code: "IMAGE_UPLOAD_FAILED",
                    message: "Failed to upload the image to Cloudinary"
                });
            }
        }

        // Insert the new menu item into the database
        const insertResult = await query(
            'INSERT INTO menu_items (unique_id, user_id, category_id, name, description, price, image_details, availability, status, position, veg_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [menuItemId, userId, category_id, trimmedName, description || null, parseFloat(price), coverImageDetails ? JSON.stringify(coverImageDetails) : null, availability, 1, position, veg_status])

        if (insertResult?.affectedRows > 0) {
            return res.status(201).json({
                status: "success",
                message: `Menu Item ${trimmedName} added successfully`,
                data: { unique_id: menuItemId }
            });
        }

        return res.status(500).json({
            status: "error",
            code: "MENU_ITEM_ADD_FAILED",
            message: `Failed to add Menu Item "${trimmedName}"`
        });
    } catch (error) {
        handleError('menu.controller.js', 'addMenuItem', res, error, 'An unexpected error occurred while adding the Menu Item');
    }
}

export const updateMenuItem = async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            upload.single('cover_image')(req, res, (err) => {
                if (err) {
                    console.error("Error uploading image:", err);
                    return res.status(400).json({
                        status: "error",
                        code: "IMAGE_UPLOAD_ERROR",
                        message: err.message || "Error while uploading the image"
                    });
                }
                resolve();
            });
        });

        const { unique_id: userId } = req.user;
        const { category_id, name, description, price, availability, status, veg_status } = req.body;
        const { menuItemId } = req.params;

        // Validate inputs
        const validationError = validateMenuItemInput({ name, price, availability }, res);
        if (validationError) return;

        const trimmedName = name.trim();

        // Verify menu item exists
        const [existingMenuItem] = await query(
            'SELECT * FROM menu_items WHERE unique_id = ? AND user_id = ?',
            [menuItemId, userId]
        );
        if (!existingMenuItem) {
            return res.status(404).json({
                status: "error",
                code: "MENU_ITEM_NOT_FOUND",
                message: "Menu Item not found or you do not have permission to update it"
            });
        }

        // Verify category exists
        const categoryExists = await verifyCategoryExists(category_id, userId)
        if (!categoryExists) {
            return res.status(400).json({
                status: "error",
                code: "INVALID_CATEGORY",
                message: "Category not found or does not belong to user"
            });
        }

        const isDuplicate = await checkForDuplicateMenuItem(userId, category_id, trimmedName, menuItemId);
        if (isDuplicate) {
            return res.status(400).json({
                status: "error",
                code: "MENU_ITEM_EXISTS",
                message: `Menu Item ${trimmedName} already exists in this category`
            });
        }



        // Handle image
        let coverImageDetails = existingMenuItem.image_details ? existingMenuItem.image_details : null;
        if (req.file) {
            if (coverImageDetails?.path) {
                await deleteResourceFromCloudinary(`${coverImageDetails.path}/${coverImageDetails.public_id}`);
            }
            coverImageDetails = await handleImageUpload(req.file, userId, menuItemId);
            if (!coverImageDetails) {
                return res.status(500).json({
                    status: "error",
                    code: "IMAGE_UPLOAD_FAILED",
                    message: "Failed to upload the image to Cloudinary"
                });
            }
        }

        // Execute the update query
        const updateQuery = `UPDATE menu_items SET category_id = ?, name = ?, description = ?, price = ?, image_details = ? , availability = ?, status = ? , veg_status = ? WHERE unique_id = ? AND user_id = ?`;
        const queryParams = [category_id, name, description || null, parseFloat(price), coverImageDetails ? JSON.stringify(coverImageDetails) : null, availability, status, veg_status, menuItemId, userId];
        const updateResult = await query(updateQuery, queryParams);

        if (updateResult?.affectedRows > 0) {
            return res.status(200).json({
                status: "success",
                message: `Menu Item ${name} updated successfully`
            });
        }

        return res.status(500).json({
            status: "error",
            code: "MENU_ITEM_UPDATE_FAILED",
            message: `Failed to update Menu Item ${existingMenuItem?.name}`
        });
    } catch (error) {
        handleError('menu.controller.js', 'updateMenuItem', res, error, 'An unexpected error occurred while updating the Menu Item');
    }
};


// =============== template ================

export const getAllTemplatesList = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const filterParams = [userId];

        const sql = `SELECT id, unique_id, user_id, name, created_at, updated_at FROM templates WHERE user_id = ?`;

        const result = await query(sql, filterParams);

        return res.status(200).json({
            success: true,
            message: result?.length > 0 ? "Templates fetched successfully" : "No Template found.",
            templates: result || [],
            status: "success"
        });

    } catch (error) {
        handleError('menu.controller.js', 'getAllTemplatesList', res, error, 'An unexpected error occurred while fetching Template.');
    }
}

export const getTemplateDataById = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const { templateId } = req.params;
        const filterParams = [userId, templateId];
        
        const sql = `SELECT * FROM templates WHERE user_id = ? AND unique_id = ?`;
        
        const result = await query(sql, filterParams);
        
        return res.status(200).json({
            success: true,
            message: result?.length > 0 ? "Template fetched successfully" : "No template found.",
            template: result?.[0] || null,  // Changed from templates: result || [] to template: result?.[0] || null
            status: "success"
        });
    } catch (error) {
        handleError('template.controller.js', 'getTemplateDataById', res, error, 'An unexpected error occurred while fetching template.');
    }
}

export const createTemplate = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const { name, config } = req.body;

        const trimmedName = name.trim();

        const existingTemplate = await query(`SELECT name FROM templates WHERE name = ? AND user_id = ?`, [trimmedName, userId]);

        if (existingTemplate?.length > 0) {
            return res.status(400).json({
                status: "error",
                code: "TEMPLATE_NAME_ALREADY_EXISTS",
                message: `Template name ${trimmedName} already exists`
            });
        }

        const templateId = createUniqueId('TEMP');
        const queryParams = [templateId, trimmedName, JSON.stringify(config || {}), userId];
        const sql = `INSERT INTO templates (unique_id, name, config, user_id) VALUES (?, ?, ?, ?)`;

        const result = await query(sql, queryParams);

        if (result.affectedRows > 0) {
            return res.status(201).json({
                status: "success",
                message: `Template ${trimmedName} created successfully`,
                template: result.insertId,
                status: "success"
            });
        } else {
            return res.status(400).json({
                status: "error",
                code: "TEMPLATE_CREATION_FAILED",
                message: "Failed to create Template"
            });
        }

    } catch (error) {
        handleError('menu.controller.js', 'addTemplate', res, error, 'An unexpected error occurred while creating the Template.');

    }
}

export const updateTemplate = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const { templateId } = req.params;
        const { name, config } = req.body;
        const trimmedName = name.trim();

        // Ensure the template exists and belongs to the user
        const existingTemplates = await query(`SELECT * FROM templates WHERE unique_id = ? AND user_id = ?`, [templateId, userId]);
        if (!existingTemplates || existingTemplates?.length === 0) {
            return res.status(404).json({
                status: "error",
                code: "TEMPLATE_NOT_FOUND",
                message: "Template not found."
            });
        }

        // If updating the name, check that no other template has the same name
        if (trimmedName && trimmedName !== existingTemplates[0].name) {
            const duplicateName = await query(
                `SELECT unique_id FROM templates WHERE name = ? AND user_id = ? AND unique_id != ?`,
                [trimmedName, userId, templateId]
            );
            if (duplicateName.length > 0) {
                return res.status(400).json({
                    status: "error",
                    code: "TEMPLATE_NAME_ALREADY_EXISTS",
                    message: `Template name "${trimmedName}" already exists.`
                });
            }
        }

        const updateQuery = `UPDATE templates SET name = ? , config = ? WHERE unique_id = ? AND user_id = ?`;
        const updateParams = [trimmedName, JSON.stringify(config || {}), templateId, userId];

        const result = await query(updateQuery, updateParams);

        if (result?.affectedRows > 0) {
            return res.status(200).json({
                status: "success",
                message: `Template ${trimmedName} updated successfully.`
            });
        } else {
            return res.status(400).json({
                status: "error",
                code: "TEMPLATE_UPDATE_FAILED",
                message: "Failed to update template."
            });
        }
    } catch (error) {
        handleError('template.controller.js', 'updateTemplate', res, error, 'An unexpected error occurred while updating the template.');
    }
};
