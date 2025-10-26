/**
 * Analytics & Logging Utility
 * Tracks all user actions throughout the app
 */

const LOG_PREFIX = '[ChargeHive Analytics]';
const TIMESTAMP_FORMAT = {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  fractionalSecondDigits: 3
};

/**
 * Main logging function with timestamp and formatting
 */
const logEvent = (category, action, details = {}) => {
  const timestamp = new Date().toLocaleTimeString('en-US', TIMESTAMP_FORMAT);
  const detailsStr = Object.keys(details).length > 0
    ? `\n   Details: ${JSON.stringify(details, null, 2).replace(/\n/g, '\n   ')}`
    : '';

  console.log(
    `\n${LOG_PREFIX} [${timestamp}]`,
    `\n📍 Category: ${category}`,
    `\n🎯 Action: ${action}${detailsStr}\n`
  );
};

/**
 * Authentication Events
 */
export const logAuth = {
  loginAttempt: (email) => {
    logEvent('AUTHENTICATION', 'Login Attempt', { email });
  },

  loginSuccess: (email, userId) => {
    logEvent('AUTHENTICATION', 'Login Success ✅', {
      email,
      userId,
      timestamp: new Date().toISOString()
    });
  },

  loginFailure: (email, error) => {
    logEvent('AUTHENTICATION', 'Login Failed ❌', {
      email,
      error: error.message || error
    });
  },

  signupAttempt: (email, name) => {
    logEvent('AUTHENTICATION', 'Signup Attempt', { email, name });
  },

  signupSuccess: (email, userId) => {
    logEvent('AUTHENTICATION', 'Signup Success ✅', {
      email,
      userId,
      timestamp: new Date().toISOString()
    });
  },

  signupFailure: (email, error) => {
    logEvent('AUTHENTICATION', 'Signup Failed ❌', {
      email,
      error: error.message || error
    });
  },

  logout: (email) => {
    logEvent('AUTHENTICATION', 'User Logout', {
      email,
      timestamp: new Date().toISOString()
    });
  },
};

/**
 * Map & Location Events
 */
export const logMap = {
  screenOpened: () => {
    logEvent('MAP', 'Map Screen Opened');
  },

  locationPermissionRequested: () => {
    logEvent('MAP', 'Location Permission Requested');
  },

  locationPermissionGranted: () => {
    logEvent('MAP', 'Location Permission Granted ✅');
  },

  locationPermissionDenied: () => {
    logEvent('MAP', 'Location Permission Denied ❌');
  },

  userLocationFound: (latitude, longitude) => {
    logEvent('MAP', 'User Location Found', { latitude, longitude });
  },

  servicesLoaded: (count, source) => {
    logEvent('MAP', 'Services Loaded', {
      count,
      source: source || 'backend'
    });
  },

  markerClicked: (serviceId, serviceType, address) => {
    logEvent('MAP', 'Marker Clicked', {
      serviceId,
      serviceType,
      address
    });
  },

  mapRefreshed: () => {
    logEvent('MAP', 'Map Data Refreshed');
  },

  openInMapsClicked: (serviceId, serviceType, address) => {
    logEvent('MAP', 'Open in External Maps', {
      serviceId,
      serviceType,
      address
    });
  },
};

/**
 * Wallet Events
 */
export const logWallet = {
  screenOpened: () => {
    logEvent('WALLET', 'Wallet Screen Opened');
  },

  sendModalOpened: () => {
    logEvent('WALLET', 'Send Tokens Modal Opened');
  },

  sendAttempt: (recipientAddress, amount) => {
    logEvent('WALLET', 'Send Tokens Attempt', {
      recipientAddress: recipientAddress.substring(0, 10) + '...',
      amount
    });
  },

  sendSuccess: (recipientAddress, amount) => {
    logEvent('WALLET', 'Send Tokens Success ✅', {
      recipientAddress: recipientAddress.substring(0, 10) + '...',
      amount
    });
  },

  sendCancelled: () => {
    logEvent('WALLET', 'Send Tokens Cancelled');
  },

  receiveModalOpened: () => {
    logEvent('WALLET', 'Receive Tokens Modal Opened');
  },

  addressCopied: (walletAddress) => {
    logEvent('WALLET', 'Wallet Address Copied', {
      address: walletAddress.substring(0, 10) + '...'
    });
  },

  transactionsViewed: () => {
    logEvent('WALLET', 'Transactions Modal Opened');
  },
};

/**
 * Booking Events
 */
export const logBooking = {
  screenOpened: (serviceId, serviceType) => {
    logEvent('BOOKING', 'Booking Screen Opened', {
      serviceId,
      serviceType
    });
  },

  dateSelected: (dateType, selectedDate) => {
    logEvent('BOOKING', `${dateType} Date Selected`, {
      date: selectedDate.toISOString()
    });
  },

  bookingAttempt: (serviceId, fromDate, toDate, totalAmount) => {
    logEvent('BOOKING', 'Booking Attempt', {
      serviceId,
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
      totalAmount
    });
  },

  bookingSuccess: (serviceId, sessionId, totalAmount) => {
    logEvent('BOOKING', 'Booking Success ✅', {
      serviceId,
      sessionId,
      totalAmount
    });
  },

  bookingFailed: (serviceId, error) => {
    logEvent('BOOKING', 'Booking Failed ❌', {
      serviceId,
      error: error.message || error
    });
  },

  bookingCancelled: () => {
    logEvent('BOOKING', 'Booking Cancelled');
  },

  paymentMethodSelected: (method) => {
    logEvent('BOOKING', 'Payment Method Selected', { method });
  },
};

/**
 * History Events
 */
export const logHistory = {
  screenOpened: () => {
    logEvent('HISTORY', 'History Screen Opened');
  },

  sessionsLoaded: (count) => {
    logEvent('HISTORY', 'Sessions Loaded', { count });
  },

  sessionViewed: (sessionId, serviceType) => {
    logEvent('HISTORY', 'Session Details Viewed', {
      sessionId,
      serviceType
    });
  },

  refreshed: () => {
    logEvent('HISTORY', 'History Refreshed');
  },
};

/**
 * Navigation Events
 */
export const logNavigation = {
  screenChange: (screenName) => {
    logEvent('NAVIGATION', 'Screen Changed', { screenName });
  },

  tabChanged: (tabName) => {
    logEvent('NAVIGATION', 'Tab Changed', { tabName });
  },
};

/**
 * App Lifecycle Events
 */
export const logApp = {
  launched: () => {
    logEvent('APP', 'App Launched', {
      platform: require('react-native').Platform.OS
    });
  },

  error: (error, location) => {
    logEvent('APP', 'Error Occurred ❌', {
      error: error.message || error,
      location
    });
  },
};

export default {
  logAuth,
  logMap,
  logWallet,
  logBooking,
  logHistory,
  logNavigation,
  logApp,
};
