#!/usr/bin/env python3
"""
Test setup script for ChatBI Server
This script helps verify the system setup and creates sample data
"""

import asyncio
import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import random

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from config.settings import settings
from app.models.database import Base, create_tables
from app.services.ollama_service import ollama_service
from app.services.sql_executor import sql_executor

def create_sample_database():
    """Create sample tables and data for testing"""
    engine = create_engine(settings.database_url)
    
    # Sample schema
    sample_tables = """
    -- Users table
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

    -- Products table
    CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        price DECIMAL(10,2) NOT NULL,
        stock_quantity INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        description TEXT
    ) COMMENT 'Product catalog';

    -- Orders table
    CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        total_amount DECIMAL(10,2) NOT NULL,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        shipping_address TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    ) COMMENT 'Customer orders';

    -- Order items table
    CREATE TABLE IF NOT EXISTS order_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT,
        product_id INT,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    ) COMMENT 'Individual items in orders';
    """
    
    with engine.connect() as conn:
        # Execute table creation
        for statement in sample_tables.split(';'):
            if statement.strip():
                conn.execute(text(statement))
        conn.commit()
        
        # Insert sample users
        users_data = [
            ("john_doe", "john@example.com", "John Doe", 28, "New York"),
            ("jane_smith", "jane@example.com", "Jane Smith", 32, "Los Angeles"),
            ("bob_wilson", "bob@example.com", "Bob Wilson", 45, "Chicago"),
            ("alice_brown", "alice@example.com", "Alice Brown", 29, "Houston"),
            ("charlie_davis", "charlie@example.com", "Charlie Davis", 38, "Phoenix"),
        ]
        
        for username, email, full_name, age, city in users_data:
            conn.execute(text("""
                INSERT IGNORE INTO users (username, email, full_name, age, city, status)
                VALUES (:username, :email, :full_name, :age, :city, 'active')
            """), {
                "username": username,
                "email": email,
                "full_name": full_name,
                "age": age,
                "city": city
            })
        
        # Insert sample products
        products_data = [
            ("Laptop Pro", "Electronics", 1299.99, 50, "High-performance laptop"),
            ("Wireless Headphones", "Electronics", 199.99, 100, "Noise-canceling headphones"),
            ("Coffee Maker", "Appliances", 89.99, 30, "Automatic drip coffee maker"),
            ("Running Shoes", "Sports", 129.99, 75, "Comfortable running shoes"),
            ("Smartphone", "Electronics", 799.99, 60, "Latest smartphone model"),
            ("Desk Chair", "Furniture", 299.99, 25, "Ergonomic office chair"),
            ("Water Bottle", "Sports", 24.99, 200, "Insulated water bottle"),
            ("Cookbook", "Books", 29.99, 40, "Healthy recipes cookbook"),
        ]
        
        for name, category, price, stock, description in products_data:
            conn.execute(text("""
                INSERT IGNORE INTO products (name, category, price, stock_quantity, description)
                VALUES (:name, :category, :price, :stock, :description)
            """), {
                "name": name,
                "category": category,
                "price": price,
                "stock": stock,
                "description": description
            })
        
        # Insert sample orders
        base_date = datetime.now() - timedelta(days=90)
        for i in range(20):
            order_date = base_date + timedelta(days=random.randint(0, 90))
            user_id = random.randint(1, 5)
            total_amount = round(random.uniform(50, 500), 2)
            status = random.choice(['pending', 'confirmed', 'shipped', 'delivered'])
            
            conn.execute(text("""
                INSERT INTO orders (user_id, total_amount, order_date, status, shipping_address)
                VALUES (:user_id, :total_amount, :order_date, :status, :address)
            """), {
                "user_id": user_id,
                "total_amount": total_amount,
                "order_date": order_date,
                "status": status,
                "address": f"123 Main St, City {user_id}"
            })
        
        conn.commit()
    
    print("✓ Sample database created successfully")

async def test_ollama_connection():
    """Test Ollama service connection"""
    print("Testing Ollama connection...")
    try:
        health = await ollama_service.check_health()
        if health:
            print("✓ Ollama service is running")
            
            # Test SQL generation
            test_prompt = "Generate a simple SELECT query for users table"
            response = await ollama_service.generate_response(test_prompt)
            if response:
                print("✓ Ollama can generate responses")
                print(f"  Sample response: {response[:100]}...")
            else:
                print("✗ Ollama response is empty")
        else:
            print("✗ Ollama service is not accessible")
            return False
    except Exception as e:
        print(f"✗ Ollama connection failed: {e}")
        return False
    
    return True

async def test_database_connection():
    """Test database connection"""
    print("Testing database connection...")
    try:
        connected = await sql_executor.test_connection()
        if connected:
            print("✓ Database connection successful")
            
            # Test query execution
            result = await sql_executor.execute_query("SELECT COUNT(*) as user_count FROM users")
            if result["success"]:
                print(f"✓ Database query successful: {result}")
            else:
                print(f"✗ Database query failed: {result}")
                return False
        else:
            print("✗ Database connection failed")
            return False
    except Exception as e:
        print(f"✗ Database connection error: {e}")
        return False
    
    return True

async def test_schema_refresh():
    """Test schema refresh functionality"""
    print("Testing schema refresh...")
    try:
        from sqlalchemy.orm import sessionmaker
        from app.models.database import SessionLocal, DatabaseSchema
        
        db = SessionLocal()
        try:
            # Clear existing schema
            db.query(DatabaseSchema).delete()
            
            # Get fresh schema
            columns_info = await sql_executor.get_column_info()
            tables_info = await sql_executor.get_table_info()
            
            print(f"✓ Found {len(tables_info)} tables with {len(columns_info)} columns")
            
            # Insert schema records
            table_comments = {table["table_name"]: table["comment"] for table in tables_info}
            
            for column in columns_info:
                schema_record = DatabaseSchema(
                    table_name=column["table_name"],
                    column_name=column["column_name"],
                    data_type=column["data_type"],
                    is_nullable=column["is_nullable"],
                    column_comment=column["comment"],
                    table_comment=table_comments.get(column["table_name"])
                )
                db.add(schema_record)
            
            db.commit()
            print("✓ Schema refresh successful")
            
        finally:
            db.close()
    except Exception as e:
        print(f"✗ Schema refresh failed: {e}")
        return False
    
    return True

async def run_integration_test():
    """Run a complete integration test"""
    print("Running integration test...")
    try:
        from app.services.sql_generator import sql_generator
        from sqlalchemy.orm import sessionmaker
        from app.models.database import SessionLocal
        
        db = SessionLocal()
        try:
            # Test SQL generation
            test_query = "Show me all active users"
            generated_sql = await sql_generator.generate_sql(test_query, db)
            print(f"✓ SQL generated: {generated_sql}")
            
            # Test SQL execution
            result = await sql_executor.execute_query(generated_sql)
            if result["success"]:
                print(f"✓ SQL executed successfully: {len(result.get('data', []))} rows returned")
            else:
                print(f"✗ SQL execution failed: {result}")
                return False
                
        finally:
            db.close()
    except Exception as e:
        print(f"✗ Integration test failed: {e}")
        return False
    
    return True

async def main():
    """Main test function"""
    print("🚀 ChatBI Server Setup and Test")
    print("=" * 50)
    
    # Create database tables
    print("Creating database tables...")
    create_tables()
    print("✓ Database tables created")
    
    # Create sample data
    create_sample_database()
    
    # Run tests
    tests = [
        ("Database Connection", test_database_connection),
        ("Ollama Connection", test_ollama_connection),
        ("Schema Refresh", test_schema_refresh),
        ("Integration Test", run_integration_test),
    ]
    
    results = {}
    for test_name, test_func in tests:
        print(f"\n--- {test_name} ---")
        try:
            results[test_name] = await test_func()
        except Exception as e:
            print(f"✗ {test_name} failed with exception: {e}")
            results[test_name] = False
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{test_name:20} {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! ChatBI Server is ready to use.")
        print("\nNext steps:")
        print("1. Start the server: python run.py")
        print("2. Start the frontend: cd ../chatbi-ui && npm run dev")
        print("3. Open http://localhost:5173 in your browser")
    else:
        print("❌ Some tests failed. Please check the configuration and dependencies.")
        print("\nTroubleshooting:")
        if not results.get("Database Connection", True):
            print("- Check MySQL connection and database credentials")
        if not results.get("Ollama Connection", True):
            print("- Ensure Ollama is running: ollama serve")
            print("- Check if model is available: ollama list")

if __name__ == "__main__":
    asyncio.run(main())