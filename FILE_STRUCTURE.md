# ChargeHive User App - File Structure

## Complete File Tree

```
Chargehive-user/
│
├── 📱 Core App Files
│   ├── App.js                      # Root component with providers
│   ├── index.js                    # Entry point (Expo default)
│   ├── app.json                    # Expo configuration
│   └── package.json                # Dependencies and scripts
│
├── 📂 src/
│   │
│   ├── 📂 config/                  # Configuration files
│   │   └── api.js                  # API endpoints and base URL
│   │
│   ├── 📂 context/                 # React Context providers
│   │   └── AuthContext.js          # Authentication state management
│   │
│   ├── 📂 navigation/              # Navigation configuration
│   │   └── AppNavigator.js         # Stack and Tab navigation setup
│   │
│   ├── 📂 screens/                 # All UI screens
│   │   ├── LoginScreen.js          # User login page
│   │   ├── SignupScreen.js         # User registration page
│   │   ├── MapScreen.js            # Map with P/C markers (Home)
│   │   ├── BookingScreen.js        # Session booking modal
│   │   ├── WalletScreen.js         # Wallet with Send/Receive/Transactions
│   │   └── HistoryScreen.js        # Booking history list
│   │
│   ├── 📂 services/                # API integration layer
│   │   └── api.js                  # Axios instance and API calls
│   │
│   ├── 📂 components/              # Reusable components (empty, ready for use)
│   └── 📂 utils/                   # Utility functions (empty, ready for use)
│
├── 📂 assets/                      # Static assets (Expo default)
│   ├── icon.png
│   ├── splash-icon.png
│   ├── adaptive-icon.png
│   └── favicon.png
│
├── 📄 Documentation
│   ├── README.md                   # Complete documentation
│   ├── QUICK_START.md              # 3-minute getting started guide
│   ├── PROJECT_SUMMARY.md          # Implementation summary
│   ├── SETUP_CHECKLIST.md          # Step-by-step setup checklist
│   └── FILE_STRUCTURE.md           # This file
│
├── 📄 Configuration
│   ├── .gitignore                  # Git ignore rules
│   ├── .env.example                # Environment variables template
│   └── package-lock.json           # Locked dependencies
│
└── 📂 node_modules/                # Dependencies (not in git)
```

## File Descriptions

### 🎯 Core Application Files

#### `App.js`
- Root component of the application
- Wraps app with `AuthProvider` and `SafeAreaProvider`
- Imports and renders `AppNavigator`
- Entry point for React Native execution

#### `app.json`
- Expo configuration file
- Contains app name, version, icon paths
- Platform-specific settings (iOS, Android, Web)
- Permissions configuration
- Plugin configuration

#### `package.json`
- Project metadata
- Dependencies list
- Scripts for running the app
- Version information

### 📁 src/config/

#### `api.js`
- **Purpose**: Centralized API configuration
- **Exports**:
  - `API_CONFIG`: Base URL and timeout
  - `ENDPOINTS`: All API endpoint paths
- **Configuration**:
  - Default: Heroku dev endpoint
  - Can switch to local for development

### 📁 src/context/

#### `AuthContext.js`
- **Purpose**: Global authentication state
- **Provides**:
  - `user`: Current user object
  - `authToken`: JWT token
  - `isAuthenticated`: Boolean flag
  - `login()`: Login function
  - `register()`: Signup function
  - `logout()`: Logout function
- **Features**:
  - Persistent storage with AsyncStorage
  - Auto-load on app start
  - Token management

### 📁 src/navigation/

#### `AppNavigator.js`
- **Purpose**: Navigation structure
- **Stacks**:
  - **AuthStack**: Login, Signup (unauthenticated)
  - **MainTab**: Map, Wallet, History (authenticated)
  - **Modal**: Booking screen
- **Features**:
  - Conditional rendering based on auth state
  - Bottom tab navigation
  - Modal presentation for booking

### 📁 src/screens/

#### `LoginScreen.js`
- Email and password input
- Login button with loading state
- Link to signup screen
- Error handling and validation

#### `SignupScreen.js`
- Full name, email, phone, password inputs
- Password confirmation
- Form validation
- Auto-login after successful registration

#### `MapScreen.js` ⭐
- Interactive map with `react-native-maps`
- Custom P (parking) and C (charging) markers
- Different colors: Red for parking, Teal for charging
- Service callouts with details
- Location permission handling
- User location display
- Refresh functionality
- Click to book (requires login)

#### `BookingScreen.js`
- Date/time pickers for start and end
- Service information display
- Real-time total calculation
- Booking summary
- Validation (no past dates, end > start)
- API integration for booking

#### `WalletScreen.js`
- Token balance card
- **Send Modal**: Transfer tokens
- **Receive Modal**: QR code generation
- **Transactions Modal**: History list
- Copy address to clipboard
- Mock data (ready for blockchain)

#### `HistoryScreen.js`
- FlatList of all sessions
- Status badges (Upcoming, Active, Completed)
- Detailed session information
- Pull-to-refresh
- Empty state handling
- Session sorting by date

### 📁 src/services/

#### `api.js`
- **Purpose**: API communication layer
- **Features**:
  - Axios instance with interceptors
  - Auto-inject JWT token
  - Auto-logout on 401
  - Error handling
- **Exports**:
  - `authAPI`: register, login, getProfile
  - `sessionAPI`: bookSession, getUserSessions
  - `serviceAPI`: getAllServices

## File Relationships

```
App.js
  └── SafeAreaProvider
      └── AuthContext.Provider
          └── AppNavigator
              ├── AuthStack (if !authenticated)
              │   ├── LoginScreen
              │   └── SignupScreen
              └── MainStack (if authenticated)
                  ├── TabNavigator
                  │   ├── MapScreen
                  │   ├── WalletScreen
                  │   └── HistoryScreen
                  └── BookingScreen (modal)
```

## Data Flow

```
User Action
    ↓
Screen Component
    ↓
API Service (src/services/api.js)
    ↓
Axios with Interceptors
    ↓
Backend API
    ↓
Response
    ↓
Update State
    ↓
Re-render UI
```

## Authentication Flow

```
Login/Signup Screen
    ↓
AuthContext.login() / register()
    ↓
API Call (src/services/api.js)
    ↓
Receive JWT Token
    ↓
Store in AsyncStorage
    ↓
Update AuthContext State
    ↓
Navigate to MainStack
```

## Important Files to Modify

### For Backend URL Changes
- `src/config/api.js` → `API_CONFIG.BASE_URL`

### For Styling/Branding
- Each screen file has its own `StyleSheet`
- Colors, fonts can be centralized in `src/utils/theme.js` (create if needed)

### For Adding New Screens
1. Create screen in `src/screens/`
2. Import in `src/navigation/AppNavigator.js`
3. Add to appropriate stack/tab

### For Adding New API Endpoints
1. Add endpoint path in `src/config/api.js` → `ENDPOINTS`
2. Create API function in `src/services/api.js`
3. Call from screen component

## File Sizes (Approximate)

| File | Lines | Purpose |
|------|-------|---------|
| `App.js` | 16 | Root setup |
| `src/config/api.js` | 25 | Config |
| `src/context/AuthContext.js` | 120 | Auth state |
| `src/navigation/AppNavigator.js` | 100 | Navigation |
| `src/services/api.js` | 100 | API calls |
| `src/screens/LoginScreen.js` | 140 | Login UI |
| `src/screens/SignupScreen.js` | 160 | Signup UI |
| `src/screens/MapScreen.js` | 250 | Map with markers |
| `src/screens/BookingScreen.js` | 320 | Booking flow |
| `src/screens/WalletScreen.js` | 420 | Wallet features |
| `src/screens/HistoryScreen.js` | 280 | Session history |

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Full documentation with setup, features, troubleshooting |
| `QUICK_START.md` | 3-minute quick start guide |
| `PROJECT_SUMMARY.md` | Implementation summary and architecture |
| `SETUP_CHECKLIST.md` | Step-by-step setup verification |
| `FILE_STRUCTURE.md` | This file - complete file tree and descriptions |
| `.env.example` | Environment variables template |

## Next Steps for Development

### To Add New Features
1. Create new screen in `src/screens/`
2. Add route in `AppNavigator.js`
3. Create API calls in `src/services/api.js` if needed
4. Update documentation

### To Customize
1. Modify colors in each screen's StyleSheet
2. Consider creating `src/utils/theme.js` for global theme
3. Update app name/icon in `app.json`
4. Change splash screen color in `app.json`

### To Prepare for Production
1. Add Google Maps API key in `app.json`
2. Update bundle identifiers
3. Configure environment variables
4. Set up proper error tracking
5. Add analytics if needed

---

**Total Files**: 19 JavaScript files + 5 documentation files
**Total Lines of Code**: ~2,100+ lines
**Status**: ✅ Complete and ready for testing
