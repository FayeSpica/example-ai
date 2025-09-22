import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Chip,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  PlayArrow as ExecuteIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { QueryResponse } from '../types/api';

interface SqlDisplayProps {
  result: QueryResponse | null;
  onExecute?: (sql: string) => Promise<void>;
  executing?: boolean;
}

const SqlDisplay: React.FC<SqlDisplayProps> = ({ result, onExecute, executing }) => {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.generated_sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleExecute = () => {
    if (onExecute) {
      onExecute(result.generated_sql);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executed':
        return 'success';
      case 'generated':
        return 'info';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Generated SQL
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={result.status}
              color={getStatusColor(result.status) as any}
              size="small"
            />
            {result.execution_time && (
              <Chip
                label={`${result.execution_time}ms`}
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        </Box>

        <Box sx={{ position: 'relative', mb: 2 }}>
          <SyntaxHighlighter
            language="sql"
            style={tomorrow}
            customStyle={{
              borderRadius: 8,
              fontSize: '14px',
              margin: 0,
            }}
          >
            {result.generated_sql}
          </SyntaxHighlighter>
          
          <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
            <Tooltip title={copied ? 'Copied!' : 'Copy SQL'}>
              <IconButton
                size="small"
                onClick={handleCopy}
                sx={{ bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
              >
                {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            
            {onExecute && result.status === 'generated' && (
              <Tooltip title="Execute SQL">
                <IconButton
                  size="small"
                  onClick={handleExecute}
                  disabled={executing}
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                >
                  <ExecuteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Query:</strong> {result.natural_language_query}
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default SqlDisplay;