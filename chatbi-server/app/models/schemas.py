from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class QueryRequest(BaseModel):
    query: str
    execute: bool = False

class QueryResponse(BaseModel):
    id: Optional[int] = None
    natural_language_query: str
    generated_sql: str
    execution_result: Optional[List[Dict[str, Any]]] = None
    execution_time: Optional[int] = None
    status: str = "success"
    created_at: Optional[datetime] = None

class DatabaseSchemaInfo(BaseModel):
    table_name: str
    column_name: str
    data_type: str
    is_nullable: str
    column_comment: Optional[str] = None
    table_comment: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str = "1.0.0"