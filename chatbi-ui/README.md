# ChatBI UI

A modern React-based frontend for the ChatBI natural language to SQL system.

## Features

- **Query Builder**: Convert natural language to SQL with an intuitive interface
- **SQL Display**: Syntax-highlighted SQL with copy and execute functionality
- **Results Visualization**: Interactive data grid for query results
- **Query History**: Browse and reuse previous queries
- **Database Schema**: Explore database structure and table information
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for components and theming
- **Vite** for fast development and building
- **Axios** for API communication
- **React Syntax Highlighter** for SQL display

## Prerequisites

- Node.js 16+ and npm
- ChatBI Server running (see ../chatbi-server/README.md)

## Installation

1. Navigate to the UI directory:
   ```bash
   cd chatbi-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

## Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── QueryInput.tsx   # Natural language query input
│   ├── SqlDisplay.tsx   # SQL syntax highlighting
│   ├── ResultsDisplay.tsx # Query results table
│   ├── QueryHistory.tsx # Query history management
│   └── DatabaseSchema.tsx # Database schema explorer
├── services/           # API services
│   └── api.ts          # API client
├── theme/              # Material-UI theme
│   └── theme.ts        # Theme configuration
├── types/              # TypeScript types
│   └── api.ts          # API type definitions
└── App.tsx             # Main application component
```

## Features Overview

### Query Builder
- Natural language input with example queries
- Toggle for automatic SQL execution
- Real-time error handling and feedback

### SQL Display
- Syntax highlighting for generated SQL
- Copy to clipboard functionality
- Execute button for manual execution
- Query status and execution time display

### Results Display
- Interactive data grid with sorting and filtering
- Responsive column sizing
- Null value handling
- Row and column count indicators

### Query History
- Browse previous queries with status indicators
- Delete unwanted queries
- Load queries back into the builder
- Detailed view with full SQL and metadata

### Database Schema
- Expandable table structure view
- Column details with data types and constraints
- Table comments and estimated row counts
- Schema refresh functionality

## Configuration

### Environment Variables

- `VITE_API_BASE_URL`: Base URL for the ChatBI API (default: http://localhost:8000/api/v1)

### Theme Customization

The application uses Material-UI's theming system. Customize the theme in `src/theme/theme.ts`.

## API Integration

The frontend communicates with the ChatBI Server through REST APIs:

- `POST /api/v1/query` - Generate and execute SQL
- `GET /api/v1/history` - Fetch query history
- `GET /api/v1/schema` - Get database schema
- `GET /api/v1/health` - Health check

## Troubleshooting

1. **API Connection Issues**: Verify the ChatBI Server is running and accessible
2. **CORS Issues**: Ensure the server allows requests from the frontend origin
3. **Build Issues**: Clear node_modules and reinstall dependencies

## Development Tips

- Use React Developer Tools for debugging
- Enable network tab to monitor API calls
- Check browser console for error messages
- Use the health indicator in the top bar to verify server connectivity