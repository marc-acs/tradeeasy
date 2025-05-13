import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hsCodeAPI, priceAPI } from '../services/api';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  CalendarMonth as CalendarIcon,
  CompareArrows as CompareIcon,
  FileDownload as DownloadIcon,
  InfoOutlined as InfoIcon
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
// Date picker imports removed temporarily
// import { DatePicker } from '@mui/x-date-pickers';
// import { LocalizationProvider } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

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

export default function PriceAnalysis() {
  const { hsCode: hsCodeParam } = useParams();
  const navigate = useNavigate();
  const [hsCode, setHsCode] = useState(hsCodeParam || '');
  const [hsCodeInfo, setHsCodeInfo] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedHsCodes, setSavedHsCodes] = useState([]);
  const [timeRange, setTimeRange] = useState('90d');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState(new Date());
  const [currency, setCurrency] = useState('USD');
  const [compareCodes, setCompareCodes] = useState([]);
  const [compareData, setCompareData] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [dataSourceInfo, setDataSourceInfo] = useState(null);
  
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
    navigate(`/prices/${hsCode}`);
    fetchHsCodeData(hsCode);
  };
  
  // Fetch HS code data and price history
  const fetchHsCodeData = async (code) => {
    setLoading(true);
    setError('');
    
    try {
      // Get HS code details
      const hsCodeResponse = await hsCodeAPI.getByCode(code);
      setHsCodeInfo(hsCodeResponse.data.data.hsCode);
      
      // Get price history
      await fetchPriceHistory(code);
    } catch (err) {
      console.error('Error fetching HS code data:', err);
      setError(typeof err === 'string' ? err : 'Failed to find HS code. Please check the number and try again.');
      setHsCodeInfo(null);
      setPriceData(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch price history
  const fetchPriceHistory = async (code = hsCode) => {
    if (!code) return;
    
    setLoading(true);
    
    try {
      if (compareMode && compareCodes.length > 0) {
        // Fetch comparison data
        const response = await priceAPI.compare(
          [code, ...compareCodes],
          {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            currency
          }
        );
        
        // Format data for Chart.js
        const allCodes = [code, ...compareCodes];
        const datasets = allCodes.map((c, index) => {
          const data = response.data.data[c];
          
          if (!data || data.error) {
            return null;
          }
          
          // Generate color based on index
          const colors = [
            'rgb(54, 162, 235)',
            'rgb(255, 99, 132)',
            'rgb(75, 192, 192)',
            'rgb(255, 159, 64)',
            'rgb(153, 102, 255)'
          ];
          
          // Format unit label if available
          let label = data.description;
          if (data.prices && data.prices.length > 0 && data.prices[0].unit) {
            const formattedUnit = formatUnitLabel(data.prices[0].unit);
            label = `${data.description} (${formattedUnit})`;
          }
          
          return {
            label,
            data: data.prices.map(p => p.price),
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length] + '20',
            fill: false,
            tension: 0.3
          };
        }).filter(Boolean);
        
        // Add volume dataset if available
        const mainData = response.data.data[code];
        if (mainData && mainData.prices && mainData.prices.some(p => p.volume)) {
          const volumeData = mainData.prices
            .filter(p => p.volume && p.volume.amount !== undefined)
            .map(p => p.volume.amount);
          
          if (volumeData.length > 0) {
            // Scale volume data to fit on the same chart as price
            const maxPrice = Math.max(...datasets.flatMap(ds => ds.data));
            const maxVolume = Math.max(...volumeData);
            const scaleFactor = maxPrice / (maxVolume === 0 ? 1 : maxVolume) * 0.3; // Scale to 30% of price
            
            datasets.push({
              label: 'Trading Volume',
              data: volumeData.map(v => v * scaleFactor),
              borderColor: 'rgba(128, 128, 128, 0.7)',
              backgroundColor: 'rgba(128, 128, 128, 0.2)',
              borderDash: [5, 5],
              pointRadius: 0,
              fill: true,
              yAxisID: 'y1', // Secondary y-axis
              type: 'line'
            });
          }
        }
        
        const chartData = {
          labels: response.data.data[code]?.prices.map(p => 
            new Date(p.date).toLocaleDateString()
          ) || [],
          datasets
        };
        
        // Store source information for display
        const sourceInfo = response.data.sourceInfo || {
          sources: ['Mock Data'],
          dataQuality: 'Development',
          hasVolume: false,
          lastUpdated: new Date().toISOString()
        };
        
        setCompareData(chartData);
        setDataSourceInfo(sourceInfo);
      } else {
        // Fetch single HS code data
        const response = await priceAPI.getHistory(code, {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          currency
        });
        
        // Format data for Chart.js
        const prices = response.data.data;
        
        // Create price dataset
        // Get unit information and format appropriately
        const unit = prices[0]?.unit || 'unit';
        const formattedUnit = formatUnitLabel(unit);
        
        const datasets = [
          {
            label: `Price (${currency}/${formattedUnit})`,
            data: prices.map(p => p.price),
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: true,
            tension: 0.3
          }
        ];
        
        // Add volume dataset if available
        if (prices.some(p => p.volume)) {
          const volumeData = prices
            .filter(p => p.volume && p.volume.amount !== undefined)
            .map(p => p.volume.amount);
          
          if (volumeData.length > 0) {
            // Calculate max values for scaling
            const maxPrice = Math.max(...prices.map(p => p.price));
            const maxVolume = Math.max(...volumeData);
            const scaleFactor = maxPrice / (maxVolume === 0 ? 1 : maxVolume) * 0.3; // Scale to 30% of price
            
            datasets.push({
              label: 'Trading Volume',
              data: volumeData.map(v => v * scaleFactor),
              borderColor: 'rgba(128, 128, 128, 0.7)',
              backgroundColor: 'rgba(128, 128, 128, 0.2)',
              borderDash: [5, 5],
              pointRadius: 0,
              fill: true,
              yAxisID: 'y1', // Secondary y-axis
              type: 'line'
            });
          }
        }
        
        const chartData = {
          labels: prices.map(p => new Date(p.date).toLocaleDateString()),
          datasets
        };
        
        // Store source information for display
        const sourceInfo = response.data.sourceInfo || {
          source: 'Mock Data',
          dataQuality: 'Development',
          lastUpdated: new Date().toISOString()
        };
        
        setPriceData(chartData);
        setDataSourceInfo(sourceInfo);
      }
    } catch (err) {
      console.error('Error fetching price history:', err);
      setError(typeof err === 'string' ? err : 'Failed to fetch price data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle time range change
  const handleTimeRangeChange = (event, newRange) => {
    if (newRange !== null) {
      setTimeRange(newRange);
      
      const now = new Date();
      let newStartDate;
      
      switch (newRange) {
        case '7d':
          newStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          newStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          newStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          newStartDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        case '5y':
          newStartDate = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
          break;
        case 'custom':
          // Don't change dates for custom
          return;
        default:
          newStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      }
      
      setStartDate(newStartDate);
      setEndDate(now);
      
      if (hsCode) {
        // Refetch with new date range
        fetchPriceHistory();
      }
    }
  };
  
  // Handle currency change
  const handleCurrencyChange = (event) => {
    setCurrency(event.target.value);
    
    if (hsCode) {
      // Refetch with new currency
      fetchPriceHistory();
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
  
  // Toggle compare mode
  const handleToggleCompare = () => {
    setCompareMode(!compareMode);
    
    if (!compareMode) {
      // Switching to compare mode
      setCompareCodes([]);
      setCompareData(null);
    } else {
      // Switching back to single mode
      fetchPriceHistory();
    }
  };
  
  // Add HS code to compare list
  const handleAddCompareCode = (code) => {
    if (!code || compareCodes.includes(code) || code === hsCode) return;
    
    const newCompareCodes = [...compareCodes, code];
    setCompareCodes(newCompareCodes);
    
    // Fetch comparison data
    if (hsCode) {
      fetchPriceHistory();
    }
  };
  
  // Remove HS code from compare list
  const handleRemoveCompareCode = (code) => {
    const newCompareCodes = compareCodes.filter(c => c !== code);
    setCompareCodes(newCompareCodes);
    
    // Fetch updated comparison data
    if (hsCode) {
      fetchPriceHistory();
    }
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
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            
            if (label) {
              label += ': ';
            }
            
            if (context.parsed.y !== null) {
              // Format volume with thousand separators
              if (context.dataset.yAxisID === 'y1') {
                // Remove the scaling for display
                const maxPrice = Math.max(...context.chart.data.datasets[0].data);
                const maxVolume = Math.max(...context.dataset.data);
                const scaleFactor = maxPrice / (maxVolume === 0 ? 1 : maxVolume) * 0.3;
                // Unscale for display
                const actualVolume = Math.round(context.parsed.y / scaleFactor);
                label += actualVolume.toLocaleString();
              } else {
                // Format price based on unit type
                const datasetLabel = context.dataset.label || '';
                if (datasetLabel.includes('bushel') || datasetLabel.includes('bu)')) {
                  // Agricultural commodities often priced with 4 decimal places
                  label += context.parsed.y.toFixed(4);
                } else if (datasetLabel.includes('ounce') || datasetLabel.includes('oz)')) {
                  // Precious metals often priced with 3 decimal places
                  label += context.parsed.y.toFixed(3);
                } else {
                  // Standard format with 2 decimal places
                  label += context.parsed.y.toFixed(2);
                }
              }
            }
            return label;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Price'
        }
      },
      y1: {
        display: false, // Only show when volume data is present
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Volume'
        },
        grid: {
          drawOnChartArea: false, // Only show grid for the main y-axis
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 2,
        hitRadius: 8,
        hoverRadius: 6,
      },
    },
  };
  
  // Check if current HS code is saved
  const isHsCodeSaved = hsCodeInfo && 
    savedHsCodes.some(item => item.code === hsCodeInfo.code);
    
  // Function to format unit labels for more descriptive display
  const formatUnitLabel = (unit) => {
    switch(unit) {
      case 'bu':
        return 'bushel';
      case 'lb':
        return 'pound';
      case 'kg':
        return 'kilogram';
      case 'mt':
        return 'metric ton';
      case 'bbl':
        return 'barrel';
      case 'oz':
        return 'ounce';
      default:
        return unit;
    }
  };
  
  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Commodity Price Analysis
        </Typography>
        
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={4} lg={3}>
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
                  <IconButton
                    edge="end"
                    onClick={handleSearch}
                    disabled={loading || !hsCode}
                  >
                    <SearchIcon />
                  </IconButton>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="currency-select-label">Currency</InputLabel>
              <Select
                labelId="currency-select-label"
                id="currency-select"
                value={currency}
                onChange={handleCurrencyChange}
                label="Currency"
              >
                <MenuItem value="USD">USD (US Dollar)</MenuItem>
                <MenuItem value="EUR">EUR (Euro)</MenuItem>
                <MenuItem value="ARS">ARS (Argentine Peso)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={handleTimeRangeChange}
              aria-label="time range"
              size="small"
              fullWidth
            >
              <ToggleButton value="7d">7D</ToggleButton>
              <ToggleButton value="30d">30D</ToggleButton>
              <ToggleButton value="90d">90D</ToggleButton>
              <ToggleButton value="1y">1Y</ToggleButton>
              <ToggleButton value="5y">5Y</ToggleButton>
              <ToggleButton value="custom">Custom</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              variant={compareMode ? 'contained' : 'outlined'}
              color="primary"
              fullWidth
              startIcon={<CompareIcon />}
              onClick={handleToggleCompare}
            >
              {compareMode ? 'Comparing' : 'Compare'}
            </Button>
          </Grid>
        </Grid>
        
        {timeRange === 'custom' && (
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    setStartDate(new Date(e.target.value));
                    if (hsCode) fetchPriceHistory();
                  }}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    max: endDate.toISOString().split('T')[0],
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    setEndDate(new Date(e.target.value));
                    if (hsCode) fetchPriceHistory();
                  }}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    max: new Date().toISOString().split('T')[0],
                    min: startDate.toISOString().split('T')[0],
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
      
      {compareMode && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
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
          </Stack>
          
          <Box mb={2}>
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
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}
      
      {hsCodeInfo && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h5" gutterBottom>
                    {hsCodeInfo.code}
                  </Typography>
                  
                  <IconButton
                    onClick={handleToggleSave}
                    color={isHsCodeSaved ? 'primary' : 'default'}
                  >
                    {isHsCodeSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                </Box>
                
                <Typography variant="body1" gutterBottom>
                  {hsCodeInfo.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Section: {hsCodeInfo.section}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  Chapter: {hsCodeInfo.chapter}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  Search Count: {hsCodeInfo.searchCount}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Price Data Range:
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  From: {startDate.toLocaleDateString()}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  To: {endDate.toLocaleDateString()}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                {dataSourceInfo && (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      Data Source Information:
                    </Typography>
                    
                    <Typography variant="body2" gutterBottom>
                      Source: {compareMode 
                        ? (dataSourceInfo.sources || []).includes('Quandl') 
                          ? 'Quandl API' 
                          : 'Enhanced Model Data'
                        : dataSourceInfo.source === 'Quandl' 
                          ? 'Quandl API' 
                          : 'Enhanced Model Data'
                      }
                    </Typography>
                    
                    <Typography variant="body2" gutterBottom>
                      Quality: {dataSourceInfo.dataQuality || 'Development'}
                    </Typography>
                    
                    {dataSourceInfo.notes && (
                      <Typography variant="body2" gutterBottom>
                        Notes: {dataSourceInfo.notes}
                      </Typography>
                    )}
                    
                    <Typography variant="body2" gutterBottom>
                      Updated: {new Date(dataSourceInfo.lastUpdated).toLocaleString()}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                  </>
                )}
                
                <Box display="flex" justifyContent="space-between">
                  <Tooltip title="Download Price Data">
                    <IconButton>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="More Information">
                    <IconButton>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} lg={9}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6">
                    Price Trend {compareMode ? '(Comparison)' : ''}
                  </Typography>
                  
                  {dataSourceInfo && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip 
                        size="small"
                        label={`Data Source: ${
                          compareMode
                            ? (dataSourceInfo.sources || []).includes('Quandl')
                              ? 'Quandl API'
                              : 'Enhanced Model Data'
                            : dataSourceInfo.source === 'Quandl' 
                              ? 'Quandl API' 
                              : 'Enhanced Model Data'
                        }`}
                        color={
                          (compareMode 
                            ? (dataSourceInfo.sources || []).includes('Quandl')
                            : dataSourceInfo.source === 'Quandl')
                            ? 'primary' 
                            : 'default'
                        }
                        variant="outlined"
                      />
                      {(compareMode ? dataSourceInfo.hasVolume : dataSourceInfo.hasVolume !== false) && (
                        <Chip 
                          size="small" 
                          label="Volume Data Available" 
                          color="success" 
                          variant="outlined" 
                        />
                      )}
                      <Tooltip title={`Last updated: ${new Date(dataSourceInfo.lastUpdated).toLocaleString()}`}>
                        <InfoIcon fontSize="small" color="action" />
                      </Tooltip>
                    </Box>
                  )}
                </Box>
                
                {!loading && !error && (compareMode ? compareData : priceData) ? (
                  <Box sx={{ height: 400 }}>
                    <Line 
                      data={compareMode ? compareData : priceData} 
                      options={{
                        ...chartOptions,
                        scales: {
                          ...chartOptions.scales,
                          y1: {
                            ...chartOptions.scales.y1,
                            display: compareMode 
                              ? compareData?.datasets.some(d => d.yAxisID === 'y1') 
                              : priceData?.datasets.some(d => d.yAxisID === 'y1')
                          }
                        }
                      }} 
                    />
                  </Box>
                ) : (
                  <Box 
                    display="flex" 
                    justifyContent="center" 
                    alignItems="center" 
                    height={400}
                  >
                    <Typography variant="body1" color="text.secondary">
                      {loading 
                        ? 'Loading price data...' 
                        : error 
                          ? 'Error loading price data' 
                          : 'No price data available'}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {!hsCodeInfo && !loading && !error && (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Enter an HS Code to View Price Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Search for a specific HS code to view historical price trends, 
            analyze market dynamics, and make informed trade decisions.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}