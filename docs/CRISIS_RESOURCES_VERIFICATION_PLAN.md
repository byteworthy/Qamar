# Crisis Resources Verification Plan

**Status:** Pending verification
**Goal:** Make crisis resource verification repeatable, auditable, and fast.

## Scope
This plan covers all crisis resources referenced in:
- `server/ai-safety.ts` (`CRISIS_RESOURCES` object)
- `server/routes.ts` (API responses referencing `CRISIS_RESOURCES`)
- `USER_TRANSPARENCY.md` (user-facing disclosures)
- Any product/marketing docs that mention crisis resources (see evidence log)

## Verification Workflow (Repeatable)
1. **Inventory**
   - Open `docs/CRISIS_RESOURCES_EVIDENCE_LOG.md`.
   - Confirm every resource entry listed in code/docs appears in the table.
   - Add missing entries before verification.

2. **Verify each resource**
   - Use official, authoritative sources (see acceptable sources below).
   - Confirm the exact value in the app (phone number, text keyword, service name).
   - Confirm scope (24/7 availability, region coverage, and purpose).
   - Note any restrictions (age limits, geography, hours, language).

3. **Record evidence**
   - Paste the authoritative URL into the evidence log.
   - Record the verification date and verifier name.
   - Add notes about any discrepancies or caveats.

4. **Update any mismatches**
   - If the app or docs contain outdated values, update them to match the verified source.
   - Log the change in the evidence log Notes column and update documentation to reflect the change.

5. **Review and sign-off**
   - A second reviewer should spot-check at least one entry per region.
   - Record a second reviewer in Notes if required.

## Acceptable Source Types
- Official government or national hotline sites (preferred).
- Official nonprofit organization sites for the hotline.
- Official hotline FAQs or contact pages.
- Official Islamic counseling organizations for Islamic resources.

**Not acceptable:**
- Blogs, community forums, or personal posts.
- Secondary aggregators without official affiliation.
- AI-generated content.

## Evidence Recording Standards
- **Source URL:** Must be the authoritative page with the exact contact value.
- **Verified on:** Use ISO date format (YYYY-MM-DD).
- **Verifier name:** Full name or internal identifier.
- **Notes:** Include scope (region), hours, and any constraints.

## Reverification Cadence
- Re-verify at least **quarterly** or when:
  - A hotline changes hours, number, or branding.
  - A region-specific resource is added/removed.
  - Store metadata or user-facing disclosures are updated.

## Change Control
- Any updates to crisis resources must be:
  1. Reflected in code/docs.
  2. Captured in the evidence log.
  3. Marked as **pending verification** until re-verified.

## Current Status
All crisis resources are **pending verification**. Evidence log template is ready for completion.
