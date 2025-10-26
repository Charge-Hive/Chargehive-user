// API Configuration
export const API_CONFIG = {
  // Use the Heroku dev endpoint from the API documentation
  BASE_URL: 'https://chargehive-backend-dev-c567e0fd7ba7.herokuapp.com/api',

  // For local development, uncomment the line below:
  // BASE_URL: 'http://localhost:3000/api',

  TIMEOUT: 30000, // 30 seconds
};

// API Endpoints
export const ENDPOINTS = {
  // User endpoints
  USER_REGISTER: '/user/register',
  USER_LOGIN: '/user/login',
  USER_PROFILE: '/user/profile',

  // Session endpoints
  SESSIONS_BOOK: '/sessions/book',
  SESSIONS_LIST: '/sessions',

  // Service endpoints
  SERVICES_LIST: '/services',
};
