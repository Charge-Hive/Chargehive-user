import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI } from "../services/api";
import { logAuth } from "../utils/analytics";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  // Load user data from storage on app start
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const userData = await AsyncStorage.getItem("userData");

      if (token && userData) {
        setAuthToken(token);
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      // Error loading user data - silent fail, user will see login screen
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    logAuth.loginAttempt(email);

    try {
      const response = await authAPI.login(email, password);
      console.log('🔐 Login response:', JSON.stringify(response, null, 2));

      if (response.success) {
        // Backend returns access_token with underscore, not accessToken
        const { user: userData, access_token: accessToken } = response.data;

        console.log('✅ Login successful, saving token...');
        console.log('📝 Token:', accessToken);
        console.log('👤 User data:', userData);

        // Save to storage first
        await AsyncStorage.setItem("authToken", accessToken);
        await AsyncStorage.setItem("userData", JSON.stringify(userData));

        console.log('💾 Token saved to AsyncStorage');

        // Verify it was saved
        const savedToken = await AsyncStorage.getItem("authToken");
        console.log('✔️ Verified saved token:', savedToken ? 'YES' : 'NO');

        // Then update state
        setUser(userData);
        setAuthToken(accessToken);

        logAuth.loginSuccess(email, userData.id);
        return { success: true };
      }

      logAuth.loginFailure(email, "Login failed");
      return { success: false, message: "Login failed" };
    } catch (error) {
      console.error('❌ Login error:', error);
      logAuth.loginFailure(email, error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Login failed. Please try again.",
      };
    }
  };

  const register = async (email, password, name, phone) => {
    logAuth.signupAttempt(email, name);

    try {
      const response = await authAPI.register(email, password, name, phone);
      console.log('📝 Register response:', JSON.stringify(response, null, 2));

      if (response.success) {
        // Backend returns access_token with underscore, not accessToken
        const { user: userData, access_token: accessToken } = response.data;

        console.log('✅ Registration successful, saving token...');
        console.log('📝 Token:', accessToken);
        console.log('👤 User data:', userData);

        // Save to storage first
        await AsyncStorage.setItem("authToken", accessToken);
        await AsyncStorage.setItem("userData", JSON.stringify(userData));

        console.log('💾 Token saved to AsyncStorage');

        // Verify it was saved
        const savedToken = await AsyncStorage.getItem("authToken");
        console.log('✔️ Verified saved token:', savedToken ? 'YES' : 'NO');

        // Then update state
        setUser(userData);
        setAuthToken(accessToken);

        logAuth.signupSuccess(email, userData.id);
        return { success: true };
      }

      logAuth.signupFailure(email, "Registration failed");
      return { success: false, message: "Registration failed" };
    } catch (error) {
      console.error('❌ Registration error:', error);
      logAuth.signupFailure(email, error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    }
  };

  const logout = async () => {
    const userEmail = user?.email;

    try {
      // Clear state
      setUser(null);
      setAuthToken(null);

      // Clear storage
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userData");

      logAuth.logout(userEmail);
    } catch (error) {
      // Error during logout - continue anyway
    }
  };

  const value = {
    user,
    authToken,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
