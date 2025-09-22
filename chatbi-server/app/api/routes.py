from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
import time

from app.models.database import get_db, QueryHistory, DatabaseSchema
from app.models.schemas import (
    QueryRequest, QueryResponse, DatabaseSchemaInfo, 
    ErrorResponse, HealthResponse
)
from app.services.sql_generator import sql_generator
from app.services.sql_executor import sql_executor
from app.services.ollama_service import ollama_service

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    ollama_status = await ollama_service.check_health()
    db_status = await sql_executor.test_connection()
    
    status_text = "healthy" if ollama_status and db_status else "unhealthy"
    
    return HealthResponse(
        status=status_text,
        timestamp=datetime.utcnow()
    )

@router.post("/query", response_model=QueryResponse)
async def generate_sql_query(
    request: QueryRequest,
    db: Session = Depends(get_db)
):
    """Generate SQL from natural language query"""
    try:
        start_time = time.time()
        
        # Generate SQL
        generated_sql = await sql_generator.generate_sql(request.query, db)
        
        # Validate SQL
        if not sql_generator.validate_sql(generated_sql):
            raise HTTPException(
                status_code=400,
                detail="Generated SQL failed validation"
            )
        
        execution_result = None
        execution_time = None
        query_status = "generated"
        
        # Execute SQL if requested
        if request.execute:
            exec_result = await sql_executor.execute_query(generated_sql)
            if exec_result["success"]:
                execution_result = exec_result.get("data", [])
                execution_time = exec_result["execution_time"]
                query_status = "executed"
            else:
                query_status = "error"
                raise HTTPException(
                    status_code=400,
                    detail=f"SQL execution failed: {exec_result['error']}"
                )
        
        total_time = int((time.time() - start_time) * 1000)
        
        # Save to history
        history_record = QueryHistory(
            natural_language_query=request.query,
            generated_sql=generated_sql,
            execution_result=execution_result,
            execution_time=execution_time or total_time,
            status=query_status
        )
        db.add(history_record)
        db.commit()
        db.refresh(history_record)
        
        return QueryResponse(
            id=history_record.id,
            natural_language_query=request.query,
            generated_sql=generated_sql,
            execution_result=execution_result,
            execution_time=execution_time or total_time,
            status=query_status,
            created_at=history_record.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/history", response_model=List[QueryResponse])
async def get_query_history(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get query history"""
    try:
        history = db.query(QueryHistory)\
                   .order_by(QueryHistory.created_at.desc())\
                   .offset(offset)\
                   .limit(limit)\
                   .all()
        
        return [
            QueryResponse(
                id=record.id,
                natural_language_query=record.natural_language_query,
                generated_sql=record.generated_sql,
                execution_result=record.execution_result,
                execution_time=record.execution_time,
                status=record.status,
                created_at=record.created_at
            )
            for record in history
        ]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch history: {str(e)}"
        )

@router.delete("/history/{query_id}")
async def delete_query_history(
    query_id: int,
    db: Session = Depends(get_db)
):
    """Delete a query from history"""
    try:
        record = db.query(QueryHistory).filter(QueryHistory.id == query_id).first()
        if not record:
            raise HTTPException(status_code=404, detail="Query not found")
        
        db.delete(record)
        db.commit()
        
        return {"message": "Query deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete query: {str(e)}"
        )

@router.get("/schema", response_model=List[DatabaseSchemaInfo])
async def get_database_schema(db: Session = Depends(get_db)):
    """Get database schema information"""
    try:
        schema_records = db.query(DatabaseSchema).all()
        return [
            DatabaseSchemaInfo(
                table_name=record.table_name,
                column_name=record.column_name,
                data_type=record.data_type,
                is_nullable=record.is_nullable,
                column_comment=record.column_comment,
                table_comment=record.table_comment
            )
            for record in schema_records
        ]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch schema: {str(e)}"
        )

@router.post("/schema/refresh")
async def refresh_database_schema(db: Session = Depends(get_db)):
    """Refresh database schema information"""
    try:
        # Clear existing schema
        db.query(DatabaseSchema).delete()
        
        # Get fresh schema information
        columns_info = await sql_executor.get_column_info()
        tables_info = await sql_executor.get_table_info()
        
        # Create a mapping of table names to comments
        table_comments = {table["table_name"]: table["comment"] for table in tables_info}
        
        # Insert new schema records
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
        
        return {"message": f"Schema refreshed successfully. Found {len(columns_info)} columns in {len(tables_info)} tables."}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to refresh schema: {str(e)}"
        )

@router.get("/tables")
async def get_tables():
    """Get list of tables in the database"""
    try:
        tables = await sql_executor.get_table_info()
        return {"tables": tables}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch tables: {str(e)}"
        )