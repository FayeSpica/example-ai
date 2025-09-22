import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { QueryResponse } from '../types/api';
import { apiService } from '../services/api';

interface QueryHistoryProps {
  onSelectQuery?: (query: QueryResponse) => void;
}

const QueryHistory: React.FC<QueryHistoryProps> = ({ onSelectQuery }) => {
  const [history, setHistory] = useState<QueryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuery, setSelectedQuery] = useState<QueryResponse | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getQueryHistory(20, 0);
      setHistory(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (queryId: number) => {
    try {
      await apiService.deleteQueryHistory(queryId);
      setHistory(prev => prev.filter(q => q.id !== queryId));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete query');
    }
  };

  const handleView = (query: QueryResponse) => {
    setSelectedQuery(query);
    setDialogOpen(true);
  };

  const handleSelect = (query: QueryResponse) => {
    if (onSelectQuery) {
      onSelectQuery(query);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Query History
            </Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={loadHistory}
              disabled={loading}
              size="small"
            >
              Refresh
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {history.length === 0 ? (
            <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              No query history found
            </Typography>
          ) : (
            <List>
              {history.map((query) => (
                <ListItem
                  key={query.id}
                  divider
                  sx={{ 
                    cursor: onSelectQuery ? 'pointer' : 'default',
                    '&:hover': onSelectQuery ? { backgroundColor: '#f5f5f5' } : {},
                  }}
                  onClick={() => onSelectQuery && handleSelect(query)}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {query.natural_language_query}
                        </Typography>
                        <Chip
                          label={query.status}
                          color={getStatusColor(query.status) as any}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                          {query.generated_sql.substring(0, 100)}
                          {query.generated_sql.length > 100 ? '...' : ''}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="textSecondary">
                            {query.created_at && formatDate(query.created_at)}
                          </Typography>
                          {query.execution_time && (
                            <Typography variant="caption" color="textSecondary">
                              {query.execution_time}ms
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="View Details">
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(query);
                        }}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (query.id) handleDelete(query.id);
                        }}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CodeIcon />
            Query Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedQuery && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Natural Language Query:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                {selectedQuery.natural_language_query}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                Generated SQL:
              </Typography>
              <SyntaxHighlighter
                language="sql"
                style={tomorrow}
                customStyle={{
                  borderRadius: 8,
                  fontSize: '14px',
                  margin: 0,
                  marginBottom: 16,
                }}
              >
                {selectedQuery.generated_sql}
              </SyntaxHighlighter>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={`Status: ${selectedQuery.status}`}
                  color={getStatusColor(selectedQuery.status) as any}
                />
                {selectedQuery.execution_time && (
                  <Chip
                    label={`Execution: ${selectedQuery.execution_time}ms`}
                    variant="outlined"
                  />
                )}
                {selectedQuery.execution_result && (
                  <Chip
                    label={`Results: ${selectedQuery.execution_result.length} rows`}
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Close
          </Button>
          {selectedQuery && onSelectQuery && (
            <Button
              variant="contained"
              onClick={() => {
                handleSelect(selectedQuery);
                setDialogOpen(false);
              }}
            >
              Load Query
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QueryHistory;