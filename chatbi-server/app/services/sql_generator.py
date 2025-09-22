from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.database import DatabaseSchema
from app.services.ollama_service import ollama_service
import re
import json

class SQLGenerator:
    def __init__(self):
        self.system_prompt = """You are an expert SQL generator. Your task is to convert natural language queries into valid MySQL SQL statements.

Rules:
1. Only generate SELECT statements unless explicitly asked for INSERT, UPDATE, or DELETE
2. Always use proper MySQL syntax
3. Use table and column names exactly as provided in the schema
4. Include appropriate WHERE clauses, JOINs, GROUP BY, ORDER BY as needed
5. Return only the SQL statement without any explanation or markdown formatting
6. If the query is ambiguous, make reasonable assumptions based on common business logic
7. Use LIMIT clause for queries that might return large result sets
8. Always use proper SQL formatting with appropriate spacing and line breaks

Schema information will be provided in the format:
Table: table_name
Columns: column1 (type), column2 (type), ...
"""
    
    async def get_schema_info(self, db: Session) -> str:
        """Get database schema information"""
        schema_records = db.query(DatabaseSchema).all()
        
        if not schema_records:
            return "No schema information available"
        
        # Group by table
        tables = {}
        for record in schema_records:
            if record.table_name not in tables:
                tables[record.table_name] = {
                    'columns': [],
                    'comment': record.table_comment
                }
            
            column_info = f"{record.column_name} ({record.data_type})"
            if record.column_comment:
                column_info += f" -- {record.column_comment}"
            
            tables[record.table_name]['columns'].append(column_info)
        
        # Format schema info
        schema_info = "Database Schema:\n"
        for table_name, table_info in tables.items():
            schema_info += f"\nTable: {table_name}"
            if table_info['comment']:
                schema_info += f" -- {table_info['comment']}"
            schema_info += "\nColumns:\n"
            for column in table_info['columns']:
                schema_info += f"  - {column}\n"
        
        return schema_info
    
    def clean_sql(self, sql: str) -> str:
        """Clean and validate generated SQL"""
        # Remove any markdown formatting
        sql = re.sub(r'```sql\n?', '', sql)
        sql = re.sub(r'```\n?', '', sql)
        
        # Remove extra whitespace
        sql = ' '.join(sql.split())
        
        # Ensure it ends with semicolon
        if not sql.strip().endswith(';'):
            sql = sql.strip() + ';'
        
        return sql
    
    async def generate_sql(self, natural_query: str, db: Session) -> str:
        """Generate SQL from natural language query"""
        try:
            # Get schema information
            schema_info = await self.get_schema_info(db)
            
            # Construct the prompt
            prompt = f"""
{schema_info}

Natural Language Query: {natural_query}

Generate a MySQL SQL query for this request:
"""
            
            # Generate SQL using Ollama
            generated_sql = await ollama_service.generate_response(
                prompt=prompt,
                system_prompt=self.system_prompt
            )
            
            # Clean the generated SQL
            clean_sql = self.clean_sql(generated_sql)
            
            return clean_sql
            
        except Exception as e:
            raise Exception(f"SQL generation failed: {str(e)}")
    
    def validate_sql(self, sql: str) -> bool:
        """Basic SQL validation"""
        sql_lower = sql.lower().strip()
        
        # Check if it's a valid SQL statement
        if not any(sql_lower.startswith(cmd) for cmd in ['select', 'insert', 'update', 'delete']):
            return False
        
        # Check for balanced parentheses
        if sql.count('(') != sql.count(')'):
            return False
        
        # Check for basic SQL injection patterns (simple check)
        dangerous_patterns = [
            'drop table', 'drop database', 'truncate', 'alter table',
            'create table', 'create database', '--', '/*', '*/'
        ]
        
        for pattern in dangerous_patterns:
            if pattern in sql_lower:
                return False
        
        return True

sql_generator = SQLGenerator()