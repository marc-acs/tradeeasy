import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  ShowChart as ShowChartIcon,
  CalculateOutlined as CalculateIcon,
  WarningAmber as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Bookmark as BookmarkIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  NotificationsOutlined as NotificationIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';

const drawerWidth = 240;

export default function DashboardLayout() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleProfileMenu = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };
  
  const handleCloseProfileMenu = () => {
    setProfileAnchorEl(null);
  };
  
  const handleNotificationMenu = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  
  const handleCloseNotificationMenu = () => {
    setNotificationAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'HS Code Search', icon: <SearchIcon />, path: '/search' },
    { text: 'Price Analysis', icon: <ShowChartIcon />, path: '/prices' },
    { text: 'Tariff Calculator', icon: <CalculateIcon />, path: '/tariffs' },
    { text: 'Risk Alerts', icon: <WarningIcon />, path: '/risks' },
    { text: 'Price Forecast', icon: <TrendingUpIcon />, path: '/forecast' },
    { text: 'Saved Items', icon: <BookmarkIcon />, path: '/saved' }
  ];
  
  const drawer = (
    <div>
      <Toolbar sx={{ justifyContent: 'center' }}>
        <Typography variant="h6" component="div" color="primary" fontWeight="bold">
          TradeEasy Analytics
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'inherit'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
          
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              size="large"
              color="inherit"
              onClick={handleNotificationMenu}
            >
              <NotificationIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={notificationAnchorEl}
            open={Boolean(notificationAnchorEl)}
            onClose={handleCloseNotificationMenu}
            PaperProps={{
              elevation: 3,
              sx: { width: 320, maxHeight: 400 }
            }}
          >
            <MenuItem>
              <Typography variant="subtitle2" color="primary">New risk alert detected</Typography>
            </MenuItem>
            <MenuItem>
              <Typography variant="body2">
                Price forecast updated for your saved HS codes.
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleCloseNotificationMenu}>
              <Typography variant="body2" color="primary" align="center" sx={{ width: '100%' }}>
                View all notifications
              </Typography>
            </MenuItem>
          </Menu>
          
          {/* User profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Button
              onClick={handleProfileMenu}
              color="inherit"
              startIcon={
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    fontSize: '0.875rem'
                  }}
                >
                  {currentUser?.name?.charAt(0) || 'U'}
                </Avatar>
              }
            >
              {currentUser?.name?.split(' ')[0] || 'User'}
            </Button>
            
            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={handleCloseProfileMenu}
            >
              <MenuItem
                component={Link}
                to="/profile"
                onClick={handleCloseProfileMenu}
              >
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="My Profile" />
              </MenuItem>
              
              {currentUser?.role === 'admin' && (
                <MenuItem
                  component={Link}
                  to="/admin"
                  onClick={handleCloseProfileMenu}
                >
                  <ListItemIcon>
                    <AdminIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Admin Panel" />
                </MenuItem>
              )}
              
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}