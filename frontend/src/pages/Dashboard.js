import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hsCodeAPI, priceAPI, riskAPI } from '../services/api';
import {
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Link,
  Chip,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Calculate as CalculateIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [hsCode, setHsCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [savedHsCodes, setSavedHsCodes] = useState([]);
  const [recentRisks, setRecentRisks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch user's saved HS codes
  useEffect(() => {
    async function fetchSavedHsCodes() {
      try {
        const response = await hsCodeAPI.getSaved();
        setSavedHsCodes(response.data.data.hsCodes);
      } catch (err) {
        console.error('Error fetching saved HS codes:', err);
      }
    }
    
    fetchSavedHsCodes();
  }, []);
  
  // Fetch recent risk alerts
  useEffect(() => {
    async function fetchRecentRisks() {
      try {
        const response = await riskAPI.getAll({
          active: 'true',
          minSeverity: 3,
          limit: 5
        });
        setRecentRisks(response.data.data.risks);
      } catch (err) {
        console.error('Error fetching risk alerts:', err);
      }
    }
    
    fetchRecentRisks();
  }, []);
  
  // Handle HS code search
  const handleSearch = async () => {
    if (!hsCode) return;
    
    setLoading(true);
    setError('');
    setSearchResult(null);
    setPriceData(null);
    
    try {
      // Get HS code details
      const hsCodeResponse = await hsCodeAPI.getByCode(hsCode);
      setSearchResult(hsCodeResponse.data.data.hsCode);
      
      // Get price history for chart
      const priceResponse = await priceAPI.getHistory(hsCode, {
        format: 'chart',
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      });
      setPriceData(priceResponse.data.data);
    } catch (err) {
      console.error('Error searching HS code:', err);
      setError(typeof err === 'string' ? err : 'Failed to find HS code. Please check the number and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle saving/unsaving HS code
  const handleToggleSave = async () => {
    if (!searchResult) return;
    
    try {
      const isAlreadySaved = savedHsCodes.some(item => item.code === searchResult.code);
      
      if (isAlreadySaved) {
        await hsCodeAPI.unsave(searchResult.code);
        setSavedHsCodes(savedHsCodes.filter(item => item.code !== searchResult.code));
      } else {
        const response = await hsCodeAPI.save(searchResult.code);
        setSavedHsCodes([...savedHsCodes, searchResult]);
      }
    } catch (err) {
      console.error('Error toggling save status:', err);
    }
  };
  
  // Format chart options
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
        radius: 2,
        hitRadius: 8,
        hoverRadius: 6,
      },
    },
  };
  
  // Check if current HS code is saved
  const isHsCodeSaved = searchResult && 
    savedHsCodes.some(item => item.code === searchResult.code);
  
  return (
    <Box>
      <Grid container spacing={3}>
        {/* Welcome card */}
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              backgroundColor: 'primary.light', 
              borderRadius: 2,
              color: 'white'
            }}
          >
            <Typography variant="h4" gutterBottom>
              Welcome back, {currentUser?.name?.split(' ')[0] || 'User'}!
            </Typography>
            <Typography variant="body1">
              TradeEasy Analytics helps you navigate global trade dynamics with ease.
              Search for commodity prices, calculate U.S. tariffs, monitor risks, and more.
            </Typography>
          </Paper>
        </Grid>
        
        {/* HS Code search */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Quick HS Code Search
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Enter a Harmonized System (HS) code to view price trends, tariff rates, and risk alerts.
            </Typography>
            
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel htmlFor="hs-code-search">HS Code</InputLabel>
              <OutlinedInput
                id="hs-code-search"
                value={hsCode}
                onChange={(e) => setHsCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                label="HS Code"
                placeholder="e.g. 120190"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton 
                      edge="end" 
                      onClick={handleSearch}
                      disabled={loading || !hsCode}
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
            
            {loading && <LinearProgress sx={{ mb: 2 }} />}
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {searchResult && (
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {searchResult.code}
                      </Typography>
                      <Typography variant="body1">
                        {searchResult.description}
                      </Typography>
                    </Box>
                    <IconButton 
                      onClick={handleToggleSave}
                      color={isHsCodeSaved ? 'primary' : 'default'}
                    >
                      {isHsCodeSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                  </Box>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button 
                    component={RouterLink} 
                    to={`/prices/${searchResult.code}`}
                    size="small" 
                    startIcon={<TrendingUpIcon />}
                  >
                    Price Analysis
                  </Button>
                  <Button 
                    component={RouterLink} 
                    to={`/tariffs/${searchResult.code}`}
                    size="small" 
                    startIcon={<CalculateIcon />}
                  >
                    Tariff Calculator
                  </Button>
                  <Button 
                    component={RouterLink} 
                    to={`/forecast/${searchResult.code}`}
                    size="small" 
                    startIcon={<ArrowForwardIcon />}
                  >
                    View More
                  </Button>
                </CardActions>
              </Card>
            )}
            
            {priceData && (
              <Box sx={{ height: 300, mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  90-Day Price Trend
                </Typography>
                <Line data={priceData} options={chartOptions} />
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Risk alerts */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">
                Latest Risk Alerts
              </Typography>
              <Button 
                component={RouterLink} 
                to="/risks" 
                endIcon={<ArrowForwardIcon />}
                size="small"
              >
                View All
              </Button>
            </Box>
            
            {recentRisks.length === 0 ? (
              <Box py={2}>
                <Typography color="text.secondary" align="center">
                  No high-severity risks at this time
                </Typography>
              </Box>
            ) : (
              recentRisks.map((risk) => (
                <Card 
                  key={risk._id} 
                  variant="outlined" 
                  sx={{ 
                    mb: 2, 
                    borderLeft: `4px solid ${
                      risk.severity >= 4 ? '#f44336' : 
                      risk.severity >= 3 ? '#ff9800' : 
                      '#4caf50'
                    }`
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {risk.title}
                      </Typography>
                      <Chip
                        label={`Severity: ${risk.severity}`}
                        size="small"
                        color={
                          risk.severity >= 4 ? 'error' : 
                          risk.severity >= 3 ? 'warning' : 
                          'success'
                        }
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {risk.description}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      <Chip 
                        label={risk.type.charAt(0).toUpperCase() + risk.type.slice(1)} 
                        size="small" 
                        variant="outlined"
                      />
                      {risk.expectedPriceImpact && risk.expectedPriceImpact.direction !== 'unknown' && (
                        <Chip 
                          label={`Expected impact: ${risk.expectedPriceImpact.direction}`}
                          size="small" 
                          variant="outlined"
                          color={risk.expectedPriceImpact.direction === 'increase' ? 'error' : 'success'}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Paper>
        </Grid>
        
        {/* Saved HS codes */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">
                Your Saved HS Codes
              </Typography>
              <Button 
                component={RouterLink} 
                to="/saved" 
                endIcon={<ArrowForwardIcon />}
                size="small"
              >
                View All
              </Button>
            </Box>
            
            {savedHsCodes.length === 0 ? (
              <Box py={2} textAlign="center">
                <Typography color="text.secondary" gutterBottom>
                  You haven't saved any HS codes yet
                </Typography>
                <Button
                  component={RouterLink}
                  to="/search"
                  variant="outlined"
                  startIcon={<SearchIcon />}
                >
                  Search HS Codes
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {savedHsCodes.slice(0, 4).map((item) => (
                  <Grid item xs={12} sm={6} md={3} key={item.code}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {item.code}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {item.description}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button 
                          component={RouterLink} 
                          to={`/prices/${item.code}`}
                          size="small" 
                          startIcon={<TrendingUpIcon />}
                        >
                          Prices
                        </Button>
                        <Button 
                          component={RouterLink} 
                          to={`/tariffs/${item.code}`}
                          size="small" 
                          startIcon={<CalculateIcon />}
                        >
                          Tariffs
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}