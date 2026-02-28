/**
 * useBiometricAuth Hook
 *
 * Manages biometric authentication state for the app.
 * Handles app lifecycle and re-authentication when app returns from background.
 */

import { useState, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import {
  authenticateWithBiometric,
  isBiometricAvailable,
  getBiometricType,
} from "../lib/biometric-auth";
import { secureStorage } from "../lib/secure-storage";

const BIOMETRIC_ENABLED_KEY = "biometric_auth_enabled";
const AUTH_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export function useBiometricAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>("");
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const lastAuthTime = useRef<number>(Date.now());
  const appState = useRef<AppStateStatus>(AppState.currentState);

  // Check biometric availability on mount
  useEffect(() => {
    async function checkBiometric() {
      const available = await isBiometricAvailable();
      setBiometricAvailable(available);

      if (available) {
        const type = await getBiometricType();
        setBiometricType(type);
      }

      // Check if user has enabled biometric auth
      const enabled = await secureStorage.getItem(BIOMETRIC_ENABLED_KEY);
      setBiometricEnabled(enabled === "true");
    }

    checkBiometric();
  }, []);

  // Perform authentication
  const authenticate = async (): Promise<boolean> => {
    if (!biometricEnabled || !biometricAvailable) {
      // If biometric not enabled/available, allow access
      setIsAuthenticated(true);
      lastAuthTime.current = Date.now();
      return true;
    }

    setIsAuthenticating(true);
    try {
      const result = await authenticateWithBiometric(
        `Unlock Qamar with ${biometricType}`,
      );

      if (result) {
        setIsAuthenticated(true);
        lastAuthTime.current = Date.now();
      }

      return result;
    } catch (error) {
      console.error("[useBiometricAuth] Authentication error:", error);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        // App is coming to foreground
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          // Check if we need to re-authenticate
          const timeSinceAuth = Date.now() - lastAuthTime.current;

          if (biometricEnabled && timeSinceAuth > AUTH_TIMEOUT_MS) {
            // Require re-authentication after timeout
            setIsAuthenticated(false);
            await authenticate();
          }
        }

        // App is going to background
        if (
          appState.current === "active" &&
          nextAppState.match(/inactive|background/)
        ) {
          // Lock app when backgrounded (if biometric enabled)
          if (biometricEnabled) {
            setIsAuthenticated(false);
          }
        }

        appState.current = nextAppState;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [biometricEnabled]);

  // Enable/disable biometric authentication
  const toggleBiometric = async (enabled: boolean) => {
    await secureStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled.toString());
    setBiometricEnabled(enabled);

    if (enabled) {
      // Test authentication when enabling
      await authenticate();
    } else {
      // Allow access if disabling
      setIsAuthenticated(true);
    }
  };

  return {
    isAuthenticated,
    biometricAvailable,
    biometricType,
    biometricEnabled,
    isAuthenticating,
    authenticate,
    toggleBiometric,
  };
}
