import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { hsCodeAPI, priceAPI, tariffAPI } from '../services/api';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Calculate as CalculateIcon,
  ShowChart as ShowChartIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

export default function SavedItems() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedHsCodes, setSavedHsCodes] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [priceData, setPriceData] = useState({});
  const [tariffData, setTariffData] = useState({});
  const [priceChangeData, setPriceChangeData] = useState({});
  
  // Fetch saved HS codes
  useEffect(() => {
    fetchSavedHsCodes();
  }, []);
  
  // Fetch saved HS codes
  const fetchSavedHsCodes = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await hsCodeAPI.getSaved();
      setSavedHsCodes(response.data.data.hsCodes);
      
      // Fetch additional data for saved HS codes
      if (response.data.data.hsCodes.length > 0) {
        fetchPriceData(response.data.data.hsCodes);
        fetchTariffData(response.data.data.hsCodes);
      }
    } catch (err) {
      console.error('Error fetching saved HS codes:', err);
      setError(typeof err === 'string' ? err : 'Failed to fetch saved items');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch price data for saved HS codes
  const fetchPriceData = async (hsCodes) => {
    try {
      const prices = {};
      const priceChanges = {};
      
      // Get current price for each HS code
      for (const hsCode of hsCodes) {
        try {
          const response = await priceAPI.getCurrent(hsCode.code);
          prices[hsCode.code] = response.data.data.price;
          
          // Calculate price change
          const historyResponse = await priceAPI.getHistory(hsCode.code, {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString()
          });
          
          const history = historyResponse.data.data;
          if (history.length >= 2) {
            const oldestPrice = history[0].price;
            const latestPrice = history[history.length - 1].price;
            const change = ((latestPrice - oldestPrice) / oldestPrice) * 100;
            priceChanges[hsCode.code] = change;
          } else {
            priceChanges[hsCode.code] = 0;
          }
        } catch (err) {
          console.error(`Error fetching price data for ${hsCode.code}:`, err);
          prices[hsCode.code] = null;
          priceChanges[hsCode.code] = null;
        }
      }
      
      setPriceData(prices);
      setPriceChangeData(priceChanges);
    } catch (err) {
      console.error('Error fetching price data:', err);
    }
  };
  
  // Fetch tariff data for saved HS codes
  const fetchTariffData = async (hsCodes) => {
    try {
      const tariffs = {};
      
      // Get current tariff for each HS code
      for (const hsCode of hsCodes) {
        try {
          const response = await tariffAPI.getCurrent(hsCode.code);
          tariffs[hsCode.code] = response.data.data.tariff;
        } catch (err) {
          console.error(`Error fetching tariff data for ${hsCode.code}:`, err);
          tariffs[hsCode.code] = null;
        }
      }
      
      setTariffData(tariffs);
    } catch (err) {
      console.error('Error fetching tariff data:', err);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle remove HS code
  const handleRemoveHsCode = async (code) => {
    try {
      await hsCodeAPI.unsave(code);
      setSavedHsCodes(savedHsCodes.filter(item => item.code !== code));
      
      // Remove from price and tariff data
      const newPriceData = { ...priceData };
      delete newPriceData[code];
      setPriceData(newPriceData);
      
      const newTariffData = { ...tariffData };
      delete newTariffData[code];
      setTariffData(newTariffData);
      
      const newPriceChangeData = { ...priceChangeData };
      delete newPriceChangeData[code];
      setPriceChangeData(newPriceChangeData);
    } catch (err) {
      console.error('Error removing HS code:', err);
    }
  };
  
  // Get price change icon
  const getPriceChangeIcon = (change) => {
    if (!change && change !== 0) return null;
    
    if (change > 5) return <TrendingUpIcon color="error" />;
    if (change > 0) return <TrendingUpIcon color="warning" />;
    if (change < -5) return <TrendingDownIcon color="success" />;
    if (change < 0) return <TrendingDownIcon color="info" />;
    return <TrendingFlatIcon color="action" />;
  };
  
  // Format percentage
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '--';
    return (value > 0 ? '+' : '') + value.toFixed(2) + '%';
  };
  
  // Render card view
  const renderCardView = () => {
    return (
      <Grid container spacing={3}>
        {savedHsCodes.map((hsCode) => (
          <Grid item xs={12} sm={6} md={4} key={hsCode.code}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6" gutterBottom>
                    {hsCode.code}
                  </Typography>
                  
                  <IconButton
                    onClick={() => handleRemoveHsCode(hsCode.code)}
                    color="default"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {hsCode.description}
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Current Price
                    </Typography>
                    
                    {priceData[hsCode.code] ? (
                      <Box display="flex" alignItems="center">
                        <Typography variant="body1" sx={{ mr: 1 }}>
                          {priceData[hsCode.code].price.toFixed(2)} {priceData[hsCode.code].currency}/{priceData[hsCode.code].unit}
                        </Typography>
                        
                        {priceChangeData[hsCode.code] !== undefined && (
                          <Tooltip title="30-day change">
                            <Chip
                              icon={getPriceChangeIcon(priceChangeData[hsCode.code])}
                              label={formatPercentage(priceChangeData[hsCode.code])}
                              size="small"
                              color={
                                priceChangeData[hsCode.code] > 5 ? 'error' :
                                priceChangeData[hsCode.code] > 0 ? 'warning' :
                                priceChangeData[hsCode.code] < -5 ? 'success' :
                                priceChangeData[hsCode.code] < 0 ? 'info' :
                                'default'
                              }
                              variant="outlined"
                            />
                          </Tooltip>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not available
                      </Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Current Tariff Rate
                    </Typography>
                    
                    {tariffData[hsCode.code] ? (
                      <Typography variant="body1">
                        {tariffData[hsCode.code].unit === '%' 
                          ? (tariffData[hsCode.code].rate).toFixed(2) + '%' 
                          : tariffData[hsCode.code].rate + ' ' + tariffData[hsCode.code].unit}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not available
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
              
              <Divider />
              
              <CardActions>
                <Button 
                  component={RouterLink} 
                  to={`/prices/${hsCode.code}`}
                  size="small" 
                  startIcon={<ShowChartIcon />}
                >
                  Prices
                </Button>
                <Button 
                  component={RouterLink} 
                  to={`/tariffs/${hsCode.code}`}
                  size="small" 
                  startIcon={<CalculateIcon />}
                >
                  Tariffs
                </Button>
                <Button 
                  component={RouterLink} 
                  to={`/forecast/${hsCode.code}`}
                  size="small" 
                  startIcon={<TrendingUpIcon />}
                >
                  Forecast
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };
  
  // Render table view
  const renderTableView = () => {
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>HS Code</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Current Price</TableCell>
              <TableCell align="center">30-Day Trend</TableCell>
              <TableCell>Tariff Rate</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {savedHsCodes.map((hsCode) => (
              <TableRow key={hsCode.code}>
                <TableCell>{hsCode.code}</TableCell>
                <TableCell>{hsCode.description}</TableCell>
                <TableCell>
                  {priceData[hsCode.code] 
                    ? `${priceData[hsCode.code].price.toFixed(2)} ${priceData[hsCode.code].currency}/${priceData[hsCode.code].unit}`
                    : 'Not available'}
                </TableCell>
                <TableCell align="center">
                  {priceChangeData[hsCode.code] !== undefined ? (
                    <Box display="flex" alignItems="center" justifyContent="center">
                      {getPriceChangeIcon(priceChangeData[hsCode.code])}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {formatPercentage(priceChangeData[hsCode.code])}
                      </Typography>
                    </Box>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>
                  {tariffData[hsCode.code] 
                    ? tariffData[hsCode.code].unit === '%' 
                      ? (tariffData[hsCode.code].rate).toFixed(2) + '%' 
                      : tariffData[hsCode.code].rate + ' ' + tariffData[hsCode.code].unit
                    : 'Not available'}
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center">
                    <IconButton 
                      component={RouterLink}
                      to={`/prices/${hsCode.code}`}
                      size="small"
                      color="primary"
                    >
                      <ShowChartIcon />
                    </IconButton>
                    <IconButton 
                      component={RouterLink}
                      to={`/tariffs/${hsCode.code}`}
                      size="small"
                      color="primary"
                    >
                      <CalculateIcon />
                    </IconButton>
                    <IconButton 
                      component={RouterLink}
                      to={`/forecast/${hsCode.code}`}
                      size="small"
                      color="primary"
                    >
                      <TrendingUpIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleRemoveHsCode(hsCode.code)}
                      size="small"
                      color="default"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">
            Saved HS Codes
          </Typography>
          
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="view type tabs"
          >
            <Tab label="Cards" />
            <Tab label="Table" />
          </Tabs>
        </Box>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : savedHsCodes.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <WarningIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Saved HS Codes
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            You haven't saved any HS codes yet. Search for HS codes and save them for quick access.
          </Typography>
          <Button
            component={RouterLink}
            to="/search"
            variant="contained"
            color="primary"
          >
            Search HS Codes
          </Button>
        </Paper>
      ) : (
        tabValue === 0 ? renderCardView() : renderTableView()
      )}
      
      {savedHsCodes.length > 0 && (
        <Box mt={3} display="flex" alignItems="center">
          <InfoIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Price and tariff data is updated automatically when you view this page.
          </Typography>
        </Box>
      )}
    </Box>
  );
}