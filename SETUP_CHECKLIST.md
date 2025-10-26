# ChargeHive User App - Setup Checklist

Use this checklist to ensure your app is properly configured and ready to run.

## ✅ Installation Checklist

- [ ] Node.js 18+ installed on your computer
- [ ] Navigated to `Chargehive-user` folder
- [ ] Ran `npm install` successfully
- [ ] All dependencies installed without errors
- [ ] Expo Go app installed on your phone (or emulator ready)

## ✅ Configuration Checklist

### Required Configuration

- [ ] **Backend API URL** configured in `src/config/api.js`
  - Default: Heroku dev endpoint (already configured)
  - For local: Update with your computer's IP address

### Optional Configuration (Android Only)

- [ ] **Google Maps API Key** added to `app.json`
  - Location: `android.config.googleMaps.apiKey`
  - Get key from: https://console.cloud.google.com/
  - Required for Android map display

## ✅ Pre-Launch Checklist

### For Physical Device Testing

- [ ] Phone and computer on **same WiFi network**
- [ ] Location services **enabled** on phone
- [ ] Expo Go app **installed** on phone
- [ ] Backend server is **running** (if testing locally)

### For Emulator Testing

- [ ] Android emulator installed (for Android testing)
- [ ] Xcode installed (for iOS testing on macOS)
- [ ] Emulator location services enabled

## ✅ First Run Checklist

### Step 1: Start the App
```bash
npx expo start
```
- [ ] Development server started successfully
- [ ] QR code displayed in terminal
- [ ] No error messages in console

### Step 2: Open on Device
- [ ] Scanned QR code with Expo Go (Android) or Camera (iOS)
- [ ] App loaded successfully
- [ ] Login screen displayed

### Step 3: Test Authentication
- [ ] Tapped "Sign Up"
- [ ] Filled in all required fields
- [ ] Successfully created account
- [ ] Automatically logged in
- [ ] Redirected to Map screen

### Step 4: Test Permissions
- [ ] Location permission requested
- [ ] Location permission granted
- [ ] Map displayed with current location
- [ ] Blue dot showing user position

### Step 5: Test Map Features
- [ ] Map loads correctly
- [ ] P markers (red) visible for parking
- [ ] C markers (teal) visible for charging
- [ ] Legend visible in top right
- [ ] Can tap markers to see details
- [ ] Refresh button works

### Step 6: Test Booking
- [ ] Tapped a P or C marker
- [ ] Booking screen opened
- [ ] Selected start date/time
- [ ] Selected end date/time
- [ ] Total amount calculated correctly
- [ ] Successfully booked session
- [ ] Session appears in History

### Step 7: Test Wallet
- [ ] Wallet tab accessible
- [ ] Balance displayed
- [ ] Wallet address shown
- [ ] Tapped "Receive" button
- [ ] QR code generated
- [ ] Can copy wallet address
- [ ] Tapped "Transactions" button
- [ ] Transaction history displayed

### Step 8: Test History
- [ ] History tab accessible
- [ ] Booked session visible
- [ ] Session details correct
- [ ] Status badge showing (Upcoming/Active/Completed)
- [ ] Pull-to-refresh works

### Step 9: Test Logout
- [ ] Tapped logout button in Map screen header
- [ ] Redirected to Login screen
- [ ] App cleared user session

### Step 10: Test Auto-Login
- [ ] Closed app completely
- [ ] Reopened app
- [ ] Automatically logged back in
- [ ] Redirected to Map screen

## 🔧 Troubleshooting Checklist

### If App Won't Load
- [ ] Checked internet connection
- [ ] Verified phone and computer on same WiFi
- [ ] Restarted Expo server (`Ctrl+C`, then `npx expo start`)
- [ ] Cleared Expo cache: `npx expo start -c`
- [ ] Restarted Expo Go app

### If Map Won't Show
- [ ] Granted location permissions
- [ ] Checked internet connection
- [ ] Added Google Maps API key (Android only)
- [ ] Restarted app

### If Backend Connection Fails
- [ ] Verified backend is running
- [ ] Checked API URL in `src/config/api.js`
- [ ] Used computer IP (not localhost) for local backend
- [ ] Verified phone can reach backend (same network)

### If Build Errors Occur
- [ ] Deleted `node_modules` folder
- [ ] Ran `npm install` again
- [ ] Cleared Metro bundler cache
- [ ] Checked for missing dependencies

## 📱 Platform-Specific Checklist

### iOS Specific
- [ ] Location permission description in `app.json`
- [ ] Running on macOS for simulator
- [ ] iOS simulator installed via Xcode

### Android Specific
- [ ] Google Maps API key configured
- [ ] Location permissions in `app.json`
- [ ] Android SDK installed (for emulator)

## 🚀 Ready for Development

Once all items are checked, your app is ready! You should be able to:

✅ Sign up / Log in
✅ View map with P and C markers
✅ Book parking/charging sessions
✅ View wallet and generate QR codes
✅ Check booking history
✅ Navigate between all screens

## 📝 Notes

- Keep this checklist handy for setting up on new devices
- Share with team members for consistent setup
- Update as new features are added

## 🆘 Need Help?

If you're stuck on any step:

1. Check **QUICK_START.md** for basic setup
2. Review **README.md** for detailed documentation
3. Check **PROJECT_SUMMARY.md** for architecture overview
4. Review backend API documentation
5. Check Expo documentation: https://docs.expo.dev

---

**Last Updated**: October 2025
**Version**: 1.0.0
