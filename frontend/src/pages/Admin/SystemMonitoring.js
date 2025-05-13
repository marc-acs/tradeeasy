import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

// Generate random data points for performance chart
const generatePerformanceData = (days = 30) => {
  const data = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      x: date,
      y: Math.floor(Math.random() * 100) + 100 // API response time between 100-200ms
    });
  }
  
  return data;
};

// Generate random data for API usage chart
const generateApiUsageData = (days = 30) => {
  const data = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      x: date,
      y: Math.floor(Math.random() * 500) + 500 // Between 500-1000 API calls per day
    });
  }
  
  return data;
};

// Generate mock log entries
const generateLogEntries = (count = 10) => {
  const logTypes = ['INFO', 'WARNING', 'ERROR', 'DEBUG'];
  const services = ['UserService', 'PriceService', 'TariffService', 'RiskService', 'ForecastService', 'AuthService'];
  const messages = [
    'Application started',
    'New user registered',
    'Failed login attempt',
    'Database connection established',
    'API rate limit reached',
    'Forecast calculation completed',
    'External API request timeout',
    'Cache refreshed',
    'Scheduled task completed',
    'File upload failed',
    'Price data updated',
    'Invalid input parameters'
  ];
  
  const logs = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now);
    timestamp.setMinutes(timestamp.getMinutes() - i * 10);
    
    const logType = logTypes[Math.floor(Math.random() * logTypes.length)];
    const service = services[Math.floor(Math.random() * services.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    logs.push({
      id: i.toString(),
      timestamp,
      type: logType,
      service,
      message,
      details: `Request ID: ${Math.random().toString(36).substring(2, 10)}`
    });
  }
  
  return logs;
};

const SystemMonitoring = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [logLevel, setLogLevel] = useState('all');
  const [logSearch, setLogSearch] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(0); // 0 means no auto-refresh
  
  const [systemStatus, setSystemStatus] = useState({
    status: 'operational',
    uptime: '27d 5h 32m',
    cpuUsage: 35,
    memoryUsage: 42,
    diskUsage: 58,
    activeConnections: 78,
    lastDeployment: '2023-04-10 15:30:00',
    apiVersion: 'v1.5.2'
  });
  
  const [performanceData, setPerformanceData] = useState({
    labels: [],
    datasets: [
      {
        label: 'API Response Time (ms)',
        data: [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }
    ],
  });
  
  const [apiUsageData, setApiUsageData] = useState({
    labels: [],
    datasets: [
      {
        label: 'API Calls',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }
    ],
  });
  
  const [logs, setLogs] = useState([]);
  
  // Define refreshData function before using it in useEffect
  const refreshData = () => {
    // Get number of days based on time range
    let days;
    switch (timeRange) {
      case '7d':
        days = 7;
        break;
      case '14d':
        days = 14;
        break;
      case '30d':
        days = 30;
        break;
      case '90d':
        days = 90;
        break;
      default:
        days = 30;
    }
    
    // Update performance data
    const performancePoints = generatePerformanceData(days);
    setPerformanceData({
      datasets: [
        {
          label: 'API Response Time (ms)',
          data: performancePoints,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }
      ],
    });
    
    // Update API usage data
    const apiUsagePoints = generateApiUsageData(days);
    setApiUsageData({
      datasets: [
        {
          label: 'API Calls',
          data: apiUsagePoints,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }
      ],
    });
    
    // Update logs
    setLogs(generateLogEntries(20));
    
    // Update system status (simulating variations)
    setSystemStatus(prev => ({
      ...prev,
      cpuUsage: Math.min(100, Math.max(10, prev.cpuUsage + (Math.random() * 10 - 5))),
      memoryUsage: Math.min(100, Math.max(20, prev.memoryUsage + (Math.random() * 8 - 4))),
      activeConnections: Math.floor(Math.max(10, prev.activeConnections + (Math.random() * 20 - 10)))
    }));
  };

  useEffect(() => {
    refreshData();
    
    // Set up auto-refresh if selected
    let intervalId;
    if (refreshInterval > 0) {
      intervalId = setInterval(() => {
        refreshData();
      }, refreshInterval * 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timeRange, refreshInterval]);
  
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  const handleLogLevelChange = (event) => {
    setLogLevel(event.target.value);
  };
  
  const handleLogSearchChange = (event) => {
    setLogSearch(event.target.value);
  };
  
  const handleRefreshIntervalChange = (event) => {
    setRefreshInterval(Number(event.target.value));
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'success.main';
      case 'degraded':
        return 'warning.main';
      case 'outage':
        return 'error.main';
      default:
        return 'info.main';
    }
  };
  
  const getLogTypeColor = (type) => {
    switch (type) {
      case 'ERROR':
        return 'error.main';
      case 'WARNING':
        return 'warning.main';
      case 'INFO':
        return 'info.main';
      case 'DEBUG':
        return 'text.secondary';
      default:
        return 'text.primary';
    }
  };
  
  // Filter logs based on selected level and search term
  const filteredLogs = logs.filter(log => {
    // Filter by log level
    if (logLevel !== 'all' && log.type !== logLevel) {
      return false;
    }
    
    // Filter by search term
    if (logSearch && !log.message.toLowerCase().includes(logSearch.toLowerCase()) && 
        !log.service.toLowerCase().includes(logSearch.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          System Monitoring
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Auto-refresh</InputLabel>
            <Select
              value={refreshInterval}
              label="Auto-refresh"
              onChange={handleRefreshIntervalChange}
            >
              <MenuItem value={0}>Off</MenuItem>
              <MenuItem value={30}>30s</MenuItem>
              <MenuItem value={60}>1m</MenuItem>
              <MenuItem value={300}>5m</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshData}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {/* System Status Overview */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            System Status
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: getStatusColor(systemStatus.status),
                mr: 1
              }}
            />
            <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
              {systemStatus.status}
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                System Uptime
              </Typography>
              <Typography variant="h6">
                {systemStatus.uptime}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                API Version
              </Typography>
              <Typography variant="h6">
                {systemStatus.apiVersion}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Active Connections
              </Typography>
              <Typography variant="h6">
                {systemStatus.activeConnections}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Last Deployment
              </Typography>
              <Typography variant="h6">
                {new Date(systemStatus.lastDeployment).toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              CPU Usage: {Math.round(systemStatus.cpuUsage)}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={systemStatus.cpuUsage} 
              sx={{ 
                height: 8, 
                borderRadius: 1,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: systemStatus.cpuUsage > 80 ? 'error.main' : 
                                   systemStatus.cpuUsage > 60 ? 'warning.main' : 'success.main',
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Memory Usage: {Math.round(systemStatus.memoryUsage)}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={systemStatus.memoryUsage} 
              sx={{ 
                height: 8, 
                borderRadius: 1,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: systemStatus.memoryUsage > 80 ? 'error.main' : 
                                   systemStatus.memoryUsage > 60 ? 'warning.main' : 'success.main',
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Disk Usage: {Math.round(systemStatus.diskUsage)}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={systemStatus.diskUsage} 
              sx={{ 
                height: 8, 
                borderRadius: 1,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: systemStatus.diskUsage > 80 ? 'error.main' : 
                                   systemStatus.diskUsage > 60 ? 'warning.main' : 'success.main',
                }
              }}
            />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Performance Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader 
              title="API Response Time" 
              action={
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Time Range</InputLabel>
                  <Select
                    value={timeRange}
                    label="Time Range"
                    onChange={handleTimeRangeChange}
                  >
                    <MenuItem value="7d">7 days</MenuItem>
                    <MenuItem value="14d">14 days</MenuItem>
                    <MenuItem value="30d">30 days</MenuItem>
                    <MenuItem value="90d">90 days</MenuItem>
                  </Select>
                </FormControl>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <Line 
                  data={performanceData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        type: 'time',
                        time: {
                          unit: timeRange === '7d' ? 'day' : 'week'
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader 
              title="API Usage" 
              action={
                <Button
                  startIcon={<DownloadIcon />}
                  size="small"
                >
                  Export
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <Line 
                  data={apiUsageData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        type: 'time',
                        time: {
                          unit: timeRange === '7d' ? 'day' : 'week'
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* System Logs */}
      <Card elevation={2}>
        <CardHeader 
          title="System Logs" 
          action={
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                label="Search"
                value={logSearch}
                onChange={handleLogSearchChange}
              />
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Log Level</InputLabel>
                <Select
                  value={logLevel}
                  label="Log Level"
                  onChange={handleLogLevelChange}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="ERROR">Errors</MenuItem>
                  <MenuItem value="WARNING">Warnings</MenuItem>
                  <MenuItem value="INFO">Info</MenuItem>
                  <MenuItem value="DEBUG">Debug</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
              >
                Export Logs
              </Button>
            </Box>
          }
        />
        <Divider />
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {log.timestamp.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: getLogTypeColor(log.type), fontWeight: 'bold' }}>
                      {log.type}
                    </Typography>
                  </TableCell>
                  <TableCell>{log.service}</TableCell>
                  <TableCell>{log.message}</TableCell>
                  <TableCell>{log.details}</TableCell>
                </TableRow>
              ))}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No logs found matching the current filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default SystemMonitoring;