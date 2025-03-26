import query from "../utils/query.utils.js";
import { createUniqueId, handleError } from "../utils/utils.js";

/* CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    restaurant_id CHAR(36) NOT NULL,  -- users.unique_id (cafe owner)
    table_id CHAR(36) NOT NULL,
    status ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES users(unique_id),
    FOREIGN KEY (table_id) REFERENCES tables(unique_id)
); */

/* CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    order_id CHAR(36) NOT NULL,
    menu_item_id CHAR(36) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,  -- Snapshot of price at order time
    special_instructions TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(unique_id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(unique_id)
); */

async function executeWithRetry(sql, params, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const result = await query(sql, params);
            if (result.affectedRows === 1) {
                return result;
            }
            console.warn(`Attempt ${attempt + 1}: No rows affected for query: ${sql}`);
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed: ${error.message}`);
            if (attempt === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
        }
    }
    throw new Error(`Failed to affect rows after ${maxRetries} attempts`);
}

export const getAllOrders = async (req, res) => {
    try {
        // Parse query parameters
        const { limit = 20, offset = 0 } = req.query;
        const { unique_id: restaurantId } = req.user;
        const { filter = {} } = req.body;

        const filterMap = {
            'status': "o.status IN (?)",
            'table': "o.table_id IN (?)",
            'id': "o.unique_id LIKE ?"
        };

        let whereClause = 'WHERE o.restaurant_id = ?';
        let params = [restaurantId];

        Object.keys(filter)?.forEach((key) => {
            if (filter[key] && filter[key] !== ' ' && Array.isArray(filter[key]) && filter[key].length > 0) {
                whereClause += ` AND ${filterMap[key]} `;
                params.push(filter[key]);
            } else if (filter[key] && filter[key] !== ' ' && key === 'id') {
                whereClause += ` AND ${filterMap[key]} `;
                params.push(`%${filter[key]}%`);
            }
        });

        // Query to fetch orders with item count
        const queryStr = ` SELECT o.*, t.table_number as table_name FROM orders o LEFT JOIN tables t ON t.unique_id = o.table_id ${whereClause} GROUP BY o.id ORDER BY o.created_at DESC  LIMIT ? OFFSET ? `;
        const results = await query(queryStr, [...params, parseInt(limit), parseInt(offset)]);

        const countQuery = ` SELECT COUNT(*) as total FROM orders o ${whereClause}`;
        const countResult = await query(countQuery, params);
        const total = countResult[0].total;

        // Send response
        res.status(201).json({ success: true, data: results, metadata: { total, limit: parseInt(limit), offset: parseInt(offset) } });
    } catch (error) {
        handleError('order.controller.js', 'getAllOrders', res, error, 'Failed to fetch orders');
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { unique_id: restaurantId } = req.user;

        const order = await query("SELECT o.*, t.table_number as table_name FROM orders o LEFT JOIN tables t ON t.unique_id = o.table_id WHERE o.unique_id = ? AND o.restaurant_id = ?", [orderId, restaurantId]);

        if (order.length === 0) { return res.status(404).json({ success: false, message: "Order not found" }); }

        const orderItems = await query("SELECT oi.*, mi.name as menu_item_name , mi.veg_status as veg_status FROM order_items oi LEFT JOIN menu_items mi ON mi.unique_id = oi.menu_item_id WHERE order_id = ?", [orderId]);

        res.status(201).json({ success: true, message: "Order fetched successfully.", order : { ...order[0], items: orderItems } });

} catch (error) {
    handleError('order.controller.js', 'getOrderById', res, error, 'Failed to fetch order');
}
};


export const createOrder = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { items, tableId, totalAmount } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Order items are required and must be an array" });
        }

        if (!tableId) {
            return res.status(400).json({ success: false, message: "Table ID is required" });
        }

        // Validate quantities
        for (const item of items) {
            if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
                return res.status(400).json({ success: false, message: "Quantity must be a positive integer" });
            }
        }

        // **Step 2: Check Table Existence**
        const tableRecord = await query("SELECT * FROM tables WHERE unique_id = ? AND user_id = ?", [tableId, restaurantId]);

        if (tableRecord.length === 0) {
            return res.status(400).json({
                status: "error",
                code: "TABLE_NOT_FOUND",
                message: "Table does not exist or does not belong to the restaurant.",
            });
        }

        // **Step 3: Validate Menu Items and Calculate Total**
        const menuItemIds = items.map((item) => item.unique_id);
        const placeholders = menuItemIds.map(() => "?").join(",");

        const menuItems = await query(`SELECT unique_id, price FROM menu_items WHERE unique_id IN (${placeholders}) AND user_id = ?`, [...menuItemIds, restaurantId]);


        if (menuItems.length !== menuItemIds.length) {
            return res.status(400).json({
                success: false,
                message: "Some menu items do not exist or do not belong to the restaurant",
            });
        }

        // Create a price map and calculate total
        const menuItemMap = {};

        menuItems.forEach((item) => {
            menuItemMap[item.unique_id] = item.price;
        });

        // **Step 4: Transaction with Promise Pool**
        await query("START TRANSACTION", []);

        try {
            // Insert order with retry
            const orderUniqueId = createUniqueId("ORD");
            const orderSql = `INSERT INTO orders (unique_id, restaurant_id, table_id, status, total_amount) VALUES (?, ?, ?, 'pending', ?)`;
            await executeWithRetry(orderSql, [orderUniqueId, restaurantId, tableId, totalAmount]);

            // Insert order items with retry
            for (const item of items) {
                const orderItemUniqueId = createUniqueId("OI");
                const price = menuItemMap[item.unique_id];
                const itemSql = `INSERT INTO order_items (unique_id, order_id, menu_item_id, quantity, price, special_instructions) VALUES (?, ?, ?, ?, ?, ?)`;
                await executeWithRetry(itemSql, [orderItemUniqueId, orderUniqueId, item.unique_id, item.quantity, price, item.special_instructions || null]);
            }

            // Commit transaction
            await query("COMMIT", []);
            res.status(201).json({ success: true, message: "Order created successfully.", orderId: orderUniqueId });

        } catch (error) {
            await query("ROLLBACK", []);
            throw error;
        }

    } catch (error) {
        handleError("order.controller.js", "createOrder", res, error, "An unexpected error occurred while creating the order.");
    }
};