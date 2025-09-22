export interface QueryRequest {
  query: string;
  execute: boolean;
}

export interface QueryResponse {
  id?: number;
  natural_language_query: string;
  generated_sql: string;
  execution_result?: Record<string, any>[] | null;
  execution_time?: number;
  status: string;
  created_at?: string;
}

export interface DatabaseSchemaInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_comment?: string;
  table_comment?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

export interface ErrorResponse {
  error: string;
  detail?: string;
}

export interface TableInfo {
  table_name: string;
  comment?: string;
  estimated_rows?: number;
}