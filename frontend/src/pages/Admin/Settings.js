import React, { useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import { Save as SaveIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

const Settings = () => {
  // System settings
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,
    apiRateLimit: 100,
    userRegistrationEnabled: true,
    defaultUserRole: 'user',
    sessionTimeout: 60
  });
  
  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.tradeeasy.com',
    smtpPort: 587,
    smtpUsername: 'notifications@tradeeasy.com',
    smtpPassword: '********',
    senderName: 'TradeEasy Analytics',
    senderEmail: 'notifications@tradeeasy.com',
    enableEmailNotifications: true
  });
  
  // API Integration settings
  const [apiSettings, setApiSettings] = useState({
    quandlApiKey: '********',
    openWeatherApiKey: '********',
    usitcApiEnabled: true,
    googleCloudApiKey: '********'
  });
  
  // Saved message states
  const [systemSettingsSaved, setSystemSettingsSaved] = useState(false);
  const [emailSettingsSaved, setEmailSettingsSaved] = useState(false);
  const [apiSettingsSaved, setApiSettingsSaved] = useState(false);
  
  const handleSystemSettingChange = (event) => {
    const { name, value, checked } = event.target;
    const newValue = event.target.type === 'checkbox' ? checked : value;
    
    setSystemSettings({
      ...systemSettings,
      [name]: newValue
    });
    
    setSystemSettingsSaved(false);
  };
  
  const handleEmailSettingChange = (event) => {
    const { name, value, checked } = event.target;
    const newValue = event.target.type === 'checkbox' ? checked : value;
    
    setEmailSettings({
      ...emailSettings,
      [name]: newValue
    });
    
    setEmailSettingsSaved(false);
  };
  
  const handleApiSettingChange = (event) => {
    const { name, value, checked } = event.target;
    const newValue = event.target.type === 'checkbox' ? checked : value;
    
    setApiSettings({
      ...apiSettings,
      [name]: newValue
    });
    
    setApiSettingsSaved(false);
  };
  
  const handleSaveSystemSettings = () => {
    // In a real app, this would save to the backend
    console.log('Saving system settings:', systemSettings);
    setSystemSettingsSaved(true);
    
    // Reset the saved status after a delay
    setTimeout(() => setSystemSettingsSaved(false), 3000);
  };
  
  const handleSaveEmailSettings = () => {
    // In a real app, this would save to the backend
    console.log('Saving email settings:', emailSettings);
    setEmailSettingsSaved(true);
    
    // Reset the saved status after a delay
    setTimeout(() => setEmailSettingsSaved(false), 3000);
  };
  
  const handleSaveApiSettings = () => {
    // In a real app, this would save to the backend
    console.log('Saving API settings:', apiSettings);
    setApiSettingsSaved(true);
    
    // Reset the saved status after a delay
    setTimeout(() => setApiSettingsSaved(false), 3000);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom component="h1">
        System Settings
      </Typography>
      
      <Grid container spacing={3}>
        {/* System Settings */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader 
              title="General Settings" 
              subheader="Configure system behavior"
            />
            <Divider />
            <CardContent>
              {systemSettingsSaved && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Settings saved successfully
                </Alert>
              )}
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Maintenance Mode" 
                    secondary="When enabled, only admins can access the system"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      name="maintenanceMode"
                      checked={systemSettings.maintenanceMode}
                      onChange={handleSystemSettingChange}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Debug Mode" 
                    secondary="Enable detailed error messages and logging"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      name="debugMode"
                      checked={systemSettings.debugMode}
                      onChange={handleSystemSettingChange}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Cache Enabled" 
                    secondary="Cache API responses for better performance"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      name="cacheEnabled"
                      checked={systemSettings.cacheEnabled}
                      onChange={handleSystemSettingChange}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="User Registration" 
                    secondary="Allow new users to register"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      name="userRegistrationEnabled"
                      checked={systemSettings.userRegistrationEnabled}
                      onChange={handleSystemSettingChange}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="API Rate Limit"
                    name="apiRateLimit"
                    type="number"
                    value={systemSettings.apiRateLimit}
                    onChange={handleSystemSettingChange}
                    helperText="Requests per minute per user"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Session Timeout"
                    name="sessionTimeout"
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={handleSystemSettingChange}
                    helperText="Minutes until session expires"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Default User Role</InputLabel>
                    <Select
                      name="defaultUserRole"
                      value={systemSettings.defaultUserRole}
                      label="Default User Role"
                      onChange={handleSystemSettingChange}
                    >
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="premium">Premium User</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSystemSettings}
                >
                  Save Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Email Settings */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader 
              title="Email Settings" 
              subheader="Configure email notifications"
            />
            <Divider />
            <CardContent>
              {emailSettingsSaved && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Email settings saved successfully
                </Alert>
              )}
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="SMTP Server"
                    name="smtpServer"
                    value={emailSettings.smtpServer}
                    onChange={handleEmailSettingChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="SMTP Port"
                    name="smtpPort"
                    type="number"
                    value={emailSettings.smtpPort}
                    onChange={handleEmailSettingChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="SMTP Username"
                    name="smtpUsername"
                    value={emailSettings.smtpUsername}
                    onChange={handleEmailSettingChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="SMTP Password"
                    name="smtpPassword"
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={handleEmailSettingChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sender Name"
                    name="senderName"
                    value={emailSettings.senderName}
                    onChange={handleEmailSettingChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sender Email"
                    name="senderEmail"
                    type="email"
                    value={emailSettings.senderEmail}
                    onChange={handleEmailSettingChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1">Enable Email Notifications</Typography>
                    <Switch
                      name="enableEmailNotifications"
                      checked={emailSettings.enableEmailNotifications}
                      onChange={handleEmailSettingChange}
                      sx={{ ml: 2 }}
                    />
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveEmailSettings}
                >
                  Save Email Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* API Integration Settings */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardHeader 
              title="API Integrations" 
              subheader="Configure external API settings"
            />
            <Divider />
            <CardContent>
              {apiSettingsSaved && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  API settings saved successfully
                </Alert>
              )}
              
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Quandl API (Price Data)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Quandl API Key"
                        name="quandlApiKey"
                        value={apiSettings.quandlApiKey}
                        onChange={handleApiSettingChange}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <Button 
                          variant="outlined" 
                          sx={{ mt: 1 }}
                          onClick={() => window.open('https://www.quandl.com/tools/api', '_blank')}
                        >
                          Quandl API Documentation
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">OpenWeather API (Risk Data)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="OpenWeather API Key"
                        name="openWeatherApiKey"
                        value={apiSettings.openWeatherApiKey}
                        onChange={handleApiSettingChange}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <Button 
                          variant="outlined" 
                          sx={{ mt: 1 }}
                          onClick={() => window.open('https://openweathermap.org/api', '_blank')}
                        >
                          OpenWeather API Documentation
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">USITC API (Tariff Data)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1">Enable USITC API Integration</Typography>
                    <Switch
                      name="usitcApiEnabled"
                      checked={apiSettings.usitcApiEnabled}
                      onChange={handleApiSettingChange}
                      sx={{ ml: 2 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    The USITC API does not require an API key but has usage limits.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    sx={{ mt: 2 }}
                    onClick={() => window.open('https://www.usitc.gov/tata/hts', '_blank')}
                  >
                    USITC Documentation
                  </Button>
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Google Cloud AI Platform (Forecasting)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Google Cloud API Key"
                        name="googleCloudApiKey"
                        value={apiSettings.googleCloudApiKey}
                        onChange={handleApiSettingChange}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <Button 
                          variant="outlined" 
                          sx={{ mt: 1 }}
                          onClick={() => window.open('https://cloud.google.com/ai-platform', '_blank')}
                        >
                          Google Cloud AI Documentation
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveApiSettings}
                >
                  Save API Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;