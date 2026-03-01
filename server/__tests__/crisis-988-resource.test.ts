/**
 * 988 Crisis Resource Verification Tests
 *
 * Verifies that the 988 Suicide & Crisis Lifeline is correctly
 * referenced across crisis detection, safety resources, and
 * user-facing content.
 */

import { describe, test, expect } from "@jest/globals";
import { CRISIS_RESOURCES } from "../ai-safety";
// Brand constants are in the client package which uses a different TS config.
// We read the file content directly to verify 988 presence.
import * as fs from "fs";
import * as path from "path";

const brandFileContent = fs.readFileSync(
  path.resolve(__dirname, "../../client/constants/brand.ts"),
  "utf-8",
);

// =============================================================================
// 988 PRESENCE IN CRISIS RESOURCES
// =============================================================================

describe("988 Crisis Resource Presence", () => {
  test("emergency resources include a 988 Lifeline entry", () => {
    const has988 = CRISIS_RESOURCES.emergency.resources.some(
      (r) => r.name.includes("988") && r.contact.includes("988"),
    );
    expect(has988).toBe(true);
  });

  test("urgent resources include a 988 Lifeline entry", () => {
    const has988 = CRISIS_RESOURCES.urgent.resources.some(
      (r) => r.name.includes("988") && r.contact.includes("988"),
    );
    expect(has988).toBe(true);
  });

  test("988 resource appears before other resources (highest priority)", () => {
    const emergencyFirst = CRISIS_RESOURCES.emergency.resources[0];
    expect(emergencyFirst.name).toContain("988");

    const urgentFirst = CRISIS_RESOURCES.urgent.resources[0];
    expect(urgentFirst.name).toContain("988");
  });

  test("988 contact text uses correct format for tel: linking", () => {
    const emergency988 = CRISIS_RESOURCES.emergency.resources.find((r) =>
      r.name.includes("988"),
    );
    expect(emergency988).toBeDefined();
    // Contact text must contain the raw digits "988" so the client
    // can extract them for a tel: link (tel:988)
    expect(emergency988!.contact).toMatch(/988/);
    // Should indicate both call and text options
    expect(emergency988!.contact.toLowerCase()).toContain("call");
  });
});

// =============================================================================
// 988 IN BRAND DISCLAIMER
// =============================================================================

describe("988 in Brand Disclaimer", () => {
  test("brand disclaimer references 988 Lifeline", () => {
    expect(brandFileContent).toContain("988");
    expect(brandFileContent).toMatch(/988\s*Lifeline/i);
  });
});

// =============================================================================
// 988 CONTACT FORMAT VALIDATION
// =============================================================================

describe("988 Contact Format", () => {
  test("988 number is a valid US dialing code (3 digits)", () => {
    const emergency988 = CRISIS_RESOURCES.emergency.resources.find((r) =>
      r.name.includes("988"),
    );
    // Extracting digits from the contact should yield "988"
    const digits = emergency988!.contact.replace(/[^0-9]/g, "");
    expect(digits).toBe("988");
  });

  test("tel:988 is a valid phone URI for the crisis lifeline", () => {
    // The client uses Linking.openURL(`tel:${digits}`)
    // Verify that extracting digits from the 988 resource contact
    // produces a valid tel: URI
    const emergency988 = CRISIS_RESOURCES.emergency.resources.find((r) =>
      r.name.includes("988"),
    );
    const digits = emergency988!.contact.replace(/[^0-9]/g, "");
    const telUri = `tel:${digits}`;
    expect(telUri).toBe("tel:988");
  });
});
