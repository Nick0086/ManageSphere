use `managesphere`;

CREATE TABLE users (
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
);

CREATE TABLE user_sessions (
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
);

CREATE TABLE otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id CHAR(36) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    login_type VARCHAR(45) NOT NULL,
    login_id VARCHAR(45) NOT NULL,
    expires_at TIMESTAMP NOT NULL
);

CREATE TABLE password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,  -- Reference to users.unique_id
    token CHAR(36) NOT NULL UNIQUE,  -- UUID as a unique identifier
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(unique_id)
);

-- ===== menu =====

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,  -- UUID as a unique identifier
    user_id CHAR(36) NOT NULL,  -- Should match the type of users.unique_id
    name VARCHAR(255) NOT NULL,
    status INT DEFAULT 1,
    position INT DEFAULT 0,  -- Drag-and-drop sorting
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(unique_id) ON DELETE CASCADE
);

CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,  -- UUID as a unique identifier
    user_id CHAR(36) NOT NULL,  -- Each item belongs to a user (café)
    category_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_details JSON,
    veg_status ENUM('veg', 'non_veg') NOT NULL DEFAULT 'veg',
    availability ENUM('in_stock', 'out_of_stock') DEFAULT 'in_stock',
    status INT DEFAULT 1,
    position INT DEFAULT 0,  -- Drag-and-drop sorting
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(unique_id) ON DELETE CASCADE
);

CREATE TABLE templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,  -- UUID for the template
    user_id CHAR(36) NOT NULL,           -- Owner of the template (café admin)
    name VARCHAR(255) NOT NULL,          -- Template name (e.g., "Modern Coffee Shop")
    config JSON NOT NULL,                -- Template settings (colors, fonts, layout)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(unique_id) ON DELETE CASCADE
);

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

CREATE TABLE orders (
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
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    order_id CHAR(36) NOT NULL,
    menu_item_id CHAR(36) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,  -- Snapshot of price at order time
    special_instructions TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(unique_id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(unique_id)
);

-- Table: invoice_templates
-- Purpose: Defines reusable invoice layouts
CREATE TABLE invoice_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    user_id CHAR(36) NOT NULL,  -- Reference to users.unique_id
    name VARCHAR(255) NOT NULL,
    header_content TEXT,
    footer_content TEXT,
    logo_url VARCHAR(255),
    snapshot_version_id CHAR(36) NOT NULL UNIQUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(unique_id) ON DELETE CASCADE
);

-- Table: tax_configurations
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

-- Table: additional_charges
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

-- Table: invoices
-- remove
-- Purpose: Represents generated invoices
-- CREATE TABLE invoices (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     unique_id CHAR(36) NOT NULL UNIQUE,
--     order_id CHAR(36) NOT NULL,  -- Reference to orders.unique_id
--     invoice_template_id CHAR(36) NOT NULL,  -- Reference to invoice_templates.unique_id
--     invoice_number VARCHAR(50) NOT NULL,
--     invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     subtotal DECIMAL(10,2) NOT NULL,  -- Matches orders.total_amount
--     tax_amount DECIMAL(10,2) DEFAULT 0,  -- Sum from invoice_taxes
--     additional_charges DECIMAL(10,2) DEFAULT 0,  -- Sum from invoice_additional_charges
--     discount_amount DECIMAL(10,2) DEFAULT 0,
--     total_amount DECIMAL(10,2) NOT NULL,  -- subtotal + tax_amount + additional_charges - discount_amount
--     header_content TEXT,  -- Snapshot from invoice_templates
--     footer_content TEXT,  -- Snapshot from invoice_templates
--     logo_url VARCHAR(255),  -- Snapshot from invoice_templates
--     payment_method VARCHAR(50),
--     payment_status ENUM('pending', 'paid', 'partially_paid') DEFAULT 'pending',
--     notes TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (order_id) REFERENCES orders(unique_id) ON DELETE CASCADE,
--     FOREIGN KEY (invoice_template_id) REFERENCES invoice_templates(unique_id) ON DELETE CASCADE
-- );

-- Table: invoice_taxes
-- remove
-- Purpose: Stores snapshot of taxes applied to each invoice
-- CREATE TABLE invoice_taxes (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     invoice_id CHAR(36) NOT NULL,  -- Reference to invoices.unique_id
--     tax_name VARCHAR(100) NOT NULL,
--     tax_rate DECIMAL(5,2) NOT NULL,  -- Snapshot of rate at invoice time
--     tax_type ENUM('percentage', 'fixed') NOT NULL,
--     tax_amount DECIMAL(10,2) NOT NULL,  -- Calculated tax amount
--     FOREIGN KEY (invoice_id) REFERENCES invoices(unique_id) ON DELETE CASCADE
-- );

-- Table: invoice_additional_charges
-- remove
-- Purpose: Stores snapshot of additional charges applied to each invoice
-- CREATE TABLE invoice_additional_charges (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     invoice_id CHAR(36) NOT NULL,  -- Reference to invoices.unique_id
--     charge_name VARCHAR(100) NOT NULL,
--     charge_type ENUM('fixed', 'percentage') NOT NULL,
--     charge_rate DECIMAL(5,2),  -- Percentage rate if charge_type is 'percentage', else NULL
--     charge_amount DECIMAL(10,2) NOT NULL,  -- Calculated charge amount
--     FOREIGN KEY (invoice_id) REFERENCES invoices(unique_id) ON DELETE CASCADE
-- );

CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    order_id CHAR(36) NOT NULL,  -- Reference to orders.unique_id
    invoice_template_id CHAR(36) NOT NULL,  -- Reference to invoice_templates.unique_id
    snapshot_version_id CHAR(36) NOT NULL,  -- Reference to template_tax_snapshots.unique_id
    invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    header_content TEXT,  -- Snapshot from invoice_templates
    footer_content TEXT,  -- Snapshot from invoice_templates
    logo_url VARCHAR(255),  -- Snapshot from invoice_templates
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'paid', 'partially_paid') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (invoice_template_id) REFERENCES invoice_templates(unique_id) ON DELETE CASCADE
);

CREATE TABLE template_tax_snapshots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    snapshot_version_id CHAR(36) NOT NULL,  -- Groups taxes for a specific template version
    user_id CHAR(36) NOT NULL,  -- Reference to users.unique_id
    invoice_id CHAR(36) NOT NULL,  -- Reference to invoices.unique_id
    name VARCHAR(100) NOT NULL,
    rate DECIMAL(5,2) NOT NULL,
    tax_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
    applies_to ENUM('all', 'food', 'beverage', 'specific_items') NOT NULL DEFAULT 'all',
    is_additional BOOLEAN DEFAULT FALSE,
    is_compound BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoice_templates(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(unique_id) ON DELETE CASCADE
);

CREATE TABLE template_charge_snapshots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    snapshot_version_id CHAR(36) NOT NULL,  -- Groups charges for a specific template version
    invoice_id CHAR(36) NOT NULL,  -- Reference to invoices.unique_id
    user_id CHAR(36) NOT NULL,  -- Reference to users.unique_id
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    charge_type ENUM('fixed', 'percentage') NOT NULL DEFAULT 'fixed',
    applies_to ENUM('all', 'delivery', 'dine_in', 'takeaway') NOT NULL DEFAULT 'all',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoice_templates(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(unique_id) ON DELETE CASCADE
);