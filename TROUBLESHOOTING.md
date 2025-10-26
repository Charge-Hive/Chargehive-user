# Troubleshooting Guide

## Common Issues and Solutions

### Metro Bundler Errors

#### Error: "Asset not found: assets/images/icon.png"

**Cause**: Metro asset resolver expects certain images in the `assets/images/` folder.

**Solution**: ✅ Already fixed! Images have been copied to `assets/images/`

**Files in assets/images/**:
- icon.png
- adaptive-icon.png
- favicon.png
- .gitkeep

---

### "No Data Available" on Map

**Cause**: Backend missing `GET /api/services` endpoint

**Solution**: ✅ App runs in demo mode with 4 sample locations

**Details**: See [DEMO_MODE_GUIDE.md](DEMO_MODE_GUIDE.md)

---

### App Won't Load

#### Issue: QR code scanned but app doesn't open

**Solutions**:
1. Make sure Expo Go is installed on your phone
2. Phone and computer must be on same WiFi network
3. Try stopping server (Ctrl+C) and restarting (`npx expo start`)
4. Clear cache: `npx expo start -c`

#### Issue: White screen or stuck loading

**Solutions**:
1. Check terminal for errors
2. Restart Expo development server
3. Close and reopen Expo Go app
4. Clear Metro bundler cache: `npx expo start -c`

---

### Map Not Showing

#### Issue: Blank map or no markers

**Solutions**:
1. Grant location permissions when prompted
2. Check internet connection
3. Tap the "Refresh" button on map
4. Demo mode should show 4 markers automatically

---

### Login/Signup Errors

#### Issue: "Network Error" or "Failed to connect"

**Check**:
1. Backend server is running
2. API URL in `src/config/api.js` is correct
3. Internet connection is working
4. For local backend: using computer's IP (not localhost)

**Test Backend**:
```bash
curl https://chargehive-backend-dev-c567e0fd7ba7.herokuapp.com/api/user/profile
# Should return 401 Unauthorized (means backend is working)
```

---

### Development Server Issues

#### Issue: Metro bundler won't start

**Solutions**:
```bash
# 1. Clear cache
npx expo start -c

# 2. Reinstall dependencies
rm -rf node_modules
npm install

# 3. Clear watchman (if on macOS)
watchman watch-del-all

# 4. Reset Metro
npx expo start --reset-cache
```

#### Issue: Port already in use

**Solution**:
```bash
# Kill the process on port 8081
lsof -ti:8081 | xargs kill -9

# Restart
npx expo start
```

---

### Platform-Specific Issues

#### iOS Simulator

**Issue**: Map not loading on iOS

**Solutions**:
1. Make sure you're on macOS
2. Xcode must be installed
3. iOS simulator location permissions may need manual enabling
4. Try: Settings > Privacy > Location Services in simulator

#### Android Emulator

**Issue**: Map shows blank or "Google Maps API error"

**Solutions**:
1. Add Google Maps API key to `app.json`:
   ```json
   "android": {
     "config": {
       "googleMaps": {
         "apiKey": "YOUR_KEY_HERE"
       }
     }
   }
   ```
2. Get key from: https://console.cloud.google.com/
3. Restart the app after adding key

---

### Build Errors

#### Issue: Module not found errors

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear cache and restart
npx expo start -c
```

#### Issue: "Unable to resolve module"

**Solutions**:
1. Check if package is installed: `npm ls <package-name>`
2. Reinstall specific package: `npm install <package-name>`
3. Clear Metro cache: `npx expo start -c`

---

### Permission Issues

#### Issue: Location permission not working

**Solutions**:
1. **iOS**: Check Settings > Privacy > Location Services > Expo Go
2. **Android**: Check Settings > Apps > Expo Go > Permissions > Location
3. Uninstall and reinstall Expo Go if needed
4. App should re-prompt for permissions

---

### Network/API Issues

#### Issue: Can't reach backend from phone

**For Local Backend Development**:

1. **Find your computer's IP**:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. **Update API config**:
   Edit `src/config/api.js`:
   ```javascript
   BASE_URL: 'http://192.168.1.XXX:3000/api'
   ```
   Replace XXX with your computer's IP

3. **Check**:
   - Phone and computer on same WiFi
   - Backend allows connections from network (not just localhost)
   - Firewall not blocking port 3000

---

### Booking Errors

#### Issue: "Service not found" when booking

**Expected in Demo Mode**: Demo service IDs don't exist in backend

**Solution**: Wait for backend `GET /api/services` endpoint implementation

See [BACKEND_REQUIREMENTS.md](BACKEND_REQUIREMENTS.md)

---

### Performance Issues

#### Issue: App is slow or laggy

**Solutions**:
1. Close other apps on your phone
2. Use development build instead of Expo Go for better performance
3. Reduce number of console.log statements
4. Check for memory leaks in useEffect hooks

---

## Getting More Help

### Check Logs

**In Terminal** (where you ran `npx expo start`):
- Look for red error messages
- Check for warnings (yellow)
- Note any stack traces

**In Expo Go**:
- Shake device to open developer menu
- Tap "Debug Remote JS" to see console in browser

### Useful Commands

```bash
# Start with various options
npx expo start           # Normal start
npx expo start -c        # Clear cache
npx expo start --tunnel  # Use tunnel (if WiFi issues)
npx expo start --offline # Offline mode

# Platform-specific
npx expo start --android
npx expo start --ios
npx expo start --web

# Debug commands
npx expo doctor          # Check project health
npx expo install --check # Check for incompatible dependencies
```

### Reset Everything

If all else fails, complete reset:
```bash
# 1. Stop server
Ctrl+C

# 2. Clean everything
rm -rf node_modules package-lock.json
npm cache clean --force

# 3. Reinstall
npm install

# 4. Clear and restart
npx expo start -c
```

---

## Still Having Issues?

1. Check [README.md](README.md) for setup instructions
2. Review [QUICK_START.md](QUICK_START.md) for basic setup
3. Check [DEMO_MODE_GUIDE.md](DEMO_MODE_GUIDE.md) for expected behavior
4. Review Expo documentation: https://docs.expo.dev

---

**Last Updated**: October 2025
