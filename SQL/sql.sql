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
    user_id INT NOT NULL,  -- Each category belongs to a user (café)
    name VARCHAR(255) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    position INT DEFAULT 0,  -- Drag-and-drop sorting
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(unique_id) ON DELETE CASCADE
);

CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,  -- UUID as a unique identifier
    user_id INT NOT NULL,  -- Each item belongs to a user (café)
    category_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    availability ENUM('in_stock', 'out_of_stock') DEFAULT 'in_stock',
    status ENUM('active', 'inactive') DEFAULT 'active',
    position INT DEFAULT 0,  -- Drag-and-drop sorting
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(unique_id) ON DELETE SET NULL
);
