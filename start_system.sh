#!/bin/bash

# ChatBI System Startup Script

echo "🚀 Starting ChatBI System"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

if ! command_exists ollama; then
    echo -e "${YELLOW}⚠️  Ollama is not installed or not in PATH${NC}"
    echo "Please install Ollama from https://ollama.ai"
    echo "Or make sure it's running on localhost:11434"
fi

echo -e "${GREEN}✅ Prerequisites check completed${NC}"

# Check if ports are available
if port_in_use 8000; then
    echo -e "${YELLOW}⚠️  Port 8000 is already in use (Backend)${NC}"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

if port_in_use 5173; then
    echo -e "${YELLOW}⚠️  Port 5173 is already in use (Frontend)${NC}"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Start Ollama if not running
echo -e "${BLUE}Checking Ollama service...${NC}"
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "${YELLOW}Starting Ollama service...${NC}"
    if command_exists ollama; then
        ollama serve &
        OLLAMA_PID=$!
        sleep 3
        echo -e "${GREEN}✅ Ollama service started (PID: $OLLAMA_PID)${NC}"
    else
        echo -e "${RED}❌ Cannot start Ollama service${NC}"
        echo "Please start Ollama manually: ollama serve"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Ollama service is already running${NC}"
fi

# Install backend dependencies if needed
echo -e "${BLUE}Setting up backend...${NC}"
cd chatbi-server

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

if [ ! -f ".deps_installed" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    touch .deps_installed
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Backend dependencies already installed${NC}"
fi

# Start backend server
echo -e "${BLUE}Starting backend server...${NC}"
python run.py &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend server started (PID: $BACKEND_PID)${NC}"

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend server is running${NC}"
else
    echo -e "${YELLOW}⚠️  Backend server might not be fully ready yet${NC}"
fi

# Install frontend dependencies if needed
echo -e "${BLUE}Setting up frontend...${NC}"
cd ../chatbi-ui

if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Frontend dependencies already installed${NC}"
fi

# Start frontend server
echo -e "${BLUE}Starting frontend server...${NC}"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend server started (PID: $FRONTEND_PID)${NC}"

# Wait for frontend to start
sleep 3

echo ""
echo "🎉 ChatBI System Started Successfully!"
echo "====================================="
echo -e "${GREEN}Frontend:${NC} http://localhost:5173"
echo -e "${GREEN}Backend API:${NC} http://localhost:8000"
echo -e "${GREEN}API Docs:${NC} http://localhost:8000/docs"
echo ""
echo "Process IDs:"
echo "- Backend: $BACKEND_PID"
echo "- Frontend: $FRONTEND_PID"
if [ ! -z "$OLLAMA_PID" ]; then
    echo "- Ollama: $OLLAMA_PID"
fi
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${BLUE}Shutting down ChatBI System...${NC}"
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend stopped"
    fi
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend stopped"
    fi
    
    if [ ! -z "$OLLAMA_PID" ]; then
        kill $OLLAMA_PID 2>/dev/null
        echo "✅ Ollama stopped"
    fi
    
    echo -e "${GREEN}👋 ChatBI System stopped${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep the script running
wait