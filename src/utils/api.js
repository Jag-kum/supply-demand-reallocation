import axios from 'axios';
import { API_CONFIG } from '../config/api';

// API configuration
const API_BASE_URL = API_CONFIG.BASE_URL;
const API_KEY = API_CONFIG.API_KEY;

// Create axios instance with default config
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
API.interceptors.request.use((config) => {
  // Only access localStorage on client side
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if we're not on the login page and it's a 401 error
    if (typeof window !== 'undefined' && error.response?.status === 401 && window.location.pathname !== '/') {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API functions
export const api = {
  // Authentication
  login: async (email, password) => {
    try {
      const response = await API.post('/api/auth/login', { email, password });
      if (response.data.success && typeof window !== 'undefined') {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  },

  register: async (email, password, role) => {
    try {
      const response = await API.post('/api/auth/register', { email, password, role });
      if (response.data.success && typeof window !== 'undefined') {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  },

  // Products
  getProducts: async (searchTerm = "") => {
    try {
      const response = await API.get(`/api/products${searchTerm ? `?search=${searchTerm}` : ''}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch products'
      };
    }
  },

  getProduct: async (productId) => {
    try {
      const response = await API.get(`/api/products/${productId}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch product'
      };
    }
  },

  // Seller operations
  getSellerDashboard: async () => {
    try {
      const [stockResponse, recommendationsResponse] = await Promise.all([
        API.get('/api/stock/summary'),
        API.get('/api/recommendations')
      ]);

      return {
        success: true,
        data: {
          ...stockResponse.data.data,
          recommendations: recommendationsResponse.data.data
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch dashboard data'
      };
    }
  },

  getRecommendations: async () => {
    try {
      const response = await API.get('/api/recommendations');
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch recommendations'
      };
    }
  },

  // Product Management
  addProduct: async (productData) => {
    try {
      const response = await API.post('/api/products', productData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add product'
      };
    }
  },

  updateProduct: async (productId, productData) => {
    try {
      const response = await API.put(`/api/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update product'
      };
    }
  },

  deleteProduct: async (productId) => {
    try {
      const response = await API.delete(`/api/products/${productId}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete product'
      };
    }
  },

  // Stock Management
  getStockByLocation: async (locationId) => {
    try {
      const response = await API.get(`/api/stock/location/${locationId}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch stock'
      };
    }
  },

  getAllStock: async () => {
    try {
      const response = await API.get('/api/stock/all');
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch all stock'
      };
    }
  },

  getStockSummary: async () => {
    try {
      const response = await API.get('/api/stock/summary');
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch stock summary'
      };
    }
  },

  updateStock: async (productId, locationId, quantity) => {
    try {
      const response = await API.put('/api/stock', { productId, locationId, quantity });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update stock'
      };
    }
  },

  // Orders
  orderProduct: async (productId, locationId, quantity) => {
    try {
      const response = await API.post('/api/orders/order', { productId, locationId, quantity });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to order product'
      };
    }
  },

  purchaseProduct: async (orderId) => {
    try {
      const response = await API.post(`/api/orders/purchase/${orderId}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to purchase product'
      };
    }
  },

  getUserOrders: async (userId) => {
    try {
      const response = await API.get(`/api/orders/user/${userId}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch orders'
      };
    }
  },

  cancelOrder: async (orderId) => {
    try {
      const response = await API.put(`/api/orders/cancel/${orderId}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel order'
      };
    }
  },

  // Recommendations
  approveTransfer: async (recommendationId) => {
    try {
      const response = await API.post(`/api/recommendations/${recommendationId}/approve`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to approve transfer'
      };
    }
  },

  // Locations
  getLocations: async () => {
    try {
      const response = await API.get('/api/locations');
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch locations'
      };
    }
  },

  createLocation: async (locationData) => {
    try {
      const response = await API.post('/api/locations', locationData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create location'
      };
    }
  },

  updateLocation: async (locationId, locationData) => {
    try {
      const response = await API.put(`/api/locations/${locationId}`, locationData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update location'
      };
    }
  },

  deleteLocation: async (locationId) => {
    try {
      const response = await API.delete(`/api/locations/${locationId}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete location'
      };
    }
  }
};
