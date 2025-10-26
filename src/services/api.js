import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '../config/api';

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    console.log('🔑 API Request:', config.method.toUpperCase(), config.url);
    console.log('🔑 Token present:', token ? 'YES' : 'NO');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Authorization header set');
    } else {
      console.warn('⚠️  No auth token found in AsyncStorage!');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log detailed error information
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (email, password, name, phone) => {
    const response = await api.post(ENDPOINTS.USER_REGISTER, {
      email,
      password,
      name,
      phone,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post(ENDPOINTS.USER_LOGIN, {
      email,
      password,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get(ENDPOINTS.USER_PROFILE);
    return response.data;
  },
};

// Session API calls
export const sessionAPI = {
  bookSession: async (serviceId, fromDatetime, toDatetime) => {
    const response = await api.post(ENDPOINTS.SESSIONS_BOOK, {
      serviceId,
      fromDatetime,
      toDatetime,
    });
    return response.data;
  },

  getUserSessions: async () => {
    const response = await api.get(ENDPOINTS.SESSIONS_LIST);
    return response.data;
  },
};

// Service API calls
export const serviceAPI = {
  getAllServices: async () => {
    try {
      const response = await api.get('/services');
      return response.data;
    } catch (error) {
      // If endpoint doesn't exist, return empty array
      return { success: true, data: [] };
    }
  },
};

// Payment API calls
export const paymentAPI = {
  initiateFlowPayment: async (sessionId) => {
    const response = await api.post('/payments/initiateFlow', {
      sessionId,
    });
    return response.data;
  },

  executeFlowPayment: async (paymentId, transactionHash, senderWalletAddress) => {
    const response = await api.post('/payments/executeFlow', {
      paymentId,
      transactionHash,
      senderWalletAddress,
    });
    return response.data;
  },

  getPaymentStatus: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}/status`);
    return response.data;
  },

  getUserPaymentHistory: async () => {
    const response = await api.get('/payments/user');
    return response.data;
  },
};

export default api;
