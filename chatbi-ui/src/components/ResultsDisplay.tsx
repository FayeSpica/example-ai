import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { QueryResponse } from '../types/api';

interface ResultsDisplayProps {
  result: QueryResponse | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  if (!result || !result.execution_result) return null;

  const data = result.execution_result;
  
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Query Results
          </Typography>
          <Alert severity="info">
            No data returned from the query.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Generate columns from the first row of data
  const columns: GridColDef[] = Object.keys(data[0]).map((key) => ({
    field: key,
    headerName: key.toUpperCase().replace(/_/g, ' '),
    width: 150,
    flex: 1,
    minWidth: 100,
    renderCell: (params) => {
      const value = params.value;
      if (value === null || value === undefined) {
        return <span style={{ color: '#999', fontStyle: 'italic' }}>NULL</span>;
      }
      if (typeof value === 'boolean') {
        return <Chip label={value.toString()} color={value ? 'success' : 'default'} size="small" />;
      }
      if (typeof value === 'number') {
        return <span style={{ fontFamily: 'monospace' }}>{value.toLocaleString()}</span>;
      }
      if (typeof value === 'string' && value.length > 50) {
        return (
          <span title={value}>
            {value.substring(0, 50)}...
          </span>
        );
      }
      return String(value);
    },
  }));

  // Add id field for DataGrid
  const rowsWithId = data.map((row, index) => ({
    id: index,
    ...row,
  }));

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Query Results
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={`${data.length} rows`}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip
              label={`${columns.length} columns`}
              color="secondary"
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>

        <Box sx={{ height: Math.min(600, 100 + data.length * 52), width: '100%' }}>
          <DataGrid
            rows={rowsWithId}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            disableSelectionOnClick
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderColor: '#f0f0f0',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f5f5f5',
                borderColor: '#f0f0f0',
              },
            }}
          />
        </Box>

        {result.execution_time && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="textSecondary">
              Execution time: {result.execution_time}ms
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultsDisplay;