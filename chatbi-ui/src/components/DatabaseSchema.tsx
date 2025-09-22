import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { DatabaseSchemaInfo, TableInfo } from '../types/api';
import { apiService } from '../services/api';

const DatabaseSchema: React.FC = () => {
  const [schema, setSchema] = useState<DatabaseSchemaInfo[]>([]);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSchema = async () => {
    setLoading(true);
    setError(null);
    try {
      const [schemaData, tablesData] = await Promise.all([
        apiService.getDatabaseSchema(),
        apiService.getTables(),
      ]);
      setSchema(schemaData);
      setTables(tablesData.tables);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load schema');
    } finally {
      setLoading(false);
    }
  };

  const refreshSchema = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await apiService.refreshDatabaseSchema();
      await loadSchema();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to refresh schema');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSchema();
  }, []);

  // Group schema by table
  const groupedSchema = schema.reduce((acc, item) => {
    if (!acc[item.table_name]) {
      acc[item.table_name] = [];
    }
    acc[item.table_name].push(item);
    return acc;
  }, {} as Record<string, DatabaseSchemaInfo[]>);

  const getTableInfo = (tableName: string) => {
    return tables.find(t => t.table_name === tableName);
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading database schema...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StorageIcon />
            <Typography variant="h6">
              Database Schema
            </Typography>
          </Box>
          <Button
            startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={refreshSchema}
            disabled={refreshing}
            size="small"
          >
            {refreshing ? 'Refreshing...' : 'Refresh Schema'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {Object.keys(groupedSchema).length === 0 ? (
          <Alert severity="info">
            No schema information available. Click "Refresh Schema" to load database structure.
          </Alert>
        ) : (
          <Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Found {Object.keys(groupedSchema).length} tables with {schema.length} total columns
            </Typography>

            {Object.entries(groupedSchema).map(([tableName, columns]) => {
              const tableInfo = getTableInfo(tableName);
              return (
                <Accordion key={tableName}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {tableName}
                      </Typography>
                      <Chip
                        label={`${columns.length} columns`}
                        size="small"
                        variant="outlined"
                      />
                      {tableInfo?.estimated_rows !== undefined && (
                        <Chip
                          label={`~${tableInfo.estimated_rows.toLocaleString()} rows`}
                          size="small"
                          variant="outlined"
                          color="secondary"
                        />
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {tableInfo?.comment && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>Table Description:</strong> {tableInfo.comment}
                        </Typography>
                      </Alert>
                    )}
                    
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Column Name</strong></TableCell>
                            <TableCell><strong>Data Type</strong></TableCell>
                            <TableCell><strong>Nullable</strong></TableCell>
                            <TableCell><strong>Comment</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {columns.map((column, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                                  {column.column_name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={column.data_type}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={column.is_nullable}
                                  size="small"
                                  color={column.is_nullable === 'YES' ? 'warning' : 'success'}
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="textSecondary">
                                  {column.column_comment || '-'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseSchema;