import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent, CardHeader, Divider } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SearchIcon from '@mui/icons-material/Search';
import CalculateIcon from '@mui/icons-material/Calculate';
import TimelineIcon from '@mui/icons-material/Timeline';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [stats] = useState({
    totalUsers: 128,
    activeUsers: 87,
    hsCodeSearches: 543,
    calculationsPerformed: 312,
    forecastsGenerated: 156
  });

  const [userRegistrationData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Users',
        data: [12, 19, 15, 22, 30, 28],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  });

  const [apiUsageData] = useState({
    labels: ['HS Search', 'Prices', 'Tariffs', 'Risks', 'Forecasts'],
    datasets: [
      {
        label: 'API Calls',
        data: [350, 274, 312, 156, 189],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  });

  // Simulation of fetching admin dashboard data
  useEffect(() => {
    // In a real app, we would fetch this data from the backend
    // For now, we're just using static mock data
  }, []);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom component="div">
        Admin Dashboard
      </Typography>
      
      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#f5f5f5'
            }}
          >
            <PeopleAltIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" component="div">
              {stats.totalUsers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Users
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#f5f5f5'
            }}
          >
            <PeopleAltIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" component="div">
              {stats.activeUsers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Users
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#f5f5f5'
            }}
          >
            <SearchIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" component="div">
              {stats.hsCodeSearches}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              HS Code Searches
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#f5f5f5'
            }}
          >
            <CalculateIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" component="div">
              {stats.calculationsPerformed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Calculations
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#f5f5f5'
            }}
          >
            <TimelineIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" component="div">
              {stats.forecastsGenerated}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Forecasts Generated
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader title="User Registrations" subheader="Past 6 months" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <Line 
                  data={userRegistrationData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader title="API Usage" subheader="By endpoint" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <Bar 
                  data={apiUsageData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;