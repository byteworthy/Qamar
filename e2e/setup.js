/**
 * E2E Test Setup
 * Configures Detox for end-to-end testing
 */

beforeAll(async () => {
  await device.launchApp({
    newInstance: true,
    permissions: {
      notifications: "YES",
    },
  });
});

beforeEach(async () => {
  await device.reloadReactNative();
});

afterAll(async () => {
  await device.terminateApp();
});
