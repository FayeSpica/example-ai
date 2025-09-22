# ChatBI - Natural Language to SQL System

A comprehensive solution for converting natural language queries into SQL statements using AI/LLM technology. The system consists of a FastAPI backend server and a React frontend interface.

## 🚀 Features

- **Natural Language Processing**: Convert plain English questions into SQL queries
- **AI-Powered**: Uses Ollama with LangChain for intelligent SQL generation
- **Database Integration**: Direct MySQL database connectivity and execution
- **Query History**: Track and manage previous queries
- **Schema Exploration**: Browse database structure and metadata
- **Real-time Execution**: Execute generated SQL and view results
- **Modern UI**: Responsive React interface with Material Design

## 🏗️ Architecture

```
ChatBI System
├── chatbi-server/     # FastAPI backend
│   ├── app/
│   │   ├── api/       # REST API endpoints
│   │   ├── models/    # Database & Pydantic models
│   │   ├── services/  # Business logic services
│   │   └── main.py    # FastAPI application
│   └── config/        # Configuration management
└── chatbi-ui/         # React frontend
    ├── src/
    │   ├── components/ # React components
    │   ├── services/   # API client
    │   ├── theme/      # UI theming
    │   └── types/      # TypeScript definitions
    └── public/         # Static assets
```

## 🛠️ Technology Stack

### Backend (chatbi-server)
- **FastAPI**: Modern Python web framework
- **LangChain**: LLM application framework
- **Ollama**: Local LLM inference server
- **SQLAlchemy**: Database ORM
- **MySQL**: Database system
- **Pydantic**: Data validation

### Frontend (chatbi-ui)
- **React 18**: UI framework with TypeScript
- **Material-UI**: Component library
- **Vite**: Build tool and dev server
- **Axios**: HTTP client
- **React Syntax Highlighter**: Code display

## 📋 Prerequisites

### System Requirements
- **Python 3.8+** for the backend
- **Node.js 16+** and npm for the frontend
- **MySQL 5.7+** database server
- **Ollama** with a language model (e.g., llama2)

### Service Dependencies
1. **MySQL Database**: Create a database for the application
2. **Ollama Service**: Install and run Ollama with a language model
   ```bash
   # Install Ollama (macOS/Linux)
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Start Ollama service
   ollama serve
   
   # Pull a language model
   ollama pull llama2
   ```

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd chatbi-system

# Setup backend
cd chatbi-server
pip install -r requirements.txt

# Setup frontend
cd ../chatbi-ui
npm install
```

### 2. Configuration

**Backend Configuration** (`chatbi-server/.env`):
```env
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/chatbi_db
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
```

**Frontend Configuration** (`chatbi-ui/.env`):
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 3. Database Setup

```sql
-- Create database
CREATE DATABASE chatbi_db;

-- The application will automatically create required tables
```

### 4. Start Services

**Terminal 1 - Backend Server**:
```bash
cd chatbi-server
python run.py
```

**Terminal 2 - Frontend Development Server**:
```bash
cd chatbi-ui
npm run dev
```

**Terminal 3 - Ollama Service** (if not already running):
```bash
ollama serve
```

### 5. Access the Application

- **Frontend UI**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📖 Usage Guide

### Basic Workflow

1. **Start the Application**: Ensure all services are running
2. **Check Health**: Verify the health indicator shows "healthy"
3. **Refresh Schema**: Use the Database Schema tab to refresh table information
4. **Ask Questions**: Enter natural language queries like:
   - "Show me all users registered last month"
   - "What are the top 10 products by sales?"
   - "Find customers who haven't ordered in 90 days"
5. **Review SQL**: Check the generated SQL before execution
6. **Execute & Analyze**: Run the query and explore results

### Example Queries

```
Natural Language → Generated SQL

"Show all active users" 
→ SELECT * FROM users WHERE status = 'active';

"Monthly sales totals for 2024"
→ SELECT MONTH(order_date) as month, SUM(total_amount) as sales 
  FROM orders WHERE YEAR(order_date) = 2024 GROUP BY MONTH(order_date);

"Top 5 customers by order value"
→ SELECT customer_id, SUM(total_amount) as total_spent 
  FROM orders GROUP BY customer_id ORDER BY total_spent DESC LIMIT 5;
```

## 🔧 Development

### Backend Development

```bash
cd chatbi-server

# Install development dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests (if available)
pytest
```

### Frontend Development

```bash
cd chatbi-ui

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### API Documentation

The backend automatically generates OpenAPI documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔍 Troubleshooting

### Common Issues

1. **Ollama Connection Failed**
   - Ensure Ollama service is running: `ollama serve`
   - Check if the model is available: `ollama list`
   - Verify OLLAMA_BASE_URL in configuration

2. **Database Connection Issues**
   - Verify MySQL is running and accessible
   - Check database credentials in .env file
   - Ensure the database exists

3. **Frontend API Errors**
   - Confirm backend server is running on correct port
   - Check CORS configuration in backend
   - Verify API_BASE_URL in frontend .env

4. **SQL Generation Issues**
   - Refresh database schema information
   - Check if Ollama model is appropriate for SQL generation
   - Review natural language query clarity

### Debugging Tips

- Check application logs in both frontend browser console and backend terminal
- Use the health check endpoint to verify service connectivity
- Monitor network requests in browser developer tools
- Verify environment variables are loaded correctly

## 📝 API Reference

### Key Endpoints

- `GET /api/v1/health` - System health check
- `POST /api/v1/query` - Generate/execute SQL from natural language
- `GET /api/v1/history` - Retrieve query history
- `GET /api/v1/schema` - Get database schema information
- `POST /api/v1/schema/refresh` - Refresh schema cache

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with appropriate tests
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Ollama** for local LLM inference
- **LangChain** for LLM application framework
- **FastAPI** for the excellent Python web framework
- **Material-UI** for React components
- **Vite** for fast frontend development