# ChatBI Server

A natural language to SQL conversion API built with FastAPI, LangChain, and Ollama.

## Features

- Convert natural language queries to SQL
- Execute generated SQL queries
- Query history management
- Database schema introspection
- RESTful API with OpenAPI documentation

## Requirements

- Python 3.8+
- MySQL database
- Ollama with a language model (e.g., llama2)

## Installation

1. Clone the repository and navigate to the server directory
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables in `.env`:
   ```env
   DATABASE_URL=mysql+pymysql://username:password@localhost:3306/chatbi_db
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama2
   ```

4. Start Ollama service:
   ```bash
   ollama serve
   ollama pull llama2  # or your preferred model
   ```

5. Create MySQL database:
   ```sql
   CREATE DATABASE chatbi_db;
   ```

## Running the Server

```bash
# Development mode
python run.py

# Or using uvicorn directly
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

- `GET /` - Server status
- `GET /api/v1/health` - Health check
- `POST /api/v1/query` - Generate and optionally execute SQL
- `GET /api/v1/history` - Get query history
- `DELETE /api/v1/history/{id}` - Delete query from history
- `GET /api/v1/schema` - Get database schema
- `POST /api/v1/schema/refresh` - Refresh schema information
- `GET /api/v1/tables` - Get table list

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Usage Example

```python
import requests

# Generate SQL from natural language
response = requests.post("http://localhost:8000/api/v1/query", json={
    "query": "Show me all users who registered last month",
    "execute": False
})

print(response.json())
```

## Configuration

Key configuration options in `.env`:

- `DATABASE_URL`: MySQL connection string
- `OLLAMA_BASE_URL`: Ollama service URL
- `OLLAMA_MODEL`: Language model to use
- `API_HOST`: Server host (default: 0.0.0.0)
- `API_PORT`: Server port (default: 8000)
- `DEBUG`: Enable debug mode (default: True)

## Database Schema

The application automatically creates the following tables:
- `query_history`: Stores query history and results
- `database_schema`: Caches database schema information

## Troubleshooting

1. **Ollama connection issues**: Ensure Ollama is running on the correct port
2. **Database connection issues**: Verify MySQL credentials and database exists
3. **SQL generation issues**: Check if the database schema is properly refreshed

## Development

The project structure:
```
chatbi-server/
├── app/
│   ├── api/          # API routes
│   ├── models/       # Database and Pydantic models
│   ├── services/     # Business logic services
│   └── main.py       # FastAPI application
├── config/           # Configuration
├── requirements.txt  # Dependencies
└── run.py           # Application runner
```