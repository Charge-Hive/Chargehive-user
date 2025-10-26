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

      if (response.success) {
        const { user: userData, access_token: accessToken } = response.data;

        // Save to state
        setUser(userData);
        setAuthToken(accessToken);

        // Save to storage
        await AsyncStorage.setItem("authToken", accessToken);
        await AsyncStorage.setItem("userData", JSON.stringify(userData));

        logAuth.loginSuccess(email, userData.userId);
        return { success: true };
      }

      logAuth.loginFailure(email, "Login failed");
      return { success: false, message: "Login failed" };
    } catch (error) {
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

      if (response.success) {
        const { user: userData, accessToken } = response.data;

        // Save to state
        setUser(userData);
        setAuthToken(accessToken);

        // Save to storage
        await AsyncStorage.setItem("authToken", accessToken);
        await AsyncStorage.setItem("userData", JSON.stringify(userData));

        logAuth.signupSuccess(email, userData.userId);
        return { success: true };
      }

      logAuth.signupFailure(email, "Registration failed");
      return { success: false, message: "Registration failed" };
    } catch (error) {
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
