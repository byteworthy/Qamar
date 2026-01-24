# Scholar Review Workflow

**Priority 4: Protect Islamic Integrity Long-Term**

Last Updated: 2026-01-17

---

## Purpose

This document defines how Islamic content and theological framing are reviewed, approved, and maintained by qualified Islamic scholars to protect the spiritual integrity of Noor.

This is **not a one-time review**. It is an ongoing partnership.

---

## Approval Scope

### What Requires Scholar Review

**CRITICAL (Must Review Before Launch)**
1. All Quranic verses and their contextual application
2. All hadith selections and interpretations
3. Theological framing of mental health concepts
4. Islamic content in crisis interventions
5. Spiritual reframing language
6. Any claims about Islamic teachings or practice

**IMPORTANT (Quarterly Review)**
7. AI prompt templates with Islamic guidance
8. Islamic framework mappings (emotional states → spiritual concepts)
9. Tone guidelines for spiritual content
10. User-facing Islamic educational content

**ONGOING (As Needed)**
11. New Islamic content additions
12. Changes to existing Islamic content
13. User feedback indicating theological concern
14. AI outputs flagged by charter compliance

### What Does NOT Require Scholar Review

- Technical infrastructure changes
- UI/UX design updates (unless Islamic content affected)
- Non-Islamic CBT methodologies
- Business operations
- General safety features (non-theological)
- Performance optimizations

---

## Scholar Qualifications

### Minimum Requirements

Reviewers must have:

1. **Formal Islamic Education**: Graduate-level Islamic studies from recognized institution
2. **Aqeedah Soundness**: Commitment to Ahl as-Sunnah wa'l-Jamaa'ah
3. **Mental Health Awareness**: Understanding of (or willingness to learn about) psychological distress
4. **Cultural Sensitivity**: Awareness of diverse Muslim experiences
5. **Technology Literacy**: Able to understand AI system implications

### Preferred Additional Qualifications

- Experience in Islamic counseling or chaplaincy
- Familiarity with scrupulosity (waswasa) treatment
- Background in maqasid al-shariah (objectives of Islamic law)
- Understanding of pastoral care principles

---

## Review Process

### Initial Content Approval (Pre-Launch)

**Phase 1: Content Submission**
- Engineering team compiles all Islamic content
- Content presented with context and intended use
- Technical constraints explained clearly

**Phase 2: Scholar Review**
- Scholar(s) review content for theological accuracy
- Check for:
  - Authenticity of sources
  - Appropriate context and application
  - Avoidance of theological harm
  - Accessibility to diverse audiences
  - Respect for scholarly disagreement

**Phase 3: Revision Cycle**
- Scholar provides written feedback
- Engineering implements changes
- Revised content resubmitted
- Process repeats until approval

**Phase 4: Documentation**
- Approved content marked with:
  - Scholar signature
  - Approval date
  - Version number
  - Any caveats or conditions

### Ongoing Review Cadence

**Monthly: Light Touch**
- Quick review of new content additions
- Check telemetry for theological red flags
- Review any user-reported concerns

**Quarterly: Comprehensive**
- Full audit of Islamic content usage in production
- Review AI output samples for drift
- Assess effectiveness of theological safeguards
- Update guidance as needed

**Annually: Strategic**
- Major review of Islamic framework
- Assess theological positioning and messaging
- Consider new research or scholarly developments
- Plan for next year's content roadmap

### Emergency Review Process

**Trigger Conditions**
- Critical charter violation detected
- User reports serious theological concern
- Media or community raises alarm
- System generates clearly inappropriate content

**Response Protocol**
1. **Immediate**: Pause affected feature if possible
2. **Within 24 hours**: Scholar notified and briefed
3. **Within 48 hours**: Initial assessment provided
4. **Within 1 week**: Resolution plan approved
5. **Ongoing**: Monitor implementation and effectiveness

---

## Change Management

### Minor Changes (Don't Require Re-Approval)

- Fixing typos or grammar in Islamic content
- Adjusting formatting or presentation
- Technical refactoring with no content change
- Non-substantive wording improvements (scholar pre-approved template)

**Process**: Document change, inform scholar at next review

### Moderate Changes (Require Review)

- Adding new Quranic verses or hadith
- Changing context or application of existing content
- Modifying theological explanations
- Expanding to new emotional/spiritual contexts

**Process**: Submit for scholar review before deployment

### Major Changes (Require Approval)

- Changing theological framework or positioning
- Revising crisis intervention spiritual content
- Modifying core Islamic educational content
- Responding to serious theological concern

**Process**: Full review cycle before any deployment

---

## Emergency Rollback Procedure

### When to Rollback

**Immediate Rollback Required:**
- Scholar identifies critical theological error in production
- Content contradicts authentic Islamic teachings
- Risk of spiritual harm to users
- Content may bring disrepute to Islam

**Consider Rollback:**
- Minor theological imprecision detected
- Content may be misunderstood
- Scholarly disagreement area handled incorrectly

### Rollback Process

**Step 1: Identify Scope**
- Which content is affected?
- Which features use this content?
- How many users potentially impacted?

**Step 2: Execute Rollback**
- Revert to last scholar-approved version
- If no good prior version: disable feature entirely
- Deploy emergency fix within hours

**Step 3: User Communication**
- If users may have seen problematic content: brief, calm notification
- Explanation without defensiveness
- Do not amplify the issue unnecessarily

**Step 4: Root Cause Analysis**
- How did this content get deployed?
- What safeguards failed?
- How do we prevent recurrence?

**Step 5: Corrective Action**
- Implement process improvements
- Update charter compliance if needed
- Re-train team on procedures

---

## Scholar Compensation

### Principles

- Islamic knowledge is valuable and deserves respect
- Scholar's time is precious
- Fair compensation maintains quality and commitment
- Budget must be sustainable long-term

### Structure

**Retainer Model (Recommended)**
- Monthly retainer for availability and light-touch review
- Per-hour rate for comprehensive review sessions
- Project-based fees for major initiatives

**Alternative: Equity**
- Scholar may choose equity stake in company
- Aligns long-term interests
- Must not compromise scholarly independence

---

## Scholar Independence

### Non-Negotiables

1. **Scholarly Authority**: Final say on Islamic content
2. **No Pressure**: Never rushed or coerced on theological matters
3. **No Business Influence**: Business goals don't override theological integrity
4. **Transparent Disagreement**: If scholar and team disagree, scholar perspective prevails or feature is modified/removed
5. **Exit Right**: Scholar can resign if integrity compromised

### Team Responsibilities

- Provide clear context and constraints
- Explain technical limitations honestly
- Respect scholarly expertise
- Implement feedback faithfully
- Never deploy without approval

---

## Documentation Requirements

### For Each Reviewed Item

**Metadata:**
- Content ID or reference
- Review date
- Reviewer name(s)
- Approval status
- Version approved

**Context:**
- Intended use and user-facing presentation
- Technical constraints or limitations
- Related content dependencies

**Review Notes:**
- Scholar's assessment
- Any caveats or conditions
- Recommended changes (if applicable)
- Alternative approaches considered

**Sign-Off:**
- Scholar signature (digital acceptable)
- Date of approval
- Expiration or re-review date (if applicable)

### Audit Trail

- All reviews logged in version control
- Changes tracked with reasons
- Approval history preserved
- Easy to generate compliance reports

---

## Conflict Resolution

### If Scholar Rejects Content

**Option 1: Modify and Resubmit**
- Most common path
- Make requested changes
- Scholar re-reviews

**Option 2: Remove Feature**
- If modification impossible or inadequate
- Feature disabled until resolution found

**Option 3: Seek Additional Opinion**
- Only if genuine scholarly disagreement suspected
- Not to "shop around" for approval
- Second scholar brought in for perspective
- Original scholar's concerns still addressed

**Option 4: Change Approach**
- Redesign feature to avoid theological complexity
- Find non-religious alternative
- Pivot to different solution

### If Team Disagrees with Scholar

**Remember:**
- Scholar is the expert on Islamic content
- Business goals don't override theological integrity
- When in doubt, err on side of caution

**Acceptable Paths:**
- Explain constraints more clearly; seek compromise
- Propose alternative approach that meets both needs
- Accept scholar's decision and adjust plans

**Unacceptable Paths:**
- Deploy without approval
- Pressure scholar to compromise
- Dismiss theological concerns as "minor"

---

## Long-Term Partnership

### Building Trust

- Consistent communication
- Transparent about challenges
- Respectful of expertise
- Implement feedback thoroughly
- Credit scholar appropriately

### Growing Together

- Scholar learns about technology and mental health
- Team learns about Islamic epistemology and care
- Collaborative problem-solving
- Shared mission: serving Muslims with excellence

### Measuring Success

**For Scholar:**
- Theological integrity maintained
- No serious content issues in production
- Trust from Muslim community
- Personal satisfaction with partnership

**For Team:**
- Clear guidance and quick turnaround
- Sustainable review process
- Feature development not blocked unnecessarily
- Community confidence in Islamic authenticity

---

## Version History

- **v1.0** (2026-01-17): Initial workflow established
- Future versions: Updated based on experience and scholar feedback

---

## Next Steps

1. [ ] Identify and recruit qualified scholar(s)
2. [ ] Agree on compensation structure
3. [ ] Conduct initial comprehensive review
4. [ ] Establish communication channels
5. [ ] Set up documentation system
6. [ ] Schedule first quarterly review
7. [ ] Document this partnership in company policies
