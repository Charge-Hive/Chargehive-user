# Demo Mode Guide

## What You're Seeing Now

When you scan the QR code and open the app, here's what happens:

### ✅ What Works Right Now

1. **Login/Signup Screen**
   - You can create a new account
   - You can login with existing credentials
   - Backend authentication works ✅

2. **Map Screen (Home)**
   - Shows a map of San Francisco area
   - Displays **4 demo markers**:
     - 🅿️ Red P - "123 Market Street" (Parking)
     - 🔌 Teal C - "456 Mission Street" (Charger)
     - 🅿️ Red P - "789 Howard Street" (Parking)
     - 🔌 Teal C - "321 Folsom Street" (Charger)
   - You can tap markers to see details
   - All UI elements work perfectly

3. **Wallet Screen**
   - Shows token balance (mock data)
   - Send/Receive/Transactions buttons work
   - QR code generation works

4. **History Screen**
   - Will show your bookings once you make them
   - Currently shows "No Bookings Yet"

### ⚠️ What Shows "Demo Mode" Alert

When the app first loads the map, you'll see an alert:

```
Demo Mode
Could not connect to backend.
Showing demo parking and charging locations.
[OK]
```

This is **NORMAL** and expected! It means:
- The app is working correctly
- The backend doesn't have a GET /services endpoint yet
- The app gracefully falls back to demo data

### 🧪 Testing the App

You can test ALL features except real booking:

#### ✅ Test These Features:

1. **Navigation**
   - Tap between Map, Wallet, and History tabs
   - All navigation should work smoothly

2. **Map Interaction**
   - Zoom in/out on the map
   - Tap the 4 demo markers
   - See service details in callout
   - Your location should appear (blue dot)

3. **Wallet Features**
   - Tap "Send" - opens send token modal
   - Tap "Receive" - shows QR code with wallet address
   - Tap "Transactions" - shows transaction history
   - Try copying wallet address

4. **Try Booking** (Will fail, but tests the flow)
   - Tap a marker on the map
   - Tap the marker callout again to open booking
   - Select dates and times
   - See total amount calculation
   - Tap "Confirm Booking"
   - **Expected**: Error (because demo service IDs don't exist in backend)

#### ❌ What Won't Work Yet:

1. **Real Booking**
   - Booking uses demo service IDs
   - Backend doesn't have these IDs
   - You'll get an error when trying to book

2. **Real Map Data**
   - Only shows 4 demo locations
   - Real services from backend won't appear until endpoint is added

### 📱 Expected User Experience

**First Launch:**
```
1. Scan QR code
2. App opens to Login screen
3. Tap "Sign Up"
4. Fill in details
5. Tap "Sign Up" button
6. Automatically logged in
7. Map screen loads
8. Alert: "Demo Mode" appears ← THIS IS NORMAL!
9. Tap "OK"
10. See map with 4 markers (2 red P, 2 teal C)
11. Grant location permission if asked
12. Your blue dot appears on map
13. Tap markers to see details
```

**What the Map Should Look Like:**
```
San Francisco Area
     ┌────────────────────────────┐
     │    🗺️ Map View             │
     │                            │
     │    🔵 (Your location)      │
     │                            │
     │    🅿️ Red P (Market St)     │
     │    🔌 Teal C (Mission St)   │
     │    🅿️ Red P (Howard St)     │
     │    🔌 Teal C (Folsom St)    │
     │                            │
     │  Legend:                   │
     │  🅿️ Parking  🔌 Charging    │
     └────────────────────────────┘
```

### 🎨 UI Elements to Verify

**Map Screen (Top Navigation):**
- Title: "Map"
- Right side: "Logout" button

**Map Screen (On Map):**
- Legend box (top right)
- Refresh button (bottom right)
- 4 colored markers
- Your location (blue dot)

**Bottom Tab Bar:**
- 🗺️ Map (blue when active)
- 💰 Wallet
- 📅 History

### 🔄 How to Refresh

If you want to test the demo data loading again:
1. Tap the **Refresh** button (bottom right of map)
2. Alert will appear again confirming demo mode
3. Markers reload

### 📝 Checking Console Logs

If you're curious about what's happening behind the scenes:

In your terminal where `npx expo start` is running, you should see:
```
LOG  No services from backend, using demo data
LOG  Backend error, using demo data
```

This confirms the app is working as expected!

### ✅ Success Criteria

Your app is working correctly if you see:

- ✅ Login/Signup screens load
- ✅ Can create account and login
- ✅ Map loads with 4 demo markers
- ✅ "Demo Mode" alert appears once
- ✅ Can tap markers and see details
- ✅ Bottom tabs navigate properly
- ✅ Wallet shows balance and buttons
- ✅ History shows empty state

### 🚀 Next Steps

#### For Backend Developer:

Add the missing endpoint by following [BACKEND_REQUIREMENTS.md](BACKEND_REQUIREMENTS.md)

#### For Testing:

1. Test all navigation flows
2. Test UI/UX interactions
3. Verify all screens render correctly
4. Check that all modals open/close properly
5. Verify logout works

### 🆘 Troubleshooting

**Problem**: Map doesn't show any markers

**Solution**:
- Check that you tapped "OK" on the demo mode alert
- Try tapping the Refresh button
- Check console logs for errors

**Problem**: "Network Error" or can't login

**Solution**:
- Check that backend is running
- Verify API URL in `src/config/api.js`
- Check internet connection

**Problem**: No demo mode alert appears

**Solution**:
- This might mean the backend has the endpoint!
- Check if you see real data markers
- Look at console logs

### 📊 Demo Data Specifications

The 4 demo services are:

| Type | Address | Lat/Lng | Rate |
|------|---------|---------|------|
| Parking | 123 Market St | 37.7749, -122.4194 | $15/hr |
| Charger | 456 Mission St | 37.7849, -122.4094 | $20/hr |
| Parking | 789 Howard St | 37.7649, -122.4294 | $12/hr |
| Charger | 321 Folsom St | 37.7799, -122.4144 | $18/hr |

All locations are in San Francisco, CA.

---

## Summary

🎉 **Your app is working perfectly!** The "Demo Mode" alert is expected and normal.

The app demonstrates all UI/UX features using demo data until the backend GET /services endpoint is implemented.

**Enjoy testing the app!** 🚀
