-- Initialize ChatBI database with sample data

-- Create sample tables
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    age INT,
    city VARCHAR(50)
) COMMENT 'User accounts and profiles';

CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
) COMMENT 'Product catalog';

CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    total_amount DECIMAL(10,2) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
) COMMENT 'Customer orders';

CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
) COMMENT 'Individual items in orders';

-- Insert sample data
INSERT IGNORE INTO users (username, email, full_name, age, city, status) VALUES
('john_doe', 'john@example.com', 'John Doe', 28, 'New York', 'active'),
('jane_smith', 'jane@example.com', 'Jane Smith', 32, 'Los Angeles', 'active'),
('bob_wilson', 'bob@example.com', 'Bob Wilson', 45, 'Chicago', 'active'),
('alice_brown', 'alice@example.com', 'Alice Brown', 29, 'Houston', 'active'),
('charlie_davis', 'charlie@example.com', 'Charlie Davis', 38, 'Phoenix', 'inactive');

INSERT IGNORE INTO products (name, category, price, stock_quantity, description) VALUES
('Laptop Pro', 'Electronics', 1299.99, 50, 'High-performance laptop'),
('Wireless Headphones', 'Electronics', 199.99, 100, 'Noise-canceling headphones'),
('Coffee Maker', 'Appliances', 89.99, 30, 'Automatic drip coffee maker'),
('Running Shoes', 'Sports', 129.99, 75, 'Comfortable running shoes'),
('Smartphone', 'Electronics', 799.99, 60, 'Latest smartphone model'),
('Desk Chair', 'Furniture', 299.99, 25, 'Ergonomic office chair'),
('Water Bottle', 'Sports', 24.99, 200, 'Insulated water bottle'),
('Cookbook', 'Books', 29.99, 40, 'Healthy recipes cookbook');

-- Insert sample orders (with specific IDs to avoid foreign key issues)
INSERT IGNORE INTO orders (user_id, total_amount, order_date, status, shipping_address) VALUES
(1, 1499.98, '2024-01-15 10:30:00', 'delivered', '123 Main St, New York, NY'),
(2, 229.98, '2024-01-20 14:15:00', 'delivered', '456 Oak Ave, Los Angeles, CA'),
(3, 359.97, '2024-02-01 09:45:00', 'shipped', '789 Pine St, Chicago, IL'),
(4, 154.98, '2024-02-10 16:20:00', 'confirmed', '321 Elm St, Houston, TX'),
(1, 89.99, '2024-02-15 11:10:00', 'delivered', '123 Main St, New York, NY'),
(2, 824.98, '2024-02-20 13:30:00', 'pending', '456 Oak Ave, Los Angeles, CA'),
(3, 299.99, '2024-03-01 08:15:00', 'confirmed', '789 Pine St, Chicago, IL'),
(4, 54.98, '2024-03-05 15:45:00', 'delivered', '321 Elm St, Houston, TX');

-- Insert sample order items
INSERT IGNORE INTO order_items (order_id, product_id, quantity, unit_price) VALUES
-- Order 1: Laptop + Headphones
(1, 1, 1, 1299.99),
(1, 2, 1, 199.99),
-- Order 2: Headphones + Water Bottle
(2, 2, 1, 199.99),
(2, 7, 1, 24.99),
-- Order 3: Desk Chair + Running Shoes
(3, 6, 1, 299.99),
(3, 4, 1, 129.99),
-- Order 4: Running Shoes + Water Bottle
(4, 4, 1, 129.99),
(4, 7, 1, 24.99),
-- Order 5: Coffee Maker
(5, 3, 1, 89.99),
-- Order 6: Smartphone + Headphones
(6, 5, 1, 799.99),
(6, 2, 1, 199.99),
-- Order 7: Desk Chair
(7, 6, 1, 299.99),
-- Order 8: Cookbook + Water Bottle
(8, 8, 1, 29.99),
(8, 7, 1, 24.99);