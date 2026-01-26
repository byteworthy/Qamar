import { registerRootComponent } from "expo";
import * as Sentry from "@sentry/react-native";

import App from "@/App";

// Initialize Sentry for error tracking
if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    environment:
      process.env.EXPO_PUBLIC_VALIDATION_MODE === "true"
        ? "development"
        : "production",
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 10000,
    tracesSampleRate: 0.2,
    // Scrub PII from breadcrumbs
    beforeBreadcrumb(breadcrumb) {
      // Remove sensitive data from breadcrumbs
      if (breadcrumb.data) {
        const sensitiveFields = [
          "thought",
          "reframe",
          "intention",
          "belief",
          "content",
        ];
        for (const field of sensitiveFields) {
          if (breadcrumb.data[field]) {
            breadcrumb.data[field] = "[REDACTED]";
          }
        }
      }
      return breadcrumb;
    },
  });
  console.log("[Sentry] Mobile initialized");
} else {
  console.log("[Sentry] Mobile disabled - EXPO_PUBLIC_SENTRY_DSN not set");
}

// Wrap App with Sentry
const SentryWrappedApp = Sentry.wrap(App);

registerRootComponent(SentryWrappedApp);
