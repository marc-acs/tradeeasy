import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check if token exists and is valid
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Check if token is expired
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          // Token is expired
          console.log('Token expired, logging out');
          localStorage.removeItem('token');
          setCurrentUser(null);
        } else {
          // Valid token, fetch user data
          fetchUserData(token);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        setCurrentUser(null);
      }
    } else {
      setLoading(false);
    }
  }, []);
  
  // Set auth token for all axios requests
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [currentUser]);
  
  // Fetch user data with token (mock only)
  const fetchUserData = async (token) => {
    try {
      if (token === 'mock_jwt_token_for_demo') {
        // Create mock user
        const mockUser = {
          _id: '12345',
          name: 'Demo User',
          email: 'demo@tradeeasy.com',
          company: 'TradeEasy Demo Co.',
          role: 'user',
          subscription: {
            plan: 'basic',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          savedHsCodes: ['120190', '020130', '843149'],
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        };
        setCurrentUser(mockUser);
      } else if (token === 'mock_jwt_token_for_admin') {
        // Create mock admin user
        const mockUser = {
          _id: '67890',
          name: 'Admin User',
          email: 'admin@tradeeasy.com',
          company: 'TradeEasy Admin',
          role: 'admin',
          subscription: {
            plan: 'enterprise',
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          },
          savedHsCodes: ['120190', '020130', '843149'],
          createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000)
        };
        setCurrentUser(mockUser);
      } else {
        // For any other token, use admin user (for testing)
        const mockUser = {
          _id: '67890',
          name: 'Admin User',
          email: 'admin@tradeeasy.com',
          company: 'TradeEasy Admin',
          role: 'admin',
          subscription: {
            plan: 'enterprise',
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          },
          savedHsCodes: ['120190', '020130', '843149'],
          createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000)
        };
        setCurrentUser(mockUser);
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      localStorage.removeItem('token');
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Register new user
  const register = async (name, email, password, company) => {
    const response = await axios.post('/api/auth/signup', {
      name,
      email,
      password,
      company
    });
    
    const { token, data } = response.data;
    localStorage.setItem('token', token);
    setCurrentUser(data.user);
    
    return data.user;
  };
  
  // Login user (mock only)
  const login = async (email, password) => {
    try {
      // Mock login
      if (email === 'demo@tradeeasy.com' && password === 'demopassword') {
        // Create mock token and user
        const mockToken = 'mock_jwt_token_for_demo';
        const mockUser = {
          _id: '12345',
          name: 'Demo User',
          email: 'demo@tradeeasy.com',
          company: 'TradeEasy Demo Co.',
          role: 'user',
          subscription: {
            plan: 'basic',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          savedHsCodes: ['120190', '020130', '843149'],
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        };
        
        localStorage.setItem('token', mockToken);
        setCurrentUser(mockUser);
        
        return mockUser;
      } else if (email === 'admin@tradeeasy.com' && password === 'adminpassword') {
        // Create mock token and admin user
        const mockToken = 'mock_jwt_token_for_admin';
        const mockUser = {
          _id: '67890',
          name: 'Admin User',
          email: 'admin@tradeeasy.com',
          company: 'TradeEasy Admin',
          role: 'admin',
          subscription: {
            plan: 'enterprise',
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          },
          savedHsCodes: ['120190', '020130', '843149'],
          createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000)
        };
        
        localStorage.setItem('token', mockToken);
        setCurrentUser(mockUser);
        
        return mockUser;
      } else {
        throw new Error('Failed to log in. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };
  
  // Update user profile
  const updateProfile = async (userData) => {
    const response = await axios.patch('/api/auth/updateMe', userData);
    
    setCurrentUser(response.data.data.user);
    return response.data.data.user;
  };
  
  const value = {
    currentUser,
    loading,
    register,
    login,
    logout,
    updateProfile
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}