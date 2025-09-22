import axios from 'axios';
import {
  QueryRequest,
  QueryResponse,
  DatabaseSchemaInfo,
  HealthResponse,
  TableInfo
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout for SQL generation
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check
  async checkHealth(): Promise<HealthResponse> {
    const response = await api.get<HealthResponse>('/health');
    return response.data;
  },

  // Query operations
  async submitQuery(request: QueryRequest): Promise<QueryResponse> {
    const response = await api.post<QueryResponse>('/query', request);
    return response.data;
  },

  async getQueryHistory(limit = 50, offset = 0): Promise<QueryResponse[]> {
    const response = await api.get<QueryResponse[]>('/history', {
      params: { limit, offset }
    });
    return response.data;
  },

  async deleteQueryHistory(queryId: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/history/${queryId}`);
    return response.data;
  },

  // Schema operations
  async getDatabaseSchema(): Promise<DatabaseSchemaInfo[]> {
    const response = await api.get<DatabaseSchemaInfo[]>('/schema');
    return response.data;
  },

  async refreshDatabaseSchema(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/schema/refresh');
    return response.data;
  },

  async getTables(): Promise<{ tables: TableInfo[] }> {
    const response = await api.get<{ tables: TableInfo[] }>('/tables');
    return response.data;
  },
};

export default apiService;