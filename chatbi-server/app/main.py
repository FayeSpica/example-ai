from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from contextlib import asynccontextmanager

from config.settings import settings
from app.models.database import create_tables
from app.api.routes import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting ChatBI Server...")
    try:
        # Create database tables
        create_tables()
        print("Database tables created/verified")
    except Exception as e:
        print(f"Database initialization error: {e}")
    
    yield
    
    # Shutdown
    print("Shutting down ChatBI Server...")

# Create FastAPI app
app = FastAPI(
    title="ChatBI Server",
    description="Natural Language to SQL API using LangChain and Ollama",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "ChatBI Server is running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug
    )