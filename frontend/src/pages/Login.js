import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      await login(values.email, values.password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(typeof err === 'string' ? err : 'Failed to log in. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom textAlign="center">
        Log In
      </Typography>
      
      <Typography variant="body1" color="text.secondary" gutterBottom textAlign="center">
        Welcome back! Please enter your credentials to continue.
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Connected to real backend with live API data.
      </Alert>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <Field
              as={TextField}
              name="email"
              label="Email Address"
              variant="outlined"
              fullWidth
              margin="normal"
              error={Boolean(errors.email && touched.email)}
              helperText={touched.email && errors.email}
              autoComplete="email"
            />
            
            <Field
              as={TextField}
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              margin="normal"
              error={Boolean(errors.password && touched.password)}
              helperText={touched.password && errors.password}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={toggleShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 3, mb: 2 }}
            >
              {isSubmitting ? 'Logging in...' : 'Log In'}
            </Button>
            
            <Box mt={2} textAlign="center">
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/register" fontWeight="bold">
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Form>
        )}
      </Formik>
      
      {/* Demo credentials for easier testing */}
      <Box mt={4} p={2} bgcolor="grey.50" borderRadius={1}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Demo Credentials
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Regular User:<br />
          Email: demo@tradeeasy.com<br />
          Password: demopassword
        </Typography>
        <Typography variant="subtitle2" color="primary" sx={{ mt: 1 }} gutterBottom>
          Admin User:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Email: admin@tradeeasy.com<br />
          Password: adminpassword
        </Typography>
      </Box>
    </Box>
  );
}