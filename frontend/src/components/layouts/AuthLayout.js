import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Container, Paper, Typography } from '@mui/material';

export default function AuthLayout() {
  const { currentUser, loading } = useAuth();
  
  // If still loading auth state, show nothing
  if (loading) return null;
  
  // If already logged in, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/" />;
  }
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'primary.light',
        backgroundImage: 'linear-gradient(135deg, #64b5f6 0%, #1976d2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            component="h1" 
            color="white" 
            fontWeight="bold" 
            gutterBottom
          >
            TradeEasy Analytics
          </Typography>
          <Typography variant="h6" color="white" fontWeight="light">
            Global Trade Insights for Argentine Exporters and U.S. Buyers
          </Typography>
        </Box>
        
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 2,
            backgroundColor: 'background.paper',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Outlet />
        </Paper>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="white">
            © {new Date().getFullYear()} TradeEasy Analytics. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}