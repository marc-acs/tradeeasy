import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hsCodeAPI, forecastAPI, priceAPI } from '../services/api';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  InputAdornment,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  ToggleButtonGroup,
  ToggleButton,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ChartIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  CompareArrows as CompareIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

export default function PriceForecast() {
  const { hsCode: hsCodeParam } = useParams();
  const navigate = useNavigate();
  const [hsCode, setHsCode] = useState(hsCodeParam || '');
  const [hsCodeInfo, setHsCodeInfo] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedHsCodes, setSavedHsCodes] = useState([]);
  const [horizon, setHorizon] = useState('1m');
  const [tabValue, setTabValue] = useState(0);
  const [multiHorizonForecasts, setMultiHorizonForecasts] = useState(null);
  const [compareCodes, setCompareCodes] = useState([]);
  const [compareData, setCompareData] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  
  // Fetch data when HS code changes
  useEffect(() => {
    if (hsCodeParam) {
      setHsCode(hsCodeParam);
      fetchHsCodeData(hsCodeParam);
    }
    
    // Fetch saved HS codes for bookmarking
    fetchSavedHsCodes();
  }, [hsCodeParam]);
  
  // Fetch saved HS codes
  const fetchSavedHsCodes = async () => {
    try {
      const response = await hsCodeAPI.getSaved();
      setSavedHsCodes(response.data.data.hsCodes);
    } catch (err) {
      console.error('Error fetching saved HS codes:', err);
    }
  };
  
  // Handle HS code search
  const handleSearch = () => {
    if (!hsCode) return;
    
    // Update URL
    navigate(`/forecast/${hsCode}`);
    fetchHsCodeData(hsCode);
  };
  
  // Fetch HS code data and price forecast
  const fetchHsCodeData = async (code) => {
    setLoading(true);
    setError('');
    
    try {
      // Get HS code details
      const hsCodeResponse = await hsCodeAPI.getByCode(code);
      setHsCodeInfo(hsCodeResponse.data.data.hsCode);
      
      // Get price history
      const priceResponse = await priceAPI.getHistory(code, {
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      });
      
      // Format data for Chart.js
      const prices = priceResponse.data.data;
      
      // Get forecast
      if (compareMode && compareCodes.length > 0) {
        await fetchCompareForecasts(code);
      } else if (tabValue === 1) {
        await fetchMultiHorizonForecasts(code);
      } else {
        await fetchForecast(code);
      }
      
      // Format price history for chart
      const chartData = {
        labels: prices.map(p => new Date(p.date).toLocaleDateString()),
        datasets: [
          {
            label: 'Historical Price',
            data: prices.map(p => p.price),
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            pointRadius: 1,
            borderWidth: 2,
            fill: true,
            tension: 0.2
          }
        ]
      };
      
      setPriceData(chartData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(typeof err === 'string' ? err : 'Failed to fetch data. Please try again.');
      setHsCodeInfo(null);
      setPriceData(null);
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch single horizon forecast
  const fetchForecast = async (code = hsCode) => {
    try {
      const response = await forecastAPI.get(code, { horizon });
      setForecastData(response.data.data.forecast);
      
      // Update price chart with forecast data
      if (priceData && priceData.datasets && priceData.datasets.length > 0) {
        addForecastToChart(response.data.data.forecast);
      }
    } catch (err) {
      console.error('Error fetching forecast:', err);
      setError(typeof err === 'string' ? err : 'Failed to fetch forecast data. Please try again.');
    }
  };
  
  // Fetch multiple horizon forecasts
  const fetchMultiHorizonForecasts = async (code = hsCode) => {
    try {
      const response = await forecastAPI.getMultiHorizon(code, {
        horizons: '1m,3m,6m,1y'
      });
      setMultiHorizonForecasts(response.data.data.forecasts);
      
      // Also set the single forecast data for the current horizon
      if (response.data.data.forecasts[horizon]) {
        setForecastData(response.data.data.forecasts[horizon]);
        
        // Update price chart with forecast data
        if (priceData && priceData.datasets && priceData.datasets.length > 0) {
          addForecastToChart(response.data.data.forecasts[horizon]);
        }
      }
    } catch (err) {
      console.error('Error fetching multi-horizon forecasts:', err);
      setError(typeof err === 'string' ? err : 'Failed to fetch forecast data. Please try again.');
    }
  };
  
  // Fetch comparison forecasts
  const fetchCompareForecasts = async (code = hsCode) => {
    try {
      const response = await forecastAPI.compare(
        [code, ...compareCodes],
        { horizon }
      );
      
      setCompareData(response.data.data);
      
      // Update chart with comparison data
      if (priceData && priceData.datasets) {
        const colors = [
          'rgb(54, 162, 235)',
          'rgb(255, 99, 132)',
          'rgb(75, 192, 192)',
          'rgb(255, 159, 64)',
          'rgb(153, 102, 255)'
        ];
        
        const datasets = [priceData.datasets[0]]; // Keep historical data
        
        // Add primary forecast
        if (response.data.data[code] && !response.data.data[code].error) {
          const primaryForecast = response.data.data[code].forecast;
          datasets.push({
            label: `${code} Forecast`,
            data: [null, null, ...Array(priceData.labels.length - 3).fill(null), primaryForecast.predictedPrice],
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            borderDash: [6, 6],
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: 'rgb(54, 162, 235)',
            fill: false
          });
        }
        
        // Add comparison forecasts
        compareCodes.forEach((compareCode, index) => {
          if (
            response.data.data[compareCode] && 
            !response.data.data[compareCode].error
          ) {
            const color = colors[(index + 1) % colors.length];
            const compareData = response.data.data[compareCode];
            
            datasets.push({
              label: `${compareCode} - ${compareData.description}`,
              data: Array(priceData.labels.length).fill(null),
              borderColor: color,
              backgroundColor: color + '20',
              fill: false,
              borderWidth: 1,
              pointRadius: 0
            });
            
            datasets.push({
              label: `${compareCode} Forecast`,
              data: [null, null, ...Array(priceData.labels.length - 3).fill(null), compareData.forecast.predictedPrice],
              borderColor: color,
              backgroundColor: color + '30',
              borderDash: [6, 6],
              borderWidth: 2,
              pointRadius: 4,
              pointBackgroundColor: color,
              fill: false
            });
          }
        });
        
        setPriceData({
          ...priceData,
          datasets
        });
      }
    } catch (err) {
      console.error('Error fetching comparison forecasts:', err);
      setError(typeof err === 'string' ? err : 'Failed to fetch comparison data. Please try again.');
    }
  };
  
  // Add forecast data to price chart
  const addForecastToChart = (forecast) => {
    if (!forecast || !priceData) return;
    
    const forecastDate = new Date(forecast.date);
    const forecastLabel = forecastDate.toLocaleDateString();
    
    // Create copy of price data
    const updatedChartData = { ...priceData };
    
    // If we need to add the forecast date to labels
    if (!updatedChartData.labels.includes(forecastLabel)) {
      updatedChartData.labels = [...updatedChartData.labels, forecastLabel];
      
      // Add null value to historical data for the forecast date
      updatedChartData.datasets[0].data = [
        ...updatedChartData.datasets[0].data,
        null
      ];
    }
    
    // Check if we already have a forecast dataset
    const forecastDatasetIndex = updatedChartData.datasets.findIndex(
      dataset => dataset.label === 'Forecast'
    );
    
    // Create forecast dataset
    const forecastDataset = {
      label: 'Forecast',
      data: updatedChartData.labels.map(label => 
        label === forecastLabel ? forecast.predictedPrice : null
      ),
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.1)',
      borderDash: [6, 6],
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: 'rgb(255, 99, 132)',
      fill: false
    };
    
    // Check if we have confidence interval data
    if (forecast.confidenceInterval) {
      // Add upper bound
      const upperBoundDataset = {
        label: 'Upper Bound',
        data: updatedChartData.labels.map(label => 
          label === forecastLabel ? forecast.confidenceInterval.upper : null
        ),
        borderColor: 'rgba(255, 99, 132, 0.3)',
        backgroundColor: 'rgba(255, 99, 132, 0)',
        borderDash: [2, 2],
        borderWidth: 1,
        pointRadius: 0,
        fill: false
      };
      
      // Add lower bound
      const lowerBoundDataset = {
        label: 'Lower Bound',
        data: updatedChartData.labels.map(label => 
          label === forecastLabel ? forecast.confidenceInterval.lower : null
        ),
        borderColor: 'rgba(255, 99, 132, 0.3)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderDash: [2, 2],
        borderWidth: 1,
        pointRadius: 0,
        fill: '+1' // Fill between this and the dataset above
      };
      
      if (forecastDatasetIndex >= 0) {
        // Replace existing forecast dataset
        updatedChartData.datasets[forecastDatasetIndex] = forecastDataset;
        
        if (updatedChartData.datasets.length >= forecastDatasetIndex + 3) {
          // Replace existing confidence interval datasets
          updatedChartData.datasets[forecastDatasetIndex + 1] = upperBoundDataset;
          updatedChartData.datasets[forecastDatasetIndex + 2] = lowerBoundDataset;
        } else {
          // Add confidence interval datasets
          updatedChartData.datasets = [
            ...updatedChartData.datasets,
            upperBoundDataset,
            lowerBoundDataset
          ];
        }
      } else {
        // Add forecast and confidence interval datasets
        updatedChartData.datasets = [
          ...updatedChartData.datasets,
          forecastDataset,
          upperBoundDataset,
          lowerBoundDataset
        ];
      }
    } else {
      // Just add/update forecast dataset without confidence intervals
      if (forecastDatasetIndex >= 0) {
        updatedChartData.datasets[forecastDatasetIndex] = forecastDataset;
      } else {
        updatedChartData.datasets = [...updatedChartData.datasets, forecastDataset];
      }
    }
    
    setPriceData(updatedChartData);
  };
  
  // Handle horizon change
  const handleHorizonChange = (event, newHorizon) => {
    if (newHorizon !== null) {
      setHorizon(newHorizon);
      
      if (hsCode) {
        if (tabValue === 1) {
          // Just update the displayed forecast from already fetched data
          if (multiHorizonForecasts && multiHorizonForecasts[newHorizon]) {
            setForecastData(multiHorizonForecasts[newHorizon]);
            addForecastToChart(multiHorizonForecasts[newHorizon]);
          } else {
            // Need to fetch new data
            fetchMultiHorizonForecasts();
          }
        } else if (compareMode) {
          fetchCompareForecasts();
        } else {
          fetchForecast();
        }
      }
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    if (hsCode) {
      if (newValue === 1) {
        fetchMultiHorizonForecasts();
      } else if (newValue === 2) {
        setCompareMode(true);
        if (compareCodes.length > 0) {
          fetchCompareForecasts();
        }
      } else {
        setCompareMode(false);
        fetchForecast();
      }
    }
  };
  
  // Toggle HS code saved status
  const handleToggleSave = async () => {
    if (!hsCodeInfo) return;
    
    try {
      const isAlreadySaved = savedHsCodes.some(item => item.code === hsCodeInfo.code);
      
      if (isAlreadySaved) {
        await hsCodeAPI.unsave(hsCodeInfo.code);
        setSavedHsCodes(savedHsCodes.filter(item => item.code !== hsCodeInfo.code));
      } else {
        await hsCodeAPI.save(hsCodeInfo.code);
        setSavedHsCodes([...savedHsCodes, hsCodeInfo]);
      }
    } catch (err) {
      console.error('Error toggling save status:', err);
    }
  };
  
  // Add HS code to compare list
  const handleAddCompareCode = (code) => {
    if (!code || compareCodes.includes(code) || code === hsCode) return;
    
    const newCompareCodes = [...compareCodes, code];
    setCompareCodes(newCompareCodes);
    
    // Fetch comparison data
    if (hsCode) {
      fetchCompareForecasts();
    }
  };
  
  // Remove HS code from compare list
  const handleRemoveCompareCode = (code) => {
    const newCompareCodes = compareCodes.filter(c => c !== code);
    setCompareCodes(newCompareCodes);
    
    // Fetch updated comparison data
    if (hsCode) {
      if (newCompareCodes.length === 0) {
        // If no more codes to compare, revert to single forecast
        setCompareMode(false);
        fetchForecast();
      } else {
        fetchCompareForecasts();
      }
    }
  };
  
  // Format percentage change
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '--';
    
    return (value > 0 ? '+' : '') + value.toFixed(2) + '%';
  };
  
  // Get icon for factor impact
  const getFactorImpactIcon = (impact) => {
    if (impact > 0.2) return <ArrowUpIcon sx={{ color: 'error.main' }} />;
    if (impact > 0) return <ArrowUpIcon sx={{ color: 'warning.main' }} />;
    if (impact < -0.2) return <ArrowDownIcon sx={{ color: 'success.main' }} />;
    if (impact < 0) return <ArrowDownIcon sx={{ color: 'info.main' }} />;
    return <ChartIcon color="action" />;
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 1,
        hitRadius: 8,
        hoverRadius: 6,
      },
    },
  };
  
  // Check if current HS code is saved
  const isHsCodeSaved = hsCodeInfo && 
    savedHsCodes.some(item => item.code === hsCodeInfo.code);
  
  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Price Forecast
        </Typography>
        
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="HS Code"
              variant="outlined"
              fullWidth
              value={hsCode}
              onChange={(e) => setHsCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. 120190"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={handleSearch}
                      disabled={loading || !hsCode}
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <ToggleButtonGroup
              value={horizon}
              exclusive
              onChange={handleHorizonChange}
              aria-label="forecast horizon"
              size="small"
              color="primary"
              fullWidth
            >
              <ToggleButton value="1m">1 Month</ToggleButton>
              <ToggleButton value="3m">3 Months</ToggleButton>
              <ToggleButton value="6m">6 Months</ToggleButton>
              <ToggleButton value="1y">1 Year</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="forecast tabs"
            >
              <Tab label="Single Forecast" />
              <Tab label="Multi-Horizon" />
              <Tab label="Compare" />
            </Tabs>
          </Grid>
        </Grid>
      </Paper>
      
      {tabValue === 2 && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Compare HS Codes</Typography>
            <Box>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Add HS Code to compare"
                sx={{ width: 200, mr: 1 }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCompareCode(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Add HS Code to compare"]');
                  if (input && input.value) {
                    handleAddCompareCode(input.value);
                    input.value = '';
                  }
                }}
              >
                Add
              </Button>
            </Box>
          </Box>
          
          <Box>
            <Chip
              label={`${hsCode} (Primary)`}
              color="primary"
              sx={{ mr: 1, mb: 1 }}
            />
            
            {compareCodes.map((code) => (
              <Chip
                key={code}
                label={code}
                onDelete={() => handleRemoveCompareCode(code)}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
            
            {compareCodes.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Add HS codes to compare with {hsCode}
              </Typography>
            )}
          </Box>
        </Paper>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading && (
        <Box sx={{ width: '100%', mb: 3 }}>
          <LinearProgress />
        </Box>
      )}
      
      {hsCodeInfo && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={tabValue === 1 ? 12 : 8}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6">
                      {compareMode ? 'Price Forecast Comparison' : 'AI-Powered Price Forecast'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {hsCodeInfo.code} - {hsCodeInfo.description}
                    </Typography>
                  </Box>
                  
                  <IconButton
                    onClick={handleToggleSave}
                    color={isHsCodeSaved ? 'primary' : 'default'}
                  >
                    {isHsCodeSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                </Box>
                
                <Box sx={{ height: 400, position: 'relative' }}>
                  {loading ? (
                    <Box 
                      display="flex" 
                      justifyContent="center" 
                      alignItems="center"
                      height="100%"
                    >
                      <CircularProgress />
                    </Box>
                  ) : priceData ? (
                    <Line data={priceData} options={chartOptions} />
                  ) : (
                    <Box 
                      display="flex" 
                      justifyContent="center" 
                      alignItems="center"
                      height="100%"
                    >
                      <Typography variant="body1" color="text.secondary">
                        No price data available
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                {forecastData && (
                  <Box mt={3}>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{ bgcolor: 'primary.light', color: 'white' }}>
                          <CardContent>
                            <Typography variant="overline" component="div">
                              Predicted Price
                            </Typography>
                            <Typography variant="h5" component="div" gutterBottom>
                              {forecastData.predictedPrice.toFixed(2)} {forecastData.currency}
                            </Typography>
                            <Typography variant="body2">
                              per {forecastData.unit}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="overline" component="div">
                              Confidence Score
                            </Typography>
                            <Typography variant="h5" component="div" gutterBottom>
                              {forecastData.confidenceScore}%
                            </Typography>
                            <Box sx={{ width: '100%', mt: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={forecastData.confidenceScore} 
                                color={
                                  forecastData.confidenceScore >= 70 ? 'success' :
                                  forecastData.confidenceScore >= 50 ? 'info' :
                                  'warning'
                                }
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="overline" component="div">
                              Forecast Date
                            </Typography>
                            <Typography variant="h6" component="div" gutterBottom>
                              {formatDate(forecastData.date)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {forecastData.horizon} horizon
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="overline" component="div">
                              Confidence Range
                            </Typography>
                            {forecastData.confidenceInterval ? (
                              <>
                                <Typography variant="h6" component="div" color="success.main">
                                  Low: {forecastData.confidenceInterval.lower.toFixed(2)}
                                </Typography>
                                <Typography variant="h6" component="div" color="error.main">
                                  High: {forecastData.confidenceInterval.upper.toFixed(2)}
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="body1">
                                Not available
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>
            
            {tabValue === 1 && multiHorizonForecasts && (
              <Card variant="outlined" sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Multi-Horizon Forecast Analysis
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {['1m', '3m', '6m', '1y'].map((h) => {
                      const forecast = multiHorizonForecasts[h];
                      
                      if (!forecast) {
                        return (
                          <Grid item xs={12} sm={6} lg={3} key={h}>
                            <Card variant="outlined" sx={{ height: '100%' }}>
                              <CardContent>
                                <Typography variant="subtitle1">
                                  {h === '1m' ? '1 Month' : 
                                   h === '3m' ? '3 Months' : 
                                   h === '6m' ? '6 Months' : 
                                   '1 Year'}
                                </Typography>
                                <Box 
                                  display="flex" 
                                  justifyContent="center" 
                                  alignItems="center"
                                  height={100}
                                >
                                  <Typography variant="body2" color="text.secondary">
                                    Data not available
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      }
                      
                      const isSelected = horizon === h;
                      
                      return (
                        <Grid item xs={12} sm={6} lg={3} key={h}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              height: '100%',
                              border: isSelected ? 2 : 1,
                              borderColor: isSelected ? 'primary.main' : 'divider',
                              cursor: 'pointer',
                              '&:hover': {
                                boxShadow: 2
                              }
                            }}
                            onClick={() => handleHorizonChange(null, h)}
                          >
                            <CardContent>
                              <Typography 
                                variant="subtitle1" 
                                color={isSelected ? 'primary' : 'inherit'}
                                fontWeight={isSelected ? 'bold' : 'normal'}
                              >
                                {h === '1m' ? '1 Month' : 
                                 h === '3m' ? '3 Months' : 
                                 h === '6m' ? '6 Months' : 
                                 '1 Year'}
                              </Typography>
                              
                              <Box mt={2}>
                                <Typography variant="h5" gutterBottom>
                                  {forecast.predictedPrice.toFixed(2)} {forecast.currency}
                                </Typography>
                                
                                {forecast.confidenceInterval && (
                                  <Typography variant="body2" color="text.secondary">
                                    Range: {forecast.confidenceInterval.lower.toFixed(2)} - {forecast.confidenceInterval.upper.toFixed(2)}
                                  </Typography>
                                )}
                                
                                <Typography variant="body2" color="text.secondary">
                                  Confidence: {forecast.confidenceScore}%
                                </Typography>
                                
                                <Typography variant="body2" color="text.secondary">
                                  Date: {new Date(forecast.date).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Grid>
          
          {tabValue !== 1 && (
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Forecast Factors
                  </Typography>
                  
                  {loading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <CircularProgress />
                    </Box>
                  ) : compareMode ? (
                    <Box>
                      {compareData ? (
                        Object.keys(compareData).map((code) => {
                          const data = compareData[code];
                          if (data.error) {
                            return (
                              <Box key={code} mb={2}>
                                <Typography variant="subtitle2" gutterBottom>
                                  {code}: Error
                                </Typography>
                                <Typography variant="body2" color="error">
                                  {data.error}
                                </Typography>
                              </Box>
                            );
                          }
                          
                          return (
                            <Box key={code} mb={3}>
                              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                {code === hsCode ? `${code} (Primary)` : code}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {data.description}
                              </Typography>
                              
                              <Box display="flex" alignItems="center" mt={1} mb={1}>
                                <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="body2">
                                  Forecast: {formatDate(data.forecast.date)}
                                </Typography>
                              </Box>
                              
                              <Typography variant="h6">
                                {data.forecast.predictedPrice.toFixed(2)} {data.forecast.currency}/{data.forecast.unit}
                              </Typography>
                              
                              <Box mt={1}>
                                <Typography variant="caption" color="text.secondary">
                                  Confidence: {data.forecast.confidenceScore}%
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={data.forecast.confidenceScore} 
                                  sx={{ height: 4, mb: 1 }}
                                  color={
                                    data.forecast.confidenceScore >= 70 ? 'success' :
                                    data.forecast.confidenceScore >= 50 ? 'info' :
                                    'warning'
                                  }
                                />
                              </Box>
                              
                              <Divider sx={{ my: 1 }} />
                            </Box>
                          );
                        })
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No comparison data available
                        </Typography>
                      )}
                    </Box>
                  ) : forecastData && forecastData.factors && forecastData.factors.length > 0 ? (
                    <List disablePadding>
                      {forecastData.factors.map((factor, index) => (
                        <ListItem key={index} divider={index < forecastData.factors.length - 1}>
                          <ListItemIcon>
                            {getFactorImpactIcon(factor.impact)}
                          </ListItemIcon>
                          <ListItemText
                            primary={factor.name}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {factor.description}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  color={
                                    factor.impact > 0 ? 'error.main' : 
                                    factor.impact < 0 ? 'success.main' : 
                                    'text.secondary'
                                  }
                                >
                                  Impact: {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(2)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box p={2}>
                      <Typography variant="body2" color="text.secondary" align="center">
                        No factor data available for this forecast
                      </Typography>
                    </Box>
                  )}
                  
                  {forecastData && forecastData.modelVersion && (
                    <Box mt={2} pt={2} borderTop={1} borderColor="divider">
                      <Typography variant="caption" color="text.secondary">
                        Model Version: {forecastData.modelVersion}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Generated: {new Date(forecastData.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
      
      {!hsCodeInfo && !loading && !error && (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Enter an HS Code to View Price Forecasts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Our AI-powered forecasting system analyzes historical price data, current market conditions, 
            and risk factors to predict future commodity prices with confidence intervals.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}