/**
 * Device Security Module
 *
 * Detects compromised devices (jailbroken/rooted) and other security risks.
 * Warns users about potential data exposure on insecure devices.
 */

import JailMonkey from "jail-monkey";
import { Alert, BackHandler, Platform } from "react-native";

export interface SecurityInfo {
  isJailBroken: boolean;
  canMockLocation: boolean; // Android only
  isOnExternalStorage: boolean; // Android only
  hookDetected: boolean;
}

/**
 * Check device security and show warning if compromised
 * @returns boolean - true if device is secure, false if compromised
 */
export function checkDeviceSecurity(): boolean {
  const isCompromised = JailMonkey.isJailBroken();

  if (isCompromised) {
    Alert.alert(
      "Security Warning",
      "Noor has detected that your device may be jailbroken or rooted.\n\n" +
        "For your privacy and security, Noor cannot guarantee the protection of your personal reflection entries on compromised devices, where other apps could potentially access your information.\n\n" +
        "We recommend using Noor on a non-jailbroken/rooted device.",
      [
        {
          text: "I Understand",
          style: "default",
        },
        {
          text: "Exit App",
          onPress: () => {
            if (Platform.OS === "android") {
              BackHandler.exitApp();
            }
            // iOS: Can't programmatically quit - user must manually close
          },
          style: "destructive",
        },
      ],
      { cancelable: false },
    );
    return false;
  }

  return true;
}

/**
 * Get detailed security information about the device
 * @returns SecurityInfo object with various security indicators
 */
export function getSecurityInfo(): SecurityInfo {
  return {
    isJailBroken: JailMonkey.isJailBroken(),
    canMockLocation:
      Platform.OS === "android" ? JailMonkey.canMockLocation() : false,
    isOnExternalStorage:
      Platform.OS === "android" ? JailMonkey.isOnExternalStorage() : false,
    hookDetected: JailMonkey.hookDetected(),
  };
}

/**
 * Check if device is compromised (without showing alert)
 * @returns boolean - true if device is jailbroken/rooted
 */
export function isDeviceCompromised(): boolean {
  return JailMonkey.isJailBroken();
}

/**
 * Check if app is running in debug mode
 * Note: Uses __DEV__ constant from React Native
 * @returns boolean - true if in development mode
 */
export function isDebuggable(): boolean {
  return __DEV__;
}

/**
 * Check if hooks/instrumentation detected (advanced)
 * This can detect Frida, Xposed, and other hooking frameworks
 * @returns boolean - true if hooks detected
 */
export function areHooksDetected(): boolean {
  return JailMonkey.hookDetected();
}

/**
 * Check if app is running on external storage (Android security risk)
 * @returns boolean - true if on external storage
 */
export function isOnExternalStorage(): boolean {
  if (Platform.OS === "android") {
    return JailMonkey.isOnExternalStorage();
  }
  return false;
}

/**
 * Get a user-friendly security status message
 * @returns string - Security status description
 */
export function getSecurityStatusMessage(): string {
  const info = getSecurityInfo();

  if (info.isJailBroken) {
    return "Device is jailbroken/rooted. Your data may be at risk.";
  }

  if (info.hookDetected) {
    return "Hooking framework detected. App behavior may be modified.";
  }

  if (info.isOnExternalStorage && Platform.OS === "android") {
    return "App is installed on external storage. This is less secure.";
  }

  if (info.canMockLocation && Platform.OS === "android") {
    return "Location mocking is enabled on this device.";
  }

  return "Device security looks good.";
}
