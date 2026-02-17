/**
 * E2E Test Helpers
 * Shared utilities for Detox test flows
 */

/**
 * Wait for an element by testID and assert it's visible
 * @param {string} testID
 * @param {number} timeout - ms, default 5000
 */
async function waitForElementById(testID, timeout = 5000) {
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(timeout);
}

/**
 * Wait for an element by text and assert it's visible
 * @param {string} text
 * @param {number} timeout - ms, default 5000
 */
async function waitForElementByText(text, timeout = 5000) {
  await waitFor(element(by.text(text)))
    .toBeVisible()
    .withTimeout(timeout);
}

/**
 * Tap an element by testID
 * @param {string} testID
 */
async function tapById(testID) {
  await element(by.id(testID)).tap();
}

/**
 * Tap an element by text
 * @param {string} text
 */
async function tapByText(text) {
  await element(by.text(text)).tap();
}

/**
 * Type text into an input by testID
 * @param {string} testID
 * @param {string} text
 */
async function typeIntoField(testID, text) {
  await element(by.id(testID)).tap();
  await element(by.id(testID)).typeText(text);
}

/**
 * Clear and type text into an input by testID
 * @param {string} testID
 * @param {string} text
 */
async function clearAndType(testID, text) {
  await element(by.id(testID)).tap();
  await element(by.id(testID)).clearText();
  await element(by.id(testID)).typeText(text);
}

/**
 * Scroll down to find an element
 * @param {string} scrollViewId
 * @param {string} elementId
 * @param {number} pixels - pixels to scroll each attempt
 */
async function scrollToElement(scrollViewId, elementId, pixels = 200) {
  await waitFor(element(by.id(elementId)))
    .toBeVisible()
    .whileElement(by.id(scrollViewId))
    .scroll(pixels, "down");
}

/**
 * Navigate to the home tab
 */
async function goToHomeTab() {
  await element(by.id("tab-home")).tap();
  await waitForElementByText("Begin Reflection");
}

/**
 * Navigate to a specific tab
 * @param {'home'|'history'|'learn'|'worship'|'settings'} tab
 */
async function goToTab(tab) {
  await element(by.id(`tab-${tab}`)).tap();
}

/**
 * Launch app fresh
 */
async function launchFresh() {
  await device.launchApp({ newInstance: true });
}

/**
 * Reload React Native (faster than full relaunch)
 */
async function reload() {
  await device.reloadReactNative();
}

/**
 * Take a screenshot with a descriptive name
 * @param {string} name
 */
async function screenshot(name) {
  await device.takeScreenshot(name);
}

/**
 * Try an action, return true if it succeeded, false otherwise
 * Useful for optional elements that may not be present (e.g., empty states)
 * @param {Function} action
 */
async function tryAction(action) {
  try {
    await action();
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  waitForElementById,
  waitForElementByText,
  tapById,
  tapByText,
  typeIntoField,
  clearAndType,
  scrollToElement,
  goToHomeTab,
  goToTab,
  launchFresh,
  reload,
  screenshot,
  tryAction,
};
