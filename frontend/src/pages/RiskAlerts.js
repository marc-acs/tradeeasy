import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { riskAPI, hsCodeAPI } from '../services/api';
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
  InputAdornment,
  Chip,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Stack,
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  Warning as WarningIcon,
  Public as PublicIcon,
  CalendarToday as CalendarIcon,
  LocalOffer as TagIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ChartIcon,
  WbSunny as WeatherIcon,
  Work as SupplyIcon,
  Gavel as RegulatoryIcon,
  Payment as EconomicIcon,
  Flag as PoliticalIcon,
  People as DemandIcon
} from '@mui/icons-material';

export default function RiskAlerts() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [risks, setRisks] = useState([]);
  const [filteredRisks, setFilteredRisks] = useState([]);
  const [savedHsCodes, setSavedHsCodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [minSeverity, setMinSeverity] = useState(1);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchMode, setSearchMode] = useState('hscode'); // 'hscode' or 'region'
  const [searchValue, setSearchValue] = useState('');
  
  // Fetch initial data
  useEffect(() => {
    fetchAllRisks();
    fetchSavedHsCodes();
  }, []);
  
  // Fetch all risks
  const fetchAllRisks = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await riskAPI.getAll({
        active: 'true',
        limit: 50
      });
      
      setRisks(response.data.data.risks);
      setFilteredRisks(response.data.data.risks);
      setTotalPages(Math.ceil(response.data.data.risks.length / 10));
    } catch (err) {
      console.error('Error fetching risks:', err);
      setError(typeof err === 'string' ? err : 'Failed to fetch risk alerts. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch saved HS codes
  const fetchSavedHsCodes = async () => {
    try {
      const response = await hsCodeAPI.getSaved();
      setSavedHsCodes(response.data.data.hsCodes);
    } catch (err) {
      console.error('Error fetching saved HS codes:', err);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
    
    // Apply filters based on tab
    if (newValue === 0) {
      // All risks
      applyFilters(risks, '', '', minSeverity);
    } else if (newValue === 1) {
      // High severity risks
      applyFilters(risks, typeFilter, regionFilter, 4);
    } else if (newValue === 2) {
      // Weather risks
      applyFilters(risks, 'weather', regionFilter, minSeverity);
    } else if (newValue === 3) {
      // Supply risks
      applyFilters(risks, 'supply', regionFilter, minSeverity);
    } else if (newValue === 4) {
      // Saved HS codes
      const savedCodes = savedHsCodes.map(hscode => hscode.code);
      const savedRisks = risks.filter(risk => 
        risk.affectedHsCodes.some(code => savedCodes.includes(code))
      );
      setFilteredRisks(savedRisks);
      setTotalPages(Math.ceil(savedRisks.length / 10));
    }
  };
  
  // Apply filters
  const applyFilters = (riskData, type, region, severity) => {
    let filtered = [...riskData];
    
    // Apply type filter
    if (type) {
      filtered = filtered.filter(risk => risk.type === type);
    }
    
    // Apply region filter
    if (region) {
      filtered = filtered.filter(risk => 
        risk.affectedRegions.some(r => r.toLowerCase().includes(region.toLowerCase()))
      );
    }
    
    // Apply severity filter
    if (severity > 1) {
      filtered = filtered.filter(risk => risk.severity >= severity);
    }
    
    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(risk => 
        risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        risk.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        risk.affectedHsCodes.some(code => code.includes(searchTerm))
      );
    }
    
    setFilteredRisks(filtered);
    setTotalPages(Math.ceil(filtered.length / 10));
  };
  
  // Handle region filter change
  const handleRegionFilterChange = (event) => {
    const region = event.target.value;
    setRegionFilter(region);
    applyFilters(risks, typeFilter, region, minSeverity);
  };
  
  // Handle type filter change
  const handleTypeFilterChange = (event) => {
    const type = event.target.value;
    setTypeFilter(type);
    applyFilters(risks, type, regionFilter, minSeverity);
  };
  
  // Handle severity filter change
  const handleSeverityFilterChange = (event) => {
    const severity = event.target.value;
    setMinSeverity(severity);
    applyFilters(risks, typeFilter, regionFilter, severity);
  };
  
  // Handle search term change
  const handleSearchTermChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    
    if (term === '') {
      applyFilters(risks, typeFilter, regionFilter, minSeverity);
    } else {
      applyFilters(risks, typeFilter, regionFilter, minSeverity);
    }
  };
  
  // Handle search by HS code or region
  const handleSearch = async () => {
    if (!searchValue) return;
    
    setLoading(true);
    setError('');
    
    try {
      let response;
      
      if (searchMode === 'hscode') {
        response = await riskAPI.getByHsCode(searchValue);
      } else {
        response = await riskAPI.getByRegion(searchValue);
      }
      
      const fetchedRisks = response.data.data.risks;
      setFilteredRisks(fetchedRisks);
      setTotalPages(Math.ceil(fetchedRisks.length / 10));
      setTabValue(-1); // Custom tab for search results
    } catch (err) {
      console.error('Error searching risks:', err);
      setError(typeof err === 'string' ? err : `Failed to fetch risks for ${searchMode === 'hscode' ? 'HS code' : 'region'}.`);
      setFilteredRisks([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  // Get risk icon based on type
  const getRiskIcon = (type) => {
    switch (type) {
      case 'weather':
        return <WeatherIcon />;
      case 'political':
        return <PoliticalIcon />;
      case 'economic':
        return <EconomicIcon />;
      case 'supply':
        return <SupplyIcon />;
      case 'demand':
        return <DemandIcon />;
      case 'regulatory':
        return <RegulatoryIcon />;
      default:
        return <WarningIcon />;
    }
  };
  
  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 5:
        return 'error';
      case 4:
        return 'error';
      case 3:
        return 'warning';
      case 2:
        return 'info';
      case 1:
      default:
        return 'success';
    }
  };
  
  // Get price impact icon
  const getPriceImpactIcon = (direction) => {
    switch (direction) {
      case 'increase':
        return <TrendingUpIcon color="error" />;
      case 'decrease':
        return <TrendingDownIcon color="success" />;
      case 'volatile':
        return <ChartIcon color="warning" />;
      default:
        return <ChartIcon color="action" />;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Current page of risks
  const currentRisks = filteredRisks.slice((page - 1) * 10, page * 10);
  
  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Risk Alerts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor and analyze risks that could impact global trade and commodity prices
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center">
              <FormControl variant="outlined" size="small" sx={{ width: 150, mr: 1 }}>
                <InputLabel id="search-mode-label">Search By</InputLabel>
                <Select
                  labelId="search-mode-label"
                  id="search-mode"
                  value={searchMode}
                  onChange={(e) => setSearchMode(e.target.value)}
                  label="Search By"
                >
                  <MenuItem value="hscode">HS Code</MenuItem>
                  <MenuItem value="region">Region</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                size="small"
                label={searchMode === 'hscode' ? 'HS Code' : 'Region'}
                variant="outlined"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                sx={{ mr: 1, flexGrow: 1 }}
                placeholder={
                  searchMode === 'hscode' 
                    ? 'e.g. 120190' 
                    : 'e.g. Argentina'
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={handleSearch}
                        disabled={loading || !searchValue}
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
              
              <TextField
                label="Search Alerts"
                variant="outlined"
                fullWidth
                size="small"
                margin="normal"
                value={searchTerm}
                onChange={handleSearchTermChange}
                placeholder="Search by keyword"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Divider sx={{ my: 2 }} />
              
              <FormControl fullWidth variant="outlined" size="small" margin="normal">
                <InputLabel id="type-filter-label">Risk Type</InputLabel>
                <Select
                  labelId="type-filter-label"
                  id="type-filter"
                  value={typeFilter}
                  onChange={handleTypeFilterChange}
                  label="Risk Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="weather">Weather</MenuItem>
                  <MenuItem value="political">Political</MenuItem>
                  <MenuItem value="economic">Economic</MenuItem>
                  <MenuItem value="supply">Supply Chain</MenuItem>
                  <MenuItem value="demand">Demand</MenuItem>
                  <MenuItem value="regulatory">Regulatory</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth variant="outlined" size="small" margin="normal">
                <InputLabel id="region-filter-label">Region</InputLabel>
                <Select
                  labelId="region-filter-label"
                  id="region-filter"
                  value={regionFilter}
                  onChange={handleRegionFilterChange}
                  label="Region"
                >
                  <MenuItem value="">All Regions</MenuItem>
                  <MenuItem value="argentina">Argentina</MenuItem>
                  <MenuItem value="brazil">Brazil</MenuItem>
                  <MenuItem value="united states">United States</MenuItem>
                  <MenuItem value="china">China</MenuItem>
                  <MenuItem value="europe">Europe</MenuItem>
                  <MenuItem value="southeast asia">Southeast Asia</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth variant="outlined" size="small" margin="normal">
                <InputLabel id="severity-filter-label">Min Severity</InputLabel>
                <Select
                  labelId="severity-filter-label"
                  id="severity-filter"
                  value={minSeverity}
                  onChange={handleSeverityFilterChange}
                  label="Min Severity"
                >
                  <MenuItem value={1}>All Severities</MenuItem>
                  <MenuItem value={2}>Low & Above (2+)</MenuItem>
                  <MenuItem value={3}>Medium & Above (3+)</MenuItem>
                  <MenuItem value={4}>High & Above (4+)</MenuItem>
                  <MenuItem value={5}>Critical Only (5)</MenuItem>
                </Select>
              </FormControl>
              
              <Divider sx={{ my: 2 }} />
              
              <Stack direction="row" spacing={1} justifyContent="center">
                <Chip 
                  icon={<WarningIcon />} 
                  label="1" 
                  color="success" 
                  variant={minSeverity === 1 ? 'filled' : 'outlined'}
                  onClick={() => {
                    setMinSeverity(1);
                    applyFilters(risks, typeFilter, regionFilter, 1);
                  }}
                />
                <Chip 
                  icon={<WarningIcon />} 
                  label="2" 
                  color="info" 
                  variant={minSeverity === 2 ? 'filled' : 'outlined'}
                  onClick={() => {
                    setMinSeverity(2);
                    applyFilters(risks, typeFilter, regionFilter, 2);
                  }}
                />
                <Chip 
                  icon={<WarningIcon />} 
                  label="3" 
                  color="warning" 
                  variant={minSeverity === 3 ? 'filled' : 'outlined'}
                  onClick={() => {
                    setMinSeverity(3);
                    applyFilters(risks, typeFilter, regionFilter, 3);
                  }}
                />
                <Chip 
                  icon={<WarningIcon />} 
                  label="4" 
                  color="error" 
                  variant={minSeverity === 4 ? 'filled' : 'outlined'}
                  onClick={() => {
                    setMinSeverity(4);
                    applyFilters(risks, typeFilter, regionFilter, 4);
                  }}
                />
                <Chip 
                  icon={<WarningIcon />} 
                  label="5" 
                  color="error" 
                  variant={minSeverity === 5 ? 'filled' : 'outlined'}
                  onClick={() => {
                    setMinSeverity(5);
                    applyFilters(risks, typeFilter, regionFilter, 5);
                  }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={9}>
          <Card variant="outlined">
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="risk tabs"
              >
                <Tab 
                  label={
                    <Box display="flex" alignItems="center">
                      <Badge 
                        badgeContent={risks.length} 
                        color="primary" 
                        max={99}
                        sx={{ mr: 1 }}
                      >
                        <WarningIcon />
                      </Badge>
                      All Risks
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box display="flex" alignItems="center">
                      <Badge 
                        badgeContent={risks.filter(r => r.severity >= 4).length} 
                        color="error" 
                        max={99}
                        sx={{ mr: 1 }}
                      >
                        <WarningIcon />
                      </Badge>
                      High Severity
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box display="flex" alignItems="center">
                      <WeatherIcon sx={{ mr: 1 }} />
                      Weather
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box display="flex" alignItems="center">
                      <SupplyIcon sx={{ mr: 1 }} />
                      Supply Chain
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box display="flex" alignItems="center">
                      <Badge 
                        badgeContent={
                          risks.filter(risk => 
                            risk.affectedHsCodes.some(code => 
                              savedHsCodes.map(hscode => hscode.code).includes(code)
                            )
                          ).length
                        } 
                        color="primary" 
                        max={99}
                        sx={{ mr: 1 }}
                      >
                        <WarningIcon />
                      </Badge>
                      My HS Codes
                    </Box>
                  } 
                />
              </Tabs>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ m: 2 }}>
                {error}
              </Alert>
            )}
            
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                {currentRisks.length === 0 ? (
                  <Box p={4} textAlign="center">
                    <Typography variant="body1" color="text.secondary">
                      No risks found matching your criteria
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {currentRisks.map((risk) => (
                      <React.Fragment key={risk._id}>
                        <ListItem
                          alignItems="flex-start"
                          sx={{ 
                            p: 2,
                            borderLeft: `4px solid ${
                              risk.severity >= 4 ? '#f44336' : 
                              risk.severity >= 3 ? '#ff9800' : 
                              risk.severity >= 2 ? '#2196f3' : 
                              '#4caf50'
                            }`
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Avatar
                              sx={{ 
                                bgcolor: `${getSeverityColor(risk.severity)}.light`,
                                color: `${getSeverityColor(risk.severity)}.main`,
                              }}
                            >
                              {getRiskIcon(risk.type)}
                            </Avatar>
                          </ListItemIcon>
                          
                          <ListItemText
                            primary={
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {risk.title}
                                </Typography>
                                <Chip
                                  label={`Severity: ${risk.severity}`}
                                  size="small"
                                  color={getSeverityColor(risk.severity)}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" paragraph sx={{ mt: 1 }}>
                                  {risk.description}
                                </Typography>
                                
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                  <Grid item xs={12} sm={6}>
                                    <Box display="flex" alignItems="center" mb={1}>
                                      <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                      <Typography variant="body2" color="text.secondary">
                                        {formatDate(risk.startDate)}
                                        {risk.endDate && ` - ${formatDate(risk.endDate)}`}
                                      </Typography>
                                    </Box>
                                    
                                    <Box display="flex" alignItems="center" mb={1}>
                                      <PublicIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                      <Typography variant="body2" color="text.secondary">
                                        Affected regions: {risk.affectedRegions.join(', ')}
                                      </Typography>
                                    </Box>
                                    
                                    {risk.affectedHsCodes && risk.affectedHsCodes.length > 0 && (
                                      <Box display="flex" alignItems="flex-start" mb={1}>
                                        <TagIcon fontSize="small" sx={{ mr: 1, mt: 0.5, color: 'text.secondary' }} />
                                        <Box>
                                          <Typography variant="body2" color="text.secondary">
                                            Affected HS Codes:
                                          </Typography>
                                          <Box mt={0.5}>
                                            {risk.affectedHsCodes.map(code => (
                                              <Chip
                                                key={code}
                                                label={code}
                                                size="small"
                                                variant="outlined"
                                                sx={{ mr: 0.5, mb: 0.5 }}
                                                onClick={() => navigate(`/prices/${code}`)}
                                              />
                                            ))}
                                          </Box>
                                        </Box>
                                      </Box>
                                    )}
                                  </Grid>
                                  
                                  <Grid item xs={12} sm={6}>
                                    {risk.expectedPriceImpact && risk.expectedPriceImpact.direction !== 'unknown' && (
                                      <Box display="flex" alignItems="center" mb={1}>
                                        {getPriceImpactIcon(risk.expectedPriceImpact.direction)}
                                        <Typography variant="body2" sx={{ ml: 1 }}>
                                          Expected price impact: 
                                          <strong> {risk.expectedPriceImpact.direction}</strong>
                                          {risk.expectedPriceImpact.percentage && 
                                            ` by approximately ${risk.expectedPriceImpact.percentage}%`}
                                        </Typography>
                                      </Box>
                                    )}
                                    
                                    <Box display="flex" alignItems="center" mb={1}>
                                      <Chip
                                        label={risk.type.charAt(0).toUpperCase() + risk.type.slice(1)}
                                        size="small"
                                        icon={getRiskIcon(risk.type)}
                                        sx={{ mr: 0.5 }}
                                      />
                                      
                                      {risk.source && (
                                        <Chip
                                          label={`Source: ${risk.source}`}
                                          size="small"
                                          variant="outlined"
                                          sx={{ mr: 0.5 }}
                                        />
                                      )}
                                    </Box>
                                    
                                    {risk.mitigationSteps && risk.mitigationSteps.length > 0 && (
                                      <Box>
                                        <Typography variant="body2" color="text.secondary">
                                          Mitigation steps:
                                        </Typography>
                                        <List dense disablePadding>
                                          {risk.mitigationSteps.map((step, index) => (
                                            <ListItem key={index} disablePadding>
                                              <ListItemText
                                                primary={`${index + 1}. ${step}`}
                                                primaryTypographyProps={{
                                                  variant: 'body2',
                                                  color: 'text.secondary'
                                                }}
                                              />
                                            </ListItem>
                                          ))}
                                        </List>
                                      </Box>
                                    )}
                                  </Grid>
                                </Grid>
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                )}
                
                {totalPages > 1 && (
                  <Box display="flex" justifyContent="center" p={2}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                    />
                  </Box>
                )}
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}