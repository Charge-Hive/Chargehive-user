# ChargeHive User App

A React Native Expo application for ChargeHive users to find, book, and manage parking and EV charging station sessions.

## ⚠️ Important: Demo Mode

**The app is currently running in DEMO MODE** because the backend is missing the `GET /api/services` endpoint.

- ✅ App works fully for UI/UX testing
- ✅ Shows 4 demo parking/charging locations on map
- ❌ Booking real sessions requires backend endpoint

See [BACKEND_REQUIREMENTS.md](BACKEND_REQUIREMENTS.md) for details on the missing endpoint.

## Features

### 1. Authentication
- **User Signup**: Register with email, password, name, and phone number
- **User Login**: Authenticate using email and password
- **Automatic wallet creation**: Each user gets a blockchain wallet address upon registration
- **Persistent sessions**: Auto-login on app restart

### 2. Map View (Home)
- Interactive map showing all available parking and charging stations
- **P markers** (Red): Parking spots
- **C markers** (Teal): EV Charging stations
- Location-based services with user's current position
- Service details on marker tap (address, city, hourly rate, status)
- Click markers to book sessions (login required)
- Refresh button to reload services
- Legend to identify marker types

### 3. Wallet
- **Balance Display**: View token balance (CHV)
- **Send Tokens**: Transfer tokens to other wallet addresses
- **Receive Tokens**: Display QR code and wallet address for receiving payments
- **Transaction History**: View all sent, received, and payment transactions
- Copy wallet address to clipboard

### 4. Booking System
- Book parking or charging sessions from map markers
- Select start and end date/time using date picker
- Real-time calculation of total amount based on duration and hourly rate
- Booking summary with duration, rate, and total cost
- Validation for:
  - No past bookings
  - End time must be after start time
  - Service availability checks

### 5. History
- View all booked sessions (past, active, and upcoming)
- Session status indicators:
  - **Upcoming** (Blue): Future bookings
  - **Active** (Green): Currently in progress
  - **Completed** (Gray): Past sessions
- Detailed information for each booking:
  - Service type (Parking/Charging)
  - Location details
  - Date and time
  - Total amount paid
  - Booking ID
- Pull to refresh functionality

## Tech Stack

- **React Native** with **Expo SDK 54**
- **React 19.1.0** ⚠️ See [REACT_VERSION_NOTE.md](REACT_VERSION_NOTE.md) for compatibility concerns
- **React Navigation** (Stack & Bottom Tabs)
- **Expo Maps** for map functionality
- **Expo Location** for geolocation
- **Axios** for API calls
- **AsyncStorage** for local data persistence
- **React Native QR Code SVG** for QR code generation
- **DateTimePicker** for date/time selection

> **⚠️ Important**: React 19 with React Native 0.81.5 may have compatibility issues. See [REACT_VERSION_NOTE.md](REACT_VERSION_NOTE.md) for details and recommendations.

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (iOS/Android) or emulator
- ChargeHive backend running (see backend documentation)

## Installation

1. **Navigate to the project directory:**
   ```bash
   cd Chargehive-user
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API endpoint:**

   Edit `src/config/api.js` to set your backend URL:
   ```javascript
   export const API_CONFIG = {
     BASE_URL: 'https://chargehive-backend-dev-c567e0fd7ba7.herokuapp.com/api',
     // OR for local development:
     // BASE_URL: 'http://YOUR_LOCAL_IP:3000/api',
   };
   ```

4. **Configure Google Maps (Android only):**

   ⚠️ **IMPORTANT**: Edit `app.json` and replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual Google Maps API key:
   ```json
   "android": {
     "config": {
       "googleMaps": {
         "apiKey": "YOUR_ACTUAL_API_KEY_HERE"  // ← Replace this!
       }
     }
   }
   ```

   Get your API key from [Google Cloud Console](https://console.cloud.google.com/).

   **Without a valid API key, the Android app will crash or maps won't work!**

## Running the App

### Development Mode

1. **Start Expo development server:**
   ```bash
   npx expo start
   ```

2. **Run on your device:**
   - Scan the QR code with Expo Go app (Android) or Camera app (iOS)

   OR

3. **Run on emulator/simulator:**
   - Press `a` for Android emulator
   - Press `i` for iOS simulator (macOS only)
   - Press `w` for web browser

## Project Structure

```
Chargehive-user/
├── src/
│   ├── screens/           # All screen components
│   │   ├── LoginScreen.js
│   │   ├── SignupScreen.js
│   │   ├── MapScreen.js
│   │   ├── WalletScreen.js
│   │   ├── HistoryScreen.js
│   │   └── BookingScreen.js
│   ├── navigation/        # Navigation configuration
│   │   └── AppNavigator.js
│   ├── context/          # React Context providers
│   │   └── AuthContext.js
│   ├── services/         # API service layer
│   │   └── api.js
│   ├── config/           # App configuration
│   │   └── api.js
│   └── utils/            # Utility functions
├── assets/               # Images and static assets
├── App.js               # Root component
├── app.json             # Expo configuration
└── package.json         # Dependencies
```

## API Integration

The app integrates with the ChargeHive backend API. Key endpoints used:

- `POST /api/user/register` - User registration
- `POST /api/user/login` - User authentication
- `GET /api/user/profile` - Get user profile
- `POST /api/sessions/book` - Book a session
- `GET /api/sessions` - Get user's booking history
- `GET /api/services` - Get all parking/charging services

See the API documentation in the backend folder for detailed endpoint information.

## App Flow

1. **First Launch**
   - User sees Login screen
   - Can navigate to Signup to create account

2. **After Registration/Login**
   - User is automatically logged in
   - Redirected to Map screen (main tab)
   - Bottom navigation shows: Map | Wallet | History

3. **Booking a Session**
   - Tap on P or C marker on map
   - If not logged in, prompted to login
   - Select date/time range
   - Review total amount
   - Confirm booking
   - Session appears in History

4. **Managing Wallet**
   - View token balance
   - Send tokens to other users
   - Receive tokens via QR code
   - View transaction history

## Key Features Implementation

### Maps & Location
- Requests location permissions on first launch
- Shows user's current location on map
- Displays all available services with custom markers
- Different colors for parking (red) vs charging (teal)

### Authentication
- JWT token-based authentication
- Token stored securely in AsyncStorage
- Auto-logout on token expiration (401 errors)
- Protected routes require authentication

### State Management
- React Context API for auth state
- Local state management with useState
- Navigation state persistence

## Building for Production

### Android APK
```bash
npx expo build:android
```

### iOS IPA
```bash
npx expo build:ios
```

## Troubleshooting

### Map not showing
- Ensure location permissions are granted
- Check that Google Maps API key is configured (Android)
- Verify internet connection

### API errors
- Confirm backend is running
- Check API_CONFIG.BASE_URL in `src/config/api.js`
- For local development, use your computer's IP address, not localhost

### Build errors
- Clear cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Update Expo: `npx expo upgrade`

## Environment Setup

For local backend development, make sure your phone/emulator can reach the backend:

1. **Same WiFi network**: Connect your phone to the same WiFi as your computer
2. **Use computer's IP**: Replace `localhost` with your computer's IP address
3. **Backend CORS**: Ensure backend allows requests from mobile app

Example:
```javascript
BASE_URL: 'http://192.168.1.100:3000/api'  // Replace with your IP
```

## Known Limitations

- Wallet functionality is currently using mock data
- Blockchain integration pending
- Payment processing not yet implemented
- Transaction history is simulated

## Future Enhancements

- Real blockchain integration for wallet
- Payment gateway integration
- Push notifications for booking reminders
- Session QR codes for check-in
- Ratings and reviews for services
- Favorite locations
- Route navigation to selected service

## Support

For issues or questions, please refer to the main ChargeHive documentation or contact the development team.

## License

This project is part of the ChargeHive ecosystem.
