# ChargeHive User App - Quick Start Guide

## Get Started in 3 Minutes

### 1. Install Dependencies (1 minute)
```bash
cd Chargehive-user
npm install
```

### 2. Start the App (30 seconds)
```bash
npx expo start
```

### 3. Run on Your Device (30 seconds)

**Option A: Physical Device**
1. Install "Expo Go" from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in terminal
3. App will load on your device

**Option B: Emulator**
- Press `a` for Android emulator
- Press `i` for iOS simulator (macOS only)
- Press `w` for web browser

## First Time Using the App

### Create an Account
1. Tap "Sign Up" on the login screen
2. Fill in:
   - Full Name
   - Email
   - Phone Number
   - Password (6+ characters)
   - Confirm Password
3. Tap "Sign Up"
4. You'll be automatically logged in

### Test Account (if backend has seed data)
```
Email: user@test.com
Password: Test123!
```

## Using the App

### 🗺️ Map Screen (Home)
- **Red P markers**: Parking spots
- **Teal C markers**: Charging stations
- **Tap a marker** to see details
- **Tap marker again** to book a session
- **Refresh button** (bottom right) to reload services

### 💰 Wallet Screen
- View your token balance (CHV)
- **Send**: Transfer tokens to another wallet
- **Receive**: Show QR code for receiving tokens
- **Transactions**: View transaction history

### 📅 History Screen
- See all your bookings
- **Blue badge**: Upcoming sessions
- **Green badge**: Active sessions
- **Gray badge**: Completed sessions
- **Pull down** to refresh

## Booking a Session

1. Tap a **P** or **C** marker on the map
2. Review service details (address, hourly rate)
3. Select **From** date & time
4. Select **To** date & time
5. Review **Total Amount** in summary
6. Tap **Confirm Booking**
7. Session appears in **History** tab

## Important Notes

### Backend Connection
The app is configured to use the Heroku dev backend by default:
```
https://chargehive-backend-dev-c567e0fd7ba7.herokuapp.com/api
```

### For Local Backend Development
1. Make sure your backend is running
2. Edit `src/config/api.js`:
   ```javascript
   BASE_URL: 'http://YOUR_COMPUTER_IP:3000/api'
   ```
3. Replace `YOUR_COMPUTER_IP` with your actual IP address
4. Ensure phone and computer are on same WiFi network

### Finding Your Computer's IP

**macOS/Linux:**
```bash
ifconfig | grep "inet "
```

**Windows:**
```cmd
ipconfig
```

Look for something like `192.168.1.100`

## Troubleshooting

### "Cannot connect to backend"
- Check internet connection
- Verify backend is running
- Check API URL in `src/config/api.js`

### Map not loading
- Grant location permissions when prompted
- Check internet connection
- Try refreshing the app

### "Expo Go not connecting"
- Ensure phone and computer are on same WiFi
- Try stopping (`Ctrl+C`) and restarting (`npx expo start`)
- Restart Expo Go app

### Clear cache and restart
```bash
npx expo start -c
```

## App Features at a Glance

| Feature | Description |
|---------|-------------|
| 🔐 **Auth** | Signup, Login, Auto-login |
| 🗺️ **Maps** | View all P & C locations |
| 📍 **Location** | Your current position on map |
| 📅 **Booking** | Reserve parking/charging slots |
| 💰 **Wallet** | Manage CHV tokens |
| 📊 **History** | Track all bookings |
| 🔔 **Status** | Upcoming, Active, Completed |
| 📱 **QR Code** | Receive tokens via QR |

## Development Commands

```bash
# Start development server
npx expo start

# Clear cache and start
npx expo start -c

# Run on specific platform
npx expo start --android
npx expo start --ios
npx expo start --web

# Install new package
npm install package-name
npx expo install package-name  # For expo-compatible packages
```

## Next Steps

1. ✅ Create account / Login
2. ✅ Grant location permissions
3. ✅ View map with P & C markers
4. ✅ Book your first session
5. ✅ Check booking in History
6. ✅ Explore Wallet features

## Need Help?

- Check [README.md](./README.md) for detailed documentation
- Review API documentation in backend folder
- Check Expo documentation: https://docs.expo.dev

---

**Ready to start?** Run `npx expo start` and scan the QR code!
