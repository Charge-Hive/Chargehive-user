# Google Maps & Analytics Implementation Guide

## Overview
This document describes the Google Maps integration and comprehensive analytics/logging system implemented in the ChargeHive User app.

---

## ✅ What Was Implemented

### 1. Google Maps Integration
- **Full map view** with user location tracking
- **Custom markers** for Parking (P) and Charging (C) stations
- **Interactive markers** with click-to-book functionality
- **User location permission** handling
- **Map controls**: My Location button, Compass, Zoom
- **Fallback to demo data** if backend is unavailable

### 2. Comprehensive Analytics & Logging
- **Every user action** is logged to console
- **Detailed timestamps** for all events
- **Categorized logging** by feature area
- **Beautiful formatted output** with emojis and structure

---

## 📍 Google Maps Features

### User Location
- Requests permission on first load
- Shows blue dot for user's current location
- Auto-centers map to user location
- Falls back to San Francisco if permission denied

### Custom Markers
- **Parking (P)**: Red circular markers with "P" badge
- **Charging (C)**: Teal circular markers with "C" badge
- Each marker shows:
  - Service type (Parking/EV Charging)
  - Address
  - Hourly rate
- Tap marker to book a session

### Map UI Elements
- **Info Card**: Shows count of nearby locations
- **Legend**: Visual guide for marker types
- **Refresh Button**: Reload services and location
- **My Location Button**: Recenter to user position

---

## 📊 Analytics & Logging System

### How It Works
Every user action triggers a log entry in the console with:
```
[ChargeHive Analytics] [HH:MM:SS.mmm]
📍 Category: AUTHENTICATION
🎯 Action: Login Success ✅
   Details: {
     "email": "user@example.com",
     "userId": "12345",
     "timestamp": "2025-01-24T..."
   }
```

### Categories Tracked

#### 1. **AUTHENTICATION**
- Login attempts & results
- Signup attempts & results
- Logout events
- Email and userId logged

#### 2. **MAP**
- Map screen opened
- Location permission requested/granted/denied
- User location found (with coordinates)
- Services loaded (count & source)
- Marker clicks (with service details)
- Map refreshed
- "Open in Maps" clicked

#### 3. **WALLET**
- Wallet screen opened
- Send modal opened
- Send attempts & success
- Send cancelled
- Receive modal opened
- Address copied
- Transactions viewed

#### 4. **BOOKING**
- Booking screen opened (with service ID)
- Date selection (From/To dates)
- Booking attempts
- Booking success (with session ID)
- Booking failures
- Booking cancelled

#### 5. **HISTORY**
- History screen opened
- Sessions loaded (count)
- Session details viewed
- History refreshed

#### 6. **NAVIGATION**
- Screen changes
- Tab changes (Map/Wallet/History)

#### 7. **APP**
- App launched (with platform)
- Errors (with location)

---

## 🗺️ Configuration

### Google Maps API Key
**Location**: Stored in two places for security and functionality

1. **`.env` file** (line 10):
   ```
   GOOGLE_MAPS_API_KEY=AIzaSyAFkOhddibMIY0iA3VVAUx7Nt69pJSBkio
   ```

2. **`app.json`** (line 35):
   ```json
   "googleMaps": {
     "apiKey": "AIzaSyAFkOhddibMIY0iA3VVAUx7Nt69pJSBkio"
   }
   ```

### Location Permissions

**iOS** (`app.json` line 19):
```json
"NSLocationWhenInUseUsageDescription": "ChargeHive needs access to your location to show nearby parking and charging stations."
```

**Android** (`app.json` lines 29-32):
```json
"permissions": [
  "ACCESS_FINE_LOCATION",
  "ACCESS_COARSE_LOCATION"
]
```

---

## 📁 Files Modified/Created

### Created Files
1. **`src/utils/analytics.js`** - Complete analytics system
2. **`src/screens/MapScreen.js`** - Completely rewritten with Google Maps

### Modified Files
1. **`.env`** - Added Google Maps API key
2. **`app.json`** - Added Google Maps API key
3. **`App.js`** - Added app launch logging
4. **`src/context/AuthContext.js`** - Added login/signup/logout logging
5. **`src/navigation/AppNavigator.js`** - Added tab change logging
6. **`src/screens/LoginScreen.js`** - Added screen opened logging
7. **`src/screens/SignupScreen.js`** - Added screen opened logging
8. **`src/screens/WalletScreen.js`** - Added all wallet action logging
9. **`src/screens/BookingScreen.js`** - Added booking & date logging
10. **`src/screens/HistoryScreen.js`** - Added history viewing logging

### Packages Installed
- `react-native-maps` - Google Maps for React Native (Expo compatible)

---

## 🎯 User Flow with Logging

### Example: User Books a Parking Spot

```
1. App Launched
   [ChargeHive Analytics] [10:30:15.234]
   📍 Category: APP
   🎯 Action: App Launched
      Details: { "platform": "ios" }

2. User Logs In
   [ChargeHive Analytics] [10:30:20.567]
   📍 Category: AUTHENTICATION
   🎯 Action: Login Attempt
      Details: { "email": "user@example.com" }

   [ChargeHive Analytics] [10:30:21.891]
   📍 Category: AUTHENTICATION
   🎯 Action: Login Success ✅
      Details: {
        "email": "user@example.com",
        "userId": "abc123",
        "timestamp": "2025-01-24T10:30:21.891Z"
      }

3. Map Screen Opens
   [ChargeHive Analytics] [10:30:22.045]
   📍 Category: MAP
   🎯 Action: Map Screen Opened

4. Location Permission Requested
   [ChargeHive Analytics] [10:30:22.123]
   📍 Category: MAP
   🎯 Action: Location Permission Requested

   [ChargeHive Analytics] [10:30:23.456]
   📍 Category: MAP
   🎯 Action: Location Permission Granted ✅

5. User Location Found
   [ChargeHive Analytics] [10:30:24.789]
   📍 Category: MAP
   🎯 Action: User Location Found
      Details: {
        "latitude": 37.7749,
        "longitude": -122.4194
      }

6. Services Loaded
   [ChargeHive Analytics] [10:30:25.234]
   📍 Category: MAP
   🎯 Action: Services Loaded
      Details: {
        "count": 4,
        "source": "demo"
      }

7. User Clicks Parking Marker
   [ChargeHive Analytics] [10:30:30.567]
   📍 Category: MAP
   🎯 Action: Marker Clicked
      Details: {
        "serviceId": "demo-p1",
        "serviceType": "parking",
        "address": "123 Market Street"
      }

8. Booking Screen Opens
   [ChargeHive Analytics] [10:30:30.678]
   📍 Category: BOOKING
   🎯 Action: Booking Screen Opened
      Details: {
        "serviceId": "demo-p1",
        "serviceType": "parking"
      }

9. User Selects Date
   [ChargeHive Analytics] [10:30:45.123]
   📍 Category: BOOKING
   🎯 Action: From Date Selected
      Details: { "date": "2025-01-24T14:00:00.000Z" }

10. User Confirms Booking
    [ChargeHive Analytics] [10:31:00.456]
    📍 Category: BOOKING
    🎯 Action: Booking Attempt
       Details: {
         "serviceId": "demo-p1",
         "fromDate": "2025-01-24T14:00:00.000Z",
         "toDate": "2025-01-24T16:00:00.000Z",
         "totalAmount": "30"
       }

    [ChargeHive Analytics] [10:31:01.789]
    📍 Category: BOOKING
    🎯 Action: Booking Success ✅
       Details: {
         "serviceId": "demo-p1",
         "sessionId": "session_xyz789",
         "totalAmount": "30"
       }
```

---

## 🔍 How to View Logs

### During Development

1. **Start Expo**:
   ```bash
   npx expo start
   ```

2. **Open Console**:
   - Terminal will show all logs
   - Look for `[ChargeHive Analytics]` prefix

3. **Filter Logs** (optional):
   ```bash
   npx expo start | grep "ChargeHive Analytics"
   ```

### In Production

For production, you would:
1. Replace `console.log` with analytics service (Firebase, Mixpanel, etc.)
2. Send logs to backend for storage
3. View in analytics dashboard

---

## 🎨 Map Customization

### Changing Marker Colors
Edit `MapScreen.js`:
```javascript
// Line ~218
pinColor={service.serviceType === 'parking' ? '#FF6B6B' : '#4ECDC4'}
```

### Changing Map Region
Edit `MapScreen.js`:
```javascript
// Default location (San Francisco)
latitude: 37.7749,
longitude: -122.4194,
latitudeDelta: 0.0922,  // Zoom level (smaller = more zoomed in)
longitudeDelta: 0.0421,
```

### Adding Map Types
```javascript
<MapView
  mapType="hybrid" // standard, satellite, hybrid
  ...
/>
```

---

## 🚀 Next Steps

### Recommended Enhancements
1. **Clustering**: Group nearby markers when zoomed out
2. **Search**: Add location search bar
3. **Filters**: Filter by parking vs charging
4. **Routing**: Show directions to selected service
5. **Heatmap**: Show popular areas
6. **Real-time**: Update availability in real-time

### Analytics Improvements
1. **Firebase Analytics**: Send events to Firebase
2. **User Sessions**: Track time spent per screen
3. **Conversion Tracking**: Track booking conversion rate
4. **Error Reporting**: Automatic error logging
5. **A/B Testing**: Track feature usage

---

## 📱 Testing Checklist

- [x] Map loads on iOS
- [x] Map loads on Android
- [x] Location permission requested
- [x] User location shows on map
- [x] Parking markers (P) display correctly
- [x] Charging markers (C) display correctly
- [x] Marker click opens booking screen
- [x] Login logs to console
- [x] Logout logs to console
- [x] Map actions log to console
- [x] Wallet actions log to console
- [x] Booking actions log to console
- [x] Tab changes log to console

---

## 🔒 Security Notes

⚠️ **IMPORTANT**: The Google Maps API key is now in the codebase
- Current key is in `.env` and `app.json`
- `.env` is in `.gitignore` (won't be committed)
- `app.json` is NOT in `.gitignore` (will be committed)
- For production: Use environment-specific keys
- Consider restricting API key to your app's bundle ID

---

## 💡 Tips

1. **Check Logs**: Always check console for analytics events
2. **Test Permissions**: Test both "Allow" and "Deny" location permission
3. **Test Offline**: Map should show demo data if backend fails
4. **Monitor API Usage**: Google Maps API has daily quota limits
5. **Clear Cache**: If map doesn't load, clear Expo cache: `npx expo start -c`

---

**Last Updated**: January 24, 2025
**Status**: ✅ Fully Implemented
**Author**: Claude Code Assistant
