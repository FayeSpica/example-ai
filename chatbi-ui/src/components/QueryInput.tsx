import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Switch,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Send as SendIcon, Code as CodeIcon } from '@mui/icons-material';
import { QueryRequest } from '../types/api';

interface QueryInputProps {
  onSubmit: (request: QueryRequest) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const QueryInput: React.FC<QueryInputProps> = ({ onSubmit, loading, error }) => {
  const [query, setQuery] = useState('');
  const [executeQuery, setExecuteQuery] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    await onSubmit({
      query: query.trim(),
      execute: executeQuery,
    });
  };

  const exampleQueries = [
    "Show me all users registered in the last month",
    "What are the top 10 products by sales volume?",
    "Find customers who haven't placed an order in 90 days",
    "Calculate monthly revenue for this year",
    "Show me the average order value by customer segment",
  ];

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Natural Language Query
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your question in natural language..."
            variant="outlined"
            disabled={loading}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={executeQuery}
                  onChange={(e) => setExecuteQuery(e.target.checked)}
                  disabled={loading}
                />
              }
              label="Execute SQL automatically"
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !query.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : <CodeIcon />}
              >
                {loading ? 'Generating...' : 'Generate SQL'}
              </Button>
            </Box>
          </Box>
        </form>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Example queries:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {exampleQueries.map((example, index) => (
              <Button
                key={index}
                size="small"
                variant="outlined"
                onClick={() => handleExampleClick(example)}
                disabled={loading}
                sx={{ 
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  borderRadius: 20,
                }}
              >
                {example}
              </Button>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QueryInput;