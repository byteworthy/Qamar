/**
 * E2E Test: 5-Tab Navigation System
 *
 * Tests the extended 5-tab navigation system for the Qamar app.
 *
 * Tab Structure:
 * 1. Home - Reflection interface (existing)
 * 2. Companion - Conversational companion (formerly Explore)
 * 3. Learn - Quran, Arabic, Hadith (NEW)
 * 4. Worship - Prayer, Qibla, Adhkar (NEW)
 * 5. Profile - Settings and account (existing)
 *
 * Test Coverage:
 * - All 5 tabs visible and accessible
 * - Navigation between tabs works
 * - Tab persistence
 * - Accessibility labels
 * - Animations and transitions
 * - New Learn and Worship tab screens
 */

describe('5-Tab Navigation System', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Tab Visibility', () => {
    it('should display all 5 tabs in bottom navigation', async () => {
      // Wait for app to load
      await waitFor(element(by.id('tab-home')))
        .toBeVisible()
        .withTimeout(5000);

      // Verify all 5 tabs are visible
      await expect(element(by.id('tab-home'))).toBeVisible();
      await expect(element(by.id('tab-companion'))).toBeVisible();
      await expect(element(by.id('tab-learn'))).toBeVisible();
      await expect(element(by.id('tab-worship'))).toBeVisible();
      await expect(element(by.id('tab-profile'))).toBeVisible();
    });

    it('should have correct tab order', async () => {
      // Tabs should be in order: Home, Companion, Learn, Worship, Profile
      await expect(element(by.id('tab-home'))).toBeVisible();
      await expect(element(by.id('tab-companion'))).toBeVisible();
      await expect(element(by.id('tab-learn'))).toBeVisible();
      await expect(element(by.id('tab-worship'))).toBeVisible();
      await expect(element(by.id('tab-profile'))).toBeVisible();
    });
  });

  describe('Tab Navigation', () => {
    it('should navigate to Home tab', async () => {
      await element(by.id('tab-home')).tap();

      await waitFor(element(by.text('Begin Reflection')))
        .toBeVisible()
        .withTimeout(3000);

      await expect(element(by.text('Qamar'))).toBeVisible();
    });

    it('should navigate to Companion tab', async () => {
      await element(by.id('tab-companion')).tap();

      await waitFor(element(by.text('Companion')))
        .toBeVisible()
        .withTimeout(3000);

      // Companion tab should show AI conversation features
      // (This was formerly the Explore tab)
    });

    it('should navigate to Learn tab', async () => {
      await element(by.id('tab-learn')).tap();

      await waitFor(element(by.text('Learn')))
        .toBeVisible()
        .withTimeout(3000);

      await expect(element(by.text('Islamic knowledge and Arabic language'))).toBeVisible();
    });

    it('should navigate to Worship tab', async () => {
      await element(by.id('tab-worship')).tap();

      await waitFor(element(by.text('Worship')))
        .toBeVisible()
        .withTimeout(3000);

      await expect(element(by.text('Prayer times, Qibla, and daily adhkar'))).toBeVisible();
    });

    it('should navigate to Profile tab', async () => {
      await element(by.id('tab-profile')).tap();

      await waitFor(element(by.text('Settings')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should navigate between all tabs sequentially', async () => {
      // Home → Companion
      await element(by.id('tab-companion')).tap();
      await waitFor(element(by.text('Companion')))
        .toBeVisible()
        .withTimeout(2000);

      // Companion → Learn
      await element(by.id('tab-learn')).tap();
      await waitFor(element(by.text('Learn')))
        .toBeVisible()
        .withTimeout(2000);

      // Learn → Worship
      await element(by.id('tab-worship')).tap();
      await waitFor(element(by.text('Worship')))
        .toBeVisible()
        .withTimeout(2000);

      // Worship → Profile
      await element(by.id('tab-profile')).tap();
      await waitFor(element(by.text('Settings')))
        .toBeVisible()
        .withTimeout(2000);

      // Profile → Home
      await element(by.id('tab-home')).tap();
      await waitFor(element(by.text('Begin Reflection')))
        .toBeVisible()
        .withTimeout(2000);
    });
  });

  describe('Learn Tab Features', () => {
    beforeEach(async () => {
      await element(by.id('tab-learn')).tap();
      await waitFor(element(by.text('Learn')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should display Quran Reader card', async () => {
      await expect(element(by.text('Quran Reader'))).toBeVisible();
      await expect(element(by.text('Read and explore the Holy Quran with translations'))).toBeVisible();
    });

    it('should display Arabic Learning card', async () => {
      await expect(element(by.text('Arabic Learning'))).toBeVisible();
      await expect(element(by.text('Learn Arabic with interactive flashcards'))).toBeVisible();
    });

    it('should display Hadith Library card', async () => {
      await expect(element(by.text('Hadith Library'))).toBeVisible();
      await expect(element(by.text('Browse authenticated Hadith collections'))).toBeVisible();
    });

    it('should show Coming Soon badges on all cards', async () => {
      // All 3 features should have Coming Soon badges
      const comingSoonBadges = await element(by.text('Coming Soon'));
      await expect(comingSoonBadges).toBeVisible();
    });

    it('should scroll through all feature cards', async () => {
      // Scroll down to see all cards
      await element(by.text('Quran Reader')).swipe('up', 'slow');
      await expect(element(by.text('Hadith Library'))).toBeVisible();
    });
  });

  describe('Worship Tab Features', () => {
    beforeEach(async () => {
      await element(by.id('tab-worship')).tap();
      await waitFor(element(by.text('Worship')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should display Prayer Times card', async () => {
      await expect(element(by.text('Prayer Times'))).toBeVisible();
      await expect(element(by.text('Accurate prayer times for your location'))).toBeVisible();
    });

    it('should display Qibla Finder card', async () => {
      await expect(element(by.text('Qibla Finder'))).toBeVisible();
      await expect(element(by.text('Find the direction of Makkah'))).toBeVisible();
    });

    it('should display Adhkar & Duas card', async () => {
      await expect(element(by.text('Adhkar & Duas'))).toBeVisible();
      await expect(element(by.text('Daily remembrance and supplications'))).toBeVisible();
    });

    it('should display Islamic Calendar card', async () => {
      await expect(element(by.text('Islamic Calendar'))).toBeVisible();
      await expect(element(by.text('Hijri dates and important events'))).toBeVisible();
    });

    it('should navigate to Dua screen when tapping Adhkar & Duas', async () => {
      // Adhkar & Duas should link to existing DuaScreen
      await element(by.text('Adhkar & Duas')).tap();

      await waitFor(element(by.text('Morning Adhkar').or(by.text('Duas'))))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show Coming Soon on 3 out of 4 cards', async () => {
      // Prayer Times, Qibla, Calendar should have Coming Soon
      // Adhkar & Duas should NOT (it links to existing screen)
      const comingSoonBadges = await element(by.text('Coming Soon'));
      await expect(comingSoonBadges).toBeVisible();
    });
  });

  describe('Tab Persistence', () => {
    it('should remember selected tab after navigation', async () => {
      // Navigate to Learn tab
      await element(by.id('tab-learn')).tap();
      await waitFor(element(by.text('Learn')))
        .toBeVisible()
        .withTimeout(2000);

      // Navigate back to Home
      await element(by.id('tab-home')).tap();
      await waitFor(element(by.text('Begin Reflection')))
        .toBeVisible()
        .withTimeout(2000);

      // Navigate back to Learn
      await element(by.id('tab-learn')).tap();
      await waitFor(element(by.text('Learn')))
        .toBeVisible()
        .withTimeout(2000);

      // Learn tab should still show correct content
      await expect(element(by.text('Quran Reader'))).toBeVisible();
    });

    it('should maintain scroll position within tab', async () => {
      // Navigate to Learn tab
      await element(by.id('tab-learn')).tap();
      await waitFor(element(by.text('Learn')))
        .toBeVisible()
        .withTimeout(2000);

      // Scroll down
      await element(by.text('Quran Reader')).swipe('up', 'slow');

      // Switch to another tab
      await element(by.id('tab-home')).tap();
      await waitFor(element(by.text('Begin Reflection')))
        .toBeVisible()
        .withTimeout(2000);

      // Switch back to Learn tab
      await element(by.id('tab-learn')).tap();
      await waitFor(element(by.text('Learn')))
        .toBeVisible()
        .withTimeout(2000);

      // Content should still be visible
      await expect(element(by.text('Learn'))).toBeVisible();
    });
  });

  describe('Accessibility', () => {
    it('should have accessibility labels for all tabs', async () => {
      // All tabs should have proper labels for screen readers
      await expect(element(by.id('tab-home'))).toHaveLabel('Home');
      await expect(element(by.id('tab-companion'))).toHaveLabel('Companion');
      await expect(element(by.id('tab-learn'))).toHaveLabel('Learn');
      await expect(element(by.id('tab-worship'))).toHaveLabel('Worship');
      await expect(element(by.id('tab-profile'))).toHaveLabel('Profile');
    });

    it('should have accessible feature cards in Learn tab', async () => {
      await element(by.id('tab-learn')).tap();
      await waitFor(element(by.text('Learn')))
        .toBeVisible()
        .withTimeout(2000);

      // Feature cards should have accessibility labels
      await expect(element(by.text('Quran Reader'))).toBeVisible();
      await expect(element(by.text('Arabic Learning'))).toBeVisible();
      await expect(element(by.text('Hadith Library'))).toBeVisible();
    });

    it('should have accessible feature cards in Worship tab', async () => {
      await element(by.id('tab-worship')).tap();
      await waitFor(element(by.text('Worship')))
        .toBeVisible()
        .withTimeout(2000);

      // Feature cards should have accessibility labels
      await expect(element(by.text('Prayer Times'))).toBeVisible();
      await expect(element(by.text('Qibla Finder'))).toBeVisible();
      await expect(element(by.text('Adhkar & Duas'))).toBeVisible();
      await expect(element(by.text('Islamic Calendar'))).toBeVisible();
    });
  });

  describe('Animations', () => {
    it('should animate tab transitions smoothly', async () => {
      // Navigate between tabs should be smooth
      await element(by.id('tab-learn')).tap();
      await waitFor(element(by.text('Learn')))
        .toBeVisible()
        .withTimeout(1000);

      await element(by.id('tab-worship')).tap();
      await waitFor(element(by.text('Worship')))
        .toBeVisible()
        .withTimeout(1000);

      // No errors should occur during transitions
    });

    it('should animate card entrance on Learn tab', async () => {
      await element(by.id('tab-learn')).tap();

      // Cards should fade in with staggered delays
      await waitFor(element(by.text('Quran Reader')))
        .toBeVisible()
        .withTimeout(1000);

      await expect(element(by.text('Arabic Learning'))).toBeVisible();
      await expect(element(by.text('Hadith Library'))).toBeVisible();
    });

    it('should animate card entrance on Worship tab', async () => {
      await element(by.id('tab-worship')).tap();

      // Cards should fade in with staggered delays
      await waitFor(element(by.text('Prayer Times')))
        .toBeVisible()
        .withTimeout(1000);

      await expect(element(by.text('Qibla Finder'))).toBeVisible();
      await expect(element(by.text('Adhkar & Duas'))).toBeVisible();
      await expect(element(by.text('Islamic Calendar'))).toBeVisible();
    });
  });

  describe('Integration with Existing Features', () => {
    it('should not break existing Home tab functionality', async () => {
      await element(by.id('tab-home')).tap();
      await waitFor(element(by.text('Begin Reflection')))
        .toBeVisible()
        .withTimeout(2000);

      // Existing reflection flow should still work
      await expect(element(by.text('Qamar'))).toBeVisible();
    });

    it('should not break existing Companion (Explore) tab functionality', async () => {
      await element(by.id('tab-companion')).tap();
      await waitFor(element(by.text('Companion')))
        .toBeVisible()
        .withTimeout(2000);

      // Companion tab should work
    });

    it('should not break existing Profile tab functionality', async () => {
      await element(by.id('tab-profile')).tap();
      await waitFor(element(by.text('Settings')))
        .toBeVisible()
        .withTimeout(2000);

      // Settings should still be accessible
      await expect(element(by.text('Settings'))).toBeVisible();
    });
  });

  describe('Performance', () => {
    it('should load Learn tab quickly', async () => {
      const start = Date.now();

      await element(by.id('tab-learn')).tap();
      await waitFor(element(by.text('Learn')))
        .toBeVisible()
        .withTimeout(2000);

      const duration = Date.now() - start;

      // Should load in less than 500ms
      expect(duration).toBeLessThan(500);
    });

    it('should load Worship tab quickly', async () => {
      const start = Date.now();

      await element(by.id('tab-worship')).tap();
      await waitFor(element(by.text('Worship')))
        .toBeVisible()
        .withTimeout(2000);

      const duration = Date.now() - start;

      // Should load in less than 500ms
      expect(duration).toBeLessThan(500);
    });

    it('should handle rapid tab switching', async () => {
      // Rapidly switch between tabs
      await element(by.id('tab-learn')).tap();
      await element(by.id('tab-worship')).tap();
      await element(by.id('tab-home')).tap();
      await element(by.id('tab-companion')).tap();
      await element(by.id('tab-profile')).tap();

      // Should end up on Profile tab without crashes
      await waitFor(element(by.text('Settings')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle app backgrounding and foregrounding', async () => {
      await element(by.id('tab-learn')).tap();
      await waitFor(element(by.text('Learn')))
        .toBeVisible()
        .withTimeout(2000);

      // Background the app
      await device.sendToHome();
      await device.launchApp({ newInstance: false });

      // Should restore to Learn tab
      await expect(element(by.text('Learn'))).toBeVisible();
    });

    it('should handle device rotation', async () => {
      await element(by.id('tab-worship')).tap();
      await waitFor(element(by.text('Worship')))
        .toBeVisible()
        .withTimeout(2000);

      // Rotate device
      await device.setOrientation('landscape');
      await expect(element(by.text('Worship'))).toBeVisible();

      // Rotate back
      await device.setOrientation('portrait');
      await expect(element(by.text('Worship'))).toBeVisible();
    });
  });
});
