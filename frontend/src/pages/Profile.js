import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CalendarToday as CalendarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';

// Profile update schema
const ProfileSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name should be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  company: Yup.string()
    .required('Company name is required')
});

export default function Profile() {
  const { currentUser, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get subscription label
  const getSubscriptionLabel = (plan) => {
    switch (plan) {
      case 'free':
        return 'Free Plan';
      case 'basic':
        return 'Basic Plan';
      case 'premium':
        return 'Premium Plan';
      default:
        return 'Free Plan';
    }
  };
  
  // Get subscription expiry
  const getSubscriptionExpiry = () => {
    if (!currentUser.subscription || !currentUser.subscription.expiresAt) {
      return null;
    }
    
    return formatDate(currentUser.subscription.expiresAt);
  };
  
  // Handle profile update
  const handleProfileUpdate = async (values, { setSubmitting }) => {
    try {
      setUpdateError('');
      setUpdateSuccess(false);
      
      await updateProfile({
        name: values.name,
        email: values.email,
        company: values.company
      });
      
      setUpdateSuccess(true);
      setEditMode(false);
    } catch (err) {
      console.error('Profile update error:', err);
      setUpdateError(typeof err === 'string' ? err : 'Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardHeader
              avatar={
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    fontSize: '2rem'
                  }}
                >
                  {currentUser?.name?.charAt(0) || 'U'}
                </Avatar>
              }
              title={
                <Typography variant="h5" sx={{ mt: 2 }}>
                  {currentUser?.name}
                </Typography>
              }
              subheader={
                <Box mt={1}>
                  <Chip 
                    label={getSubscriptionLabel(currentUser?.subscription?.plan || 'free')}
                    color={
                      currentUser?.subscription?.plan === 'premium' ? 'primary' :
                      currentUser?.subscription?.plan === 'basic' ? 'success' :
                      'default'
                    }
                    size="small"
                    icon={<StarBorderIcon />}
                  />
                </Box>
              }
              sx={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
            />
            
            <Divider />
            
            <CardContent>
              <List>
                <ListItem>
                  <EmailIcon color="action" sx={{ mr: 2 }} />
                  <ListItemText 
                    primary="Email"
                    secondary={currentUser?.email}
                  />
                </ListItem>
                
                <ListItem>
                  <BusinessIcon color="action" sx={{ mr: 2 }} />
                  <ListItemText 
                    primary="Company"
                    secondary={currentUser?.company || 'Not specified'}
                  />
                </ListItem>
                
                <ListItem>
                  <CalendarIcon color="action" sx={{ mr: 2 }} />
                  <ListItemText 
                    primary="Member Since"
                    secondary={formatDate(currentUser?.createdAt)}
                  />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Subscription Information
              </Typography>
              
              <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Current Plan:</strong> {getSubscriptionLabel(currentUser?.subscription?.plan || 'free')}
                </Typography>
                
                {getSubscriptionExpiry() && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Expires:</strong> {getSubscriptionExpiry()}
                  </Typography>
                )}
                
                <Box mt={2}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    fullWidth
                    disabled={currentUser?.subscription?.plan === 'premium'}
                  >
                    Upgrade Plan
                  </Button>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={() => setShowLogoutDialog(true)}
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5">
                {editMode ? 'Edit Profile' : 'Profile Information'}
              </Typography>
              
              {!editMode && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Paper>
          
          {updateSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Profile updated successfully
            </Alert>
          )}
          
          {updateError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {updateError}
            </Alert>
          )}
          
          <Card variant="outlined">
            <CardContent>
              {editMode ? (
                <Formik
                  initialValues={{
                    name: currentUser?.name || '',
                    email: currentUser?.email || '',
                    company: currentUser?.company || ''
                  }}
                  validationSchema={ProfileSchema}
                  onSubmit={handleProfileUpdate}
                >
                  {({ errors, touched, isSubmitting }) => (
                    <Form>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            name="name"
                            label="Full Name"
                            variant="outlined"
                            fullWidth
                            error={Boolean(errors.name && touched.name)}
                            helperText={touched.name && errors.name}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonIcon />
                                </InputAdornment>
                              ),
                            }}
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
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EmailIcon />
                                </InputAdornment>
                              ),
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
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <BusinessIcon />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Box display="flex" justifyContent="flex-end" gap={2}>
                            <Button
                              variant="outlined"
                              onClick={() => {
                                setEditMode(false);
                                setUpdateError('');
                              }}
                            >
                              Cancel
                            </Button>
                            
                            <Button
                              type="submit"
                              variant="contained"
                              startIcon={<SaveIcon />}
                              disabled={isSubmitting}
                            >
                              Save Changes
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Form>
                  )}
                </Formik>
              ) : (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Account Information
                  </Typography>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                      Personal Details
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Full Name"
                          value={currentUser?.name || ''}
                          fullWidth
                          variant="outlined"
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Email Address"
                          value={currentUser?.email || ''}
                          fullWidth
                          variant="outlined"
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Company"
                          value={currentUser?.company || ''}
                          fullWidth
                          variant="outlined"
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <InputAdornment position="start">
                                <BusinessIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Member Since"
                          value={formatDate(currentUser?.createdAt)}
                          fullWidth
                          variant="outlined"
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                      Subscription Details
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Current Plan"
                          value={getSubscriptionLabel(currentUser?.subscription?.plan || 'free')}
                          fullWidth
                          variant="outlined"
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <InputAdornment position="start">
                                <StarBorderIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Expiration Date"
                          value={getSubscriptionExpiry() || 'Never'}
                          fullWidth
                          variant="outlined"
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                    
                    <Box mt={2}>
                      {currentUser?.subscription?.plan !== 'premium' && (
                        <Button
                          variant="contained"
                          color="primary"
                        >
                          Upgrade to Premium
                        </Button>
                      )}
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 4 }} />
                  
                  <Typography variant="subtitle2" gutterBottom color="text.secondary">
                    Account Security
                  </Typography>
                  
                  <Box mt={2}>
                    <Button
                      variant="outlined"
                    >
                      Change Password
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Logout Confirmation Dialog */}
      <Dialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
      >
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to log out of your TradeEasy Analytics account?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLogoutDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleLogout} color="error">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}