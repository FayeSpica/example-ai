from typing import List, Dict, Any, Optional
from sqlalchemy import text, create_engine
from sqlalchemy.orm import Session
from config.settings import settings
import time
import pandas as pd

class SQLExecutor:
    def __init__(self):
        self.engine = create_engine(
            settings.database_url,
            echo=settings.debug,
            pool_pre_ping=True,
            pool_recycle=300
        )
    
    async def execute_query(self, sql: str, limit: int = 1000) -> Dict[str, Any]:
        """Execute SQL query and return results"""
        start_time = time.time()
        
        try:
            # Add LIMIT if it's a SELECT query and doesn't already have one
            if sql.lower().strip().startswith('select') and 'limit' not in sql.lower():
                # Remove trailing semicolon if present
                if sql.strip().endswith(';'):
                    sql = sql.strip()[:-1]
                sql += f" LIMIT {limit};"
            
            with self.engine.connect() as connection:
                result = connection.execute(text(sql))
                
                # Handle different types of queries
                if sql.lower().strip().startswith('select'):
                    # For SELECT queries, fetch all results
                    columns = list(result.keys())
                    rows = result.fetchall()
                    
                    # Convert to list of dictionaries
                    data = []
                    for row in rows:
                        data.append(dict(zip(columns, row)))
                    
                    execution_time = int((time.time() - start_time) * 1000)
                    
                    return {
                        "success": True,
                        "data": data,
                        "columns": columns,
                        "row_count": len(data),
                        "execution_time": execution_time
                    }
                else:
                    # For INSERT, UPDATE, DELETE queries
                    affected_rows = result.rowcount
                    execution_time = int((time.time() - start_time) * 1000)
                    
                    return {
                        "success": True,
                        "affected_rows": affected_rows,
                        "execution_time": execution_time,
                        "message": f"Query executed successfully. {affected_rows} rows affected."
                    }
                    
        except Exception as e:
            execution_time = int((time.time() - start_time) * 1000)
            return {
                "success": False,
                "error": str(e),
                "execution_time": execution_time
            }
    
    async def test_connection(self) -> bool:
        """Test database connection"""
        try:
            with self.engine.connect() as connection:
                connection.execute(text("SELECT 1"))
                return True
        except:
            return False
    
    async def get_table_info(self) -> List[Dict[str, Any]]:
        """Get information about all tables in the database"""
        try:
            with self.engine.connect() as connection:
                # Get table information
                result = connection.execute(text("""
                    SELECT 
                        TABLE_NAME,
                        TABLE_COMMENT,
                        TABLE_ROWS
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_TYPE = 'BASE TABLE'
                    ORDER BY TABLE_NAME
                """))
                
                tables = []
                for row in result:
                    tables.append({
                        "table_name": row.TABLE_NAME,
                        "comment": row.TABLE_COMMENT,
                        "estimated_rows": row.TABLE_ROWS
                    })
                
                return tables
        except Exception as e:
            raise Exception(f"Failed to get table information: {str(e)}")
    
    async def get_column_info(self, table_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get column information for all tables or a specific table"""
        try:
            with self.engine.connect() as connection:
                query = """
                    SELECT 
                        TABLE_NAME,
                        COLUMN_NAME,
                        DATA_TYPE,
                        IS_NULLABLE,
                        COLUMN_DEFAULT,
                        COLUMN_COMMENT
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE()
                """
                
                if table_name:
                    query += f" AND TABLE_NAME = '{table_name}'"
                
                query += " ORDER BY TABLE_NAME, ORDINAL_POSITION"
                
                result = connection.execute(text(query))
                
                columns = []
                for row in result:
                    columns.append({
                        "table_name": row.TABLE_NAME,
                        "column_name": row.COLUMN_NAME,
                        "data_type": row.DATA_TYPE,
                        "is_nullable": row.IS_NULLABLE,
                        "default_value": row.COLUMN_DEFAULT,
                        "comment": row.COLUMN_COMMENT
                    })
                
                return columns
        except Exception as e:
            raise Exception(f"Failed to get column information: {str(e)}")

sql_executor = SQLExecutor()