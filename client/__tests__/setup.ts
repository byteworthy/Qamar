/**
 * Test Setup for React Native Components
 *
 * This file runs before each test suite to set up the testing environment.
 */

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock React Native Reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Expo modules
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
}));

jest.mock("expo-linking", () => ({
  openURL: jest.fn(() => Promise.resolve()),
  createURL: jest.fn((path) => `exp://localhost/${path}`),
}));

jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {
      privacyPolicyUrl: "https://example.com/privacy",
      termsOfServiceUrl: "https://example.com/terms",
      supportEmail: "support@example.com",
    },
  },
}));

// Mock React Navigation
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useFocusEffect: jest.fn(),
  };
});

// Mock React Query
jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQuery: jest.fn(() => ({
    data: undefined,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}));

// Mock Safe Area Context
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
}));

// Mock react-native-iap
jest.mock("react-native-iap", () => ({
  initConnection: jest.fn(() => Promise.resolve(true)),
  endConnection: jest.fn(() => Promise.resolve()),
  getProducts: jest.fn(() => Promise.resolve([])),
  requestPurchase: jest.fn(() => Promise.resolve({ transactionId: "test" })),
  finishTransaction: jest.fn(() => Promise.resolve()),
  purchaseUpdatedListener: jest.fn(),
  purchaseErrorListener: jest.fn(),
}));

// Mock react-native-keyboard-controller
jest.mock("react-native-keyboard-controller", () => ({
  KeyboardAwareScrollView: require("react-native").ScrollView,
  KeyboardProvider: ({ children }: any) => children,
  KeyboardController: {
    setInputMode: jest.fn(),
    setDefaultMode: jest.fn(),
  },
}));

// Mock ReflectionProgressCompact component
jest.mock("@/components/ReflectionProgress", () => ({
  ReflectionProgressCompact: () => null,
}));

// Mock ExitConfirmationModal component
jest.mock("@/components/ExitConfirmationModal", () => ({
  ExitConfirmationModal: () => null,
}));

// Suppress console warnings during tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = jest.fn((...args) => {
    const message = args[0];
    // Allow warnings but suppress common React Native test warnings
    if (
      typeof message === "string" &&
      (message.includes("Animated:") ||
       message.includes("VirtualizedLists") ||
       message.includes("componentWillReceiveProps"))
    ) {
      return;
    }
    originalWarn(...args);
  });

  console.error = jest.fn((...args) => {
    const message = args[0];
    // Suppress common test errors
    if (
      typeof message === "string" &&
      (message.includes("Warning: ReactDOM.render") ||
       message.includes("Not implemented: HTMLFormElement"))
    ) {
      return;
    }
    originalError(...args);
  });
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

// Global test timeout
jest.setTimeout(10000);
