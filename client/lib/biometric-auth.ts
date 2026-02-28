/**
 * Biometric Authentication Module
 *
 * Provides biometric authentication (Face ID, Touch ID, Fingerprint)
 * for securing access to the Qamar app.
 *
 * Supports:
 * - iOS: Face ID, Touch ID
 * - Android: Fingerprint, Face Recognition
 * - Graceful fallback to device passcode
 */

import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";

/**
 * Check if biometric authentication hardware is available and enrolled
 * @returns Promise<boolean> - true if biometric can be used
 */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      return false;
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return isEnrolled;
  } catch (error) {
    console.error("[BiometricAuth] Error checking availability:", error);
    return false;
  }
}

/**
 * Authenticate user with biometric (Face ID, Touch ID, Fingerprint)
 * Falls back to device passcode if biometric fails
 *
 * @param promptMessage - Custom message to show in auth prompt
 * @returns Promise<boolean> - true if authentication successful
 */
export async function authenticateWithBiometric(
  promptMessage: string = "Authenticate to access Qamar",
): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: "Use passcode",
      disableDeviceFallback: false, // Allow PIN/passcode fallback
      cancelLabel: "Cancel",
    });

    return result.success;
  } catch (error) {
    console.error("[BiometricAuth] Authentication failed:", error);
    return false;
  }
}

/**
 * Get a user-friendly name for the available biometric type
 * @returns Promise<string> - Name of biometric type (e.g., "Face ID", "Fingerprint")
 */
export async function getBiometricType(): Promise<string> {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    if (
      types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
    ) {
      return Platform.OS === "ios" ? "Face ID" : "Face Recognition";
    }

    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return Platform.OS === "ios" ? "Touch ID" : "Fingerprint";
    }

    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return "Iris Recognition";
    }

    return "Biometric Authentication";
  } catch (error) {
    console.error("[BiometricAuth] Error getting biometric type:", error);
    return "Biometric Authentication";
  }
}

/**
 * Get security level of available authentication
 * @returns Promise<number> - Security level (1 = weak, 2 = strong, 3 = very strong)
 */
export async function getSecurityLevel(): Promise<number> {
  try {
    const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();

    // Higher security level = better
    // 1 = Secret (PIN, pattern)
    // 2 = Biometric (weak, e.g., some face recognition)
    // 3 = Biometric (strong, e.g., Face ID, Touch ID)
    return securityLevel;
  } catch (error) {
    console.error("[BiometricAuth] Error getting security level:", error);
    return 1; // Assume weak security on error
  }
}

/**
 * Check if device supports biometric authentication at all
 * (hardware present, regardless of enrollment)
 * @returns Promise<boolean>
 */
export async function hasBiometricHardware(): Promise<boolean> {
  try {
    return await LocalAuthentication.hasHardwareAsync();
  } catch (error) {
    console.error("[BiometricAuth] Error checking hardware:", error);
    return false;
  }
}

/**
 * Check if user has enrolled biometric credentials
 * @returns Promise<boolean>
 */
export async function isEnrolled(): Promise<boolean> {
  try {
    return await LocalAuthentication.isEnrolledAsync();
  } catch (error) {
    console.error("[BiometricAuth] Error checking enrollment:", error);
    return false;
  }
}
