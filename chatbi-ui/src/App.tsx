import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Grid,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Alert,
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  QueryStats as QueryIcon,
  History as HistoryIcon,
  Storage as SchemaIcon,
  Health as HealthIcon,
} from '@mui/icons-material';
import { theme } from './theme/theme';
import QueryInput from './components/QueryInput';
import SqlDisplay from './components/SqlDisplay';
import ResultsDisplay from './components/ResultsDisplay';
import QueryHistory from './components/QueryHistory';
import DatabaseSchema from './components/DatabaseSchema';
import { QueryRequest, QueryResponse, HealthResponse } from './types/api';
import { apiService } from './services/api';

type TabType = 'query' | 'history' | 'schema';

function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('query');
  const [currentResult, setCurrentResult] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const healthStatus = await apiService.checkHealth();
      setHealth(healthStatus);
    } catch (err) {
      console.error('Health check failed:', err);
    }
  };

  const handleSubmitQuery = async (request: QueryRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.submitQuery(request);
      setCurrentResult(result);
      setCurrentTab('query');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate SQL');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteSql = async (sql: string) => {
    if (!currentResult) return;
    
    setExecuting(true);
    setError(null);
    try {
      const result = await apiService.submitQuery({
        query: currentResult.natural_language_query,
        execute: true,
      });
      setCurrentResult(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to execute SQL');
    } finally {
      setExecuting(false);
    }
  };

  const handleSelectHistoryQuery = (query: QueryResponse) => {
    setCurrentResult(query);
    setCurrentTab('query');
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const getHealthColor = (status: string) => {
    return status === 'healthy' ? 'success' : 'error';
  };

  const navigationItems = [
    { id: 'query' as TabType, label: 'Query Builder', icon: <QueryIcon /> },
    { id: 'history' as TabType, label: 'Query History', icon: <HistoryIcon /> },
    { id: 'schema' as TabType, label: 'Database Schema', icon: <SchemaIcon /> },
  ];

  const renderContent = () => {
    switch (currentTab) {
      case 'query':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <QueryInput
                onSubmit={handleSubmitQuery}
                loading={loading}
                error={error}
              />
            </Grid>
            {currentResult && (
              <>
                <Grid item xs={12}>
                  <SqlDisplay
                    result={currentResult}
                    onExecute={handleExecuteSql}
                    executing={executing}
                  />
                </Grid>
                {currentResult.execution_result && (
                  <Grid item xs={12}>
                    <ResultsDisplay result={currentResult} />
                  </Grid>
                )}
              </>
            )}
          </Grid>
        );
      case 'history':
        return <QueryHistory onSelectQuery={handleSelectHistoryQuery} />;
      case 'schema':
        return <DatabaseSchema />;
      default:
        return null;
    }
  };

  const drawer = (
    <Box sx={{ width: 280 }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">ChatBI</Typography>
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <List>
        {navigationItems.map((item) => (
          <ListItem
            button
            key={item.id}
            selected={currentTab === item.id}
            onClick={() => {
              setCurrentTab(item.id);
              if (isMobile) setDrawerOpen(false);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              ChatBI - Natural Language to SQL
            </Typography>
            {health && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HealthIcon fontSize="small" />
                <Chip
                  label={health.status}
                  color={getHealthColor(health.status) as any}
                  size="small"
                />
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Navigation Drawer */}
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? drawerOpen : true}
          onClose={() => setDrawerOpen(false)}
          sx={{
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              mt: isMobile ? 0 : 8,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8,
            ml: isMobile ? 0 : 0,
          }}
        >
          <Container maxWidth="xl">
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            {renderContent()}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;