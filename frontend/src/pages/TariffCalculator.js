import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hsCodeAPI, tariffAPI } from '../services/api';
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
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Calculate as CalculateIcon,
  CurrencyExchange as CurrencyIcon,
  LocalShipping as ShippingIcon,
  GavelRounded as GavelIcon,
  Info as InfoIcon
} from '@mui/icons-material';

export default function TariffCalculator() {
  const { hsCode: hsCodeParam } = useParams();
  const navigate = useNavigate();
  const [hsCode, setHsCode] = useState(hsCodeParam || '');
  const [hsCodeInfo, setHsCodeInfo] = useState(null);
  const [tariffInfo, setTariffInfo] = useState(null);
  const [calculationResult, setCalculationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedHsCodes, setSavedHsCodes] = useState([]);
  
  // Calculator form state
  const [importValue, setImportValue] = useState(1000);
  const [country, setCountry] = useState('US');
  const [specialProgram, setSpecialProgram] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [quantityUnit, setQuantityUnit] = useState('kg');
  const [shippingMode, setShippingMode] = useState('ocean');
  
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
    navigate(`/tariffs/${hsCode}`);
    fetchHsCodeData(hsCode);
  };
  
  // Fetch HS code data and tariff info
  const fetchHsCodeData = async (code) => {
    setLoading(true);
    setError('');
    setCalculationResult(null);
    
    try {
      // Get HS code details
      const hsCodeResponse = await hsCodeAPI.getByCode(code);
      setHsCodeInfo(hsCodeResponse.data.data.hsCode);
      
      // Get tariff information
      const tariffResponse = await tariffAPI.getCurrent(code, { country });
      setTariffInfo(tariffResponse.data.data);
    } catch (err) {
      console.error('Error fetching HS code data:', err);
      setError(typeof err === 'string' ? err : 'Failed to find HS code or tariff information. Please check the code and try again.');
      setHsCodeInfo(null);
      setTariffInfo(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle country change
  const handleCountryChange = (event) => {
    setCountry(event.target.value);
    setSpecialProgram('');
    
    if (hsCode) {
      // Refetch with new country
      fetchHsCodeData(hsCode);
    }
  };
  
  // Handle calculate button
  const handleCalculate = async () => {
    if (!hsCode || !importValue) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await tariffAPI.calculate({
        hsCode,
        importValue: parseFloat(importValue),
        country,
        specialProgram: specialProgram || null,
        quantity: parseFloat(quantity),
        quantityUnit,
        shippingMode
      });
      
      setCalculationResult(response.data.data);
    } catch (err) {
      console.error('Error calculating tariffs:', err);
      setError(typeof err === 'string' ? err : 'Failed to calculate tariffs. Please check your inputs and try again.');
    } finally {
      setLoading(false);
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
  
  // Check if current HS code is saved
  const isHsCodeSaved = hsCodeInfo && 
    savedHsCodes.some(item => item.code === hsCodeInfo.code);
  
  // Format currency
  const formatCurrency = (value, curr = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Format percentage
  const formatPercentage = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };
  
  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          U.S. Tariff Calculator
        </Typography>
        
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={4}>
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
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="country-select-label">Importing Country</InputLabel>
              <Select
                labelId="country-select-label"
                id="country-select"
                value={country}
                onChange={handleCountryChange}
                label="Importing Country"
              >
                <MenuItem value="US">United States</MenuItem>
                <MenuItem value="AR" disabled>Argentina (Coming Soon)</MenuItem>
                <MenuItem value="BR" disabled>Brazil (Coming Soon)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<CalculateIcon />}
              onClick={handleSearch}
              disabled={loading || !hsCode}
            >
              Lookup Tariff
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
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
      
      {hsCodeInfo && tariffInfo && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5} lg={4}>
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
                
                <Typography variant="h6" gutterBottom>
                  Current Tariff Information
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <GavelIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Base Duty Rate" 
                      secondary={
                        tariffInfo.tariff.unit === '%' 
                          ? formatPercentage(tariffInfo.tariff.rate)
                          : `${tariffInfo.tariff.rate} ${tariffInfo.tariff.unit}`
                      } 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CurrencyIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Source" 
                      secondary={tariffInfo.tariff.source} 
                    />
                  </ListItem>
                  
                  {tariffInfo.tariff.effectiveDate && (
                    <ListItem>
                      <ListItemIcon>
                        <InfoIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Effective Date" 
                        secondary={new Date(tariffInfo.tariff.effectiveDate).toLocaleDateString()} 
                      />
                    </ListItem>
                  )}
                </List>
                
                {tariffInfo.tariff.specialPrograms && 
                 tariffInfo.tariff.specialPrograms.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Special Programs
                    </Typography>
                    
                    {tariffInfo.tariff.specialPrograms.map((program) => (
                      <Chip
                        key={program.code}
                        label={`${program.name} (${program.code}): ${
                          program.rate === 0 
                            ? 'Free' 
                            : tariffInfo.tariff.unit === '%' 
                              ? formatPercentage(program.rate)
                              : `${program.rate} ${tariffInfo.tariff.unit}`
                        }`}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </>
                )}
                
                {tariffInfo.tariff.quotas && tariffInfo.tariff.quotas.hasQuota && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" color="warning.main" gutterBottom>
                      Quota Information
                    </Typography>
                    <Typography variant="body2">
                      {tariffInfo.tariff.quotas.details || 'This product is subject to import quotas.'}
                    </Typography>
                  </>
                )}
                
                {tariffInfo.tariff.notes && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body2">
                      {tariffInfo.tariff.notes}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={7} lg={8}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Calculate Landed Cost
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Import Value */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Import Value"
                      variant="outlined"
                      fullWidth
                      value={importValue}
                      onChange={(e) => setImportValue(e.target.value)}
                      type="number"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  {/* Special Program */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="program-select-label">Special Program</InputLabel>
                      <Select
                        labelId="program-select-label"
                        id="program-select"
                        value={specialProgram}
                        onChange={(e) => setSpecialProgram(e.target.value)}
                        label="Special Program"
                      >
                        <MenuItem value="">
                          <em>None (Use General Rate)</em>
                        </MenuItem>
                        {tariffInfo.tariff.specialPrograms && 
                         tariffInfo.tariff.specialPrograms.map((program) => (
                          <MenuItem key={program.code} value={program.code}>
                            {program.name} ({program.code})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Quantity */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Quantity"
                      variant="outlined"
                      fullWidth
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      type="number"
                      disabled={tariffInfo.tariff.unit === '%'}
                      helperText={
                        tariffInfo.tariff.unit === '%' 
                          ? 'Not required for ad valorem duties' 
                          : ''
                      }
                    />
                  </Grid>
                  
                  {/* Quantity Unit */}
                  <Grid item xs={12} sm={6}>
                    <FormControl 
                      fullWidth 
                      variant="outlined"
                      disabled={tariffInfo.tariff.unit === '%'}
                    >
                      <InputLabel id="unit-select-label">Quantity Unit</InputLabel>
                      <Select
                        labelId="unit-select-label"
                        id="unit-select"
                        value={quantityUnit}
                        onChange={(e) => setQuantityUnit(e.target.value)}
                        label="Quantity Unit"
                      >
                        <MenuItem value="kg">Kilograms (kg)</MenuItem>
                        <MenuItem value="unit">Units</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Shipping Mode (for US HMF) */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="shipping-select-label">Shipping Mode</InputLabel>
                      <Select
                        labelId="shipping-select-label"
                        id="shipping-select"
                        value={shippingMode}
                        onChange={(e) => setShippingMode(e.target.value)}
                        label="Shipping Mode"
                      >
                        <MenuItem value="ocean">Ocean Freight</MenuItem>
                        <MenuItem value="air">Air Freight</MenuItem>
                        <MenuItem value="land">Land Transport</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Calculate Button */}
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      startIcon={<CalculateIcon />}
                      onClick={handleCalculate}
                      disabled={loading || !hsCode || !importValue}
                      sx={{ mt: 1 }}
                    >
                      Calculate Duties & Fees
                    </Button>
                  </Grid>
                </Grid>
                
                {/* Results */}
                {calculationResult && (
                  <Box mt={4}>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Typography variant="h6" gutterBottom>
                      Calculation Results
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Duty Calculation
                          </Typography>
                          
                          <List dense>
                            <ListItem>
                              <ListItemText 
                                primary="Import Value" 
                                secondary={formatCurrency(calculationResult.importValue)} 
                              />
                            </ListItem>
                            
                            <ListItem>
                              <ListItemText 
                                primary={`Duty Rate (${calculationResult.dutyDetails.description})`} 
                                secondary={
                                  calculationResult.dutyDetails.unit === '%' 
                                    ? formatPercentage(calculationResult.dutyDetails.rate)
                                    : `${calculationResult.dutyDetails.rate} ${calculationResult.dutyDetails.unit}`
                                } 
                              />
                            </ListItem>
                            
                            <ListItem>
                              <ListItemText 
                                primary="Duty Amount" 
                                secondary={formatCurrency(calculationResult.dutyDetails.amount)} 
                                primaryTypographyProps={{ fontWeight: 'bold' }}
                                secondaryTypographyProps={{ fontWeight: 'bold' }}
                              />
                            </ListItem>
                          </List>
                          
                          {calculationResult.additionalDuties && 
                           calculationResult.additionalDuties.length > 0 && (
                            <>
                              <Divider sx={{ my: 1 }} />
                              <Typography variant="subtitle2" gutterBottom>
                                Additional Duties
                              </Typography>
                              
                              <List dense>
                                {calculationResult.additionalDuties.map((duty, index) => (
                                  <ListItem key={index}>
                                    <ListItemText 
                                      primary={duty.name} 
                                      secondary={`${formatPercentage(duty.rate)} (${formatCurrency(duty.amount)})`} 
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </>
                          )}
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Fees & Total
                          </Typography>
                          
                          <List dense>
                            {/* MPF for US */}
                            {country === 'US' && (
                              <ListItem>
                                <ListItemText 
                                  primary="Merchandise Processing Fee (MPF)" 
                                  secondary={formatCurrency(calculationResult.fees.mpf)} 
                                />
                              </ListItem>
                            )}
                            
                            {/* HMF for US ocean shipments */}
                            {country === 'US' && shippingMode === 'ocean' && (
                              <ListItem>
                                <ListItemText 
                                  primary="Harbor Maintenance Fee (HMF)" 
                                  secondary={formatCurrency(calculationResult.fees.hmf)} 
                                />
                              </ListItem>
                            )}
                            
                            <Divider sx={{ my: 1 }} />
                            
                            <ListItem>
                              <ListItemText 
                                primary="Total Duties" 
                                secondary={formatCurrency(calculationResult.totals.duties)} 
                              />
                            </ListItem>
                            
                            <ListItem>
                              <ListItemText 
                                primary="Total Fees" 
                                secondary={formatCurrency(calculationResult.totals.fees)} 
                              />
                            </ListItem>
                            
                            <ListItem>
                              <ListItemText 
                                primary="Effective Duty Rate" 
                                secondary={formatPercentage(calculationResult.totals.effectiveDutyRate)} 
                              />
                            </ListItem>
                            
                            <Divider sx={{ my: 1 }} />
                            
                            <ListItem>
                              <ListItemText 
                                primary="Total Landed Cost" 
                                secondary={formatCurrency(calculationResult.totals.landedCost)} 
                                primaryTypographyProps={{ fontWeight: 'bold', color: 'primary.main' }}
                                secondaryTypographyProps={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1.1rem' }}
                              />
                            </ListItem>
                          </List>
                          
                          {calculationResult.notes && (
                            <>
                              <Divider sx={{ my: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                <strong>Note:</strong> {calculationResult.notes}
                              </Typography>
                            </>
                          )}
                        </Paper>
                      </Grid>
                    </Grid>
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
            Enter an HS Code to Calculate Tariffs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Search for a specific HS code to view tariff rates and calculate 
            import duties, fees, and total landed costs for your shipments.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}