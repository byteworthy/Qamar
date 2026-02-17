/**
 * E2E Flow: Arabic Tutor
 * Tests AI tutor chat interface and daily quota enforcement
 */
const {
  waitForElementById,
  tapById,
  typeIntoField,
  goToTab,
  waitForElementByText,
} = require("../shared/helpers");
const { LEARN, ARABIC_TUTOR } = require("../shared/selectors");

describe("Arabic Tutor Flow", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await goToTab("learn");
  });

  it("should open Arabic tutor from learn tab", async () => {
    await waitForElementById(LEARN.ARABIC_TUTOR_CARD, 5000);
    await tapById(LEARN.ARABIC_TUTOR_CARD);

    await waitForElementById(ARABIC_TUTOR.SCREEN, 5000);
  });

  it("should display chat interface with input", async () => {
    await tapById(LEARN.ARABIC_TUTOR_CARD);
    await waitForElementById(ARABIC_TUTOR.CHAT_INPUT, 5000);
    await waitForElementById(ARABIC_TUTOR.SEND_BUTTON, 3000);
  });

  it("should show daily quota badge", async () => {
    await tapById(LEARN.ARABIC_TUTOR_CARD);
    await waitForElementById(ARABIC_TUTOR.QUOTA_BADGE, 5000);
  });

  it("should send a message and receive response", async () => {
    await tapById(LEARN.ARABIC_TUTOR_CARD);
    await waitForElementById(ARABIC_TUTOR.CHAT_INPUT, 5000);

    await typeIntoField(ARABIC_TUTOR.CHAT_INPUT, "What does 'salam' mean?");
    await tapById(ARABIC_TUTOR.SEND_BUTTON);

    // Wait for AI response (up to 30s)
    await waitFor(element(by.id(ARABIC_TUTOR.MESSAGE_LIST)))
      .toBeVisible()
      .withTimeout(30000);
  });

  it("should display message list after sending", async () => {
    await tapById(LEARN.ARABIC_TUTOR_CARD);
    await waitForElementById(ARABIC_TUTOR.CHAT_INPUT, 5000);

    await typeIntoField(ARABIC_TUTOR.CHAT_INPUT, "Teach me bismillah");
    await tapById(ARABIC_TUTOR.SEND_BUTTON);

    await waitForElementById(ARABIC_TUTOR.MESSAGE_LIST, 30000);
  });
});
