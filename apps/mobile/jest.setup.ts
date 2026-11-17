/**
 * Native modules mocked for every test (runs after Jest is set up, so `beforeEach` is available).
 * Call history is cleared between tests by `clearMocks` in package.json.
 */

// In-memory secure storage, emptied before each test.
const mockSecureStore = new Map<string, string>();
beforeEach(() => mockSecureStore.clear());

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => mockSecureStore.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockSecureStore.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockSecureStore.delete(key);
  }),
}));

// Safe-area insets without a native provider (the library's own Jest mock).
jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);

// The user cancels the camera / library unless a test says otherwise.
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted', canAskAgain: true })),
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted', canAskAgain: true })),
  launchCameraAsync: jest.fn(async () => ({ canceled: true, assets: null })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: null })),
}));

// Permission granted by default; tests change `getPermissionsAsync` / `requestPermissionsAsync` per case.
jest.mock('expo-notifications', () => ({
  AndroidImportance: { HIGH: 4 },
  DEFAULT_ACTION_IDENTIFIER: 'expo.modules.notifications.actions.DEFAULT',
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => null),
  getPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted', canAskAgain: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted', canAskAgain: true })),
  scheduleNotificationAsync: jest.fn(async () => 'notification-id'),
  getLastNotificationResponse: jest.fn(() => null),
  clearLastNotificationResponse: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => undefined),
  dismissAllNotificationsAsync: jest.fn(async () => undefined),
}));

/**
 * Screens rendered on their own (no navigator): `router` calls are recorded, route params come from
 * `useLocalSearchParams.mockReturnValue(...)`, `useNavigation` is a stub, and focus effects run once on mount.
 * Tests that need real navigation call `jest.unmock('expo-router')` and use `expo-router/testing-library`.
 */
jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');
  return {
    ...jest.requireActual('expo-router'),
    router: {
      navigate: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      dismissTo: jest.fn(),
      canGoBack: jest.fn(() => true),
    },
    useLocalSearchParams: jest.fn(() => ({})),
    // A screen opened on its own: not inside a stack, so no back button.
    useNavigation: () => ({ getState: () => undefined, goBack: jest.fn(), setOptions: jest.fn() }),
    useFocusEffect: (effect: () => void | (() => void)) => useEffect(() => effect(), [effect]),
  };
});
