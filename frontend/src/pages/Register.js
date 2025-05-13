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
  IconButton,
  Grid
} from '@mui/material';
import {
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name should be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password should be at least 8 characters'),
  company: Yup.string()
    .required('Company name is required')
});

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      await register(values.name, values.email, values.password, values.company);
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError(typeof err === 'string' ? err : 'Failed to create an account. Please try again.');
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
        Create Account
      </Typography>
      
      <Typography variant="body1" color="text.secondary" gutterBottom textAlign="center">
        Get started with TradeEasy Analytics today
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Formik
        initialValues={{ name: '', email: '', password: '', company: '' }}
        validationSchema={RegisterSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  name="name"
                  label="Full Name"
                  variant="outlined"
                  fullWidth
                  error={Boolean(errors.name && touched.name)}
                  helperText={touched.name && errors.name}
                  autoComplete="name"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  name="email"
                  label="Email Address"
                  variant="outlined"
                  fullWidth
                  error={Boolean(errors.email && touched.email)}
                  helperText={touched.email && errors.email}
                  autoComplete="email"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  fullWidth
                  error={Boolean(errors.password && touched.password)}
                  helperText={touched.password && errors.password}
                  autoComplete="new-password"
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
              </Grid>
              
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  name="company"
                  label="Company Name"
                  variant="outlined"
                  fullWidth
                  error={Boolean(errors.company && touched.company)}
                  helperText={touched.company && errors.company}
                  autoComplete="organization"
                />
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 3, mb: 2 }}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            <Box mt={2} textAlign="center">
              <Typography variant="body2">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" fontWeight="bold">
                  Log in
                </Link>
              </Typography>
            </Box>
          </Form>
        )}
      </Formik>
      
      <Box mt={3} textAlign="center">
        <Typography variant="caption" color="text.secondary">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </Typography>
      </Box>
    </Box>
  );
}