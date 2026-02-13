declare module "expo-location" {
  export enum PermissionStatus {
    GRANTED = "granted",
    DENIED = "denied",
    UNDETERMINED = "undetermined",
  }

  export interface LocationPermissionResponse {
    status: PermissionStatus;
    granted: boolean;
  }

  export interface LocationObject {
    coords: {
      latitude: number;
      longitude: number;
      altitude: number | null;
      accuracy: number | null;
      altitudeAccuracy: number | null;
      heading: number | null;
      speed: number | null;
    };
    timestamp: number;
  }

  export enum Accuracy {
    Lowest = 1,
    Low = 2,
    Balanced = 3,
    High = 4,
    Highest = 5,
    BestForNavigation = 6,
  }

  export function requestForegroundPermissionsAsync(): Promise<LocationPermissionResponse>;
  export function getCurrentPositionAsync(options?: { accuracy?: Accuracy }): Promise<LocationObject>;
}

declare module "expo-sensors" {
  export interface ThreeAxisMeasurement {
    x: number;
    y: number;
    z: number;
  }

  export interface Subscription {
    remove(): void;
  }

  export const Magnetometer: {
    isAvailableAsync(): Promise<boolean>;
    setUpdateInterval(intervalMs: number): void;
    addListener(
      listener: (data: ThreeAxisMeasurement) => void
    ): Subscription;
  };
}

declare module "expo-haptics" {
  export enum ImpactFeedbackStyle {
    Light = "light",
    Medium = "medium",
    Heavy = "heavy",
  }

  export enum NotificationFeedbackType {
    Success = "success",
    Warning = "warning",
    Error = "error",
  }

  export function impactAsync(style?: ImpactFeedbackStyle): Promise<void>;
  export function notificationAsync(type?: NotificationFeedbackType): Promise<void>;
  export function selectionAsync(): Promise<void>;
}
