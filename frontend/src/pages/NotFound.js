import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper
} from '@mui/material';
import {
  SentimentDissatisfied as SadIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

export default function NotFound() {
  return (
    <Container maxWidth="md">
      <Paper 
        elevation={0}
        sx={{ 
          textAlign: 'center', 
          py: 8, 
          px: 4,
          mt: 8,
          borderRadius: 2
        }}
      >
        <SadIcon sx={{ fontSize: 120, color: 'text.secondary', mb: 4 }} />
        
        <Typography variant="h3" gutterBottom>
          404: Page Not Found
        </Typography>
        
        <Typography variant="h5" color="text.secondary" paragraph>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        
        <Box mt={4}>
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            size="large"
            startIcon={<ArrowBackIcon />}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}