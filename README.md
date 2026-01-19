<p align="center">
  <img src="assets/images/noor-icon.svg" width="120" alt="Noor logo" />
</p>

# Noor

**Structured thinking for Muslims seeking clarity, intention, and alignment.**

Noor is a faith-aligned thinking companion built to help Muslims slow down their thoughts, examine them carefully, and move forward with intention. It is a structured reflection practice rooted in accountability of thought, clarity of intention, and alignment with Islamic values.

---

## Why Noor Exists

Modern life accelerates reaction. Noor creates space between thought and action. That space is where accountability lives.

---

## Core Experience

Through guided sessions, users:

- Capture a thought or inner tension
- Examine it calmly and honestly
- Reframe it with clarity and perspective
- Close with a deliberate intention

This process mirrors disciplined reasoning while staying grounded in faith, patience, and responsibility.

---

## Reflection Workflow

```mermaid
flowchart LR
  subgraph Step1[Capture]
    A[Thought or Tension]
  end
  subgraph Step2[Examine]
    B[Question Assumptions]
  end
  subgraph Step3[Reframe]
    C[Restore Clarity]
  end
  subgraph Step4[Intend]
    D[Set Niyyah]
  end
  subgraph Step5[Align]
    E[Act with Alignment]
  end

  A --> B --> C --> D --> E

  classDef step fill:#f8f3e8,stroke:#c9b99b,color:#3b2f1e;
  class A,B,C,D,E step;
```

---

## Faith-Aligned Thinking Practice

Noor operationalizes responsibility for thought, intention, and action.

- Thoughts are examined, not indulged.
- Clarity comes before reaction.
- Intention comes before action.

---

## AI Safety and Guardrails

Noor includes a dedicated safety layer to keep responses respectful, grounded, and aligned with Islamic values. The system is intentionally conservative by design, prioritizing clarity over novelty.

```mermaid
flowchart LR
  U[User Input] --> P[Structured Prompt Flow]
  P --> T[Tone & Faith Filters]
  T --> C[Charter Compliance]
  C --> R[Response Shaping]
  R --> O[Reflection Output]

  classDef guard fill:#eef6f1,stroke:#9ac6b1,color:#1f3b2c;
  class T,C guard;
```

**Guardrail Priorities**

- Faith-aligned tone and language
- Clear boundaries on scope and authority
- Calm, neutral, non-directive responses
- No open-ended generation loops

---

## Technology Overview

Noor is built as a modern mobile-first application with a strong emphasis on reliability, privacy, and clarity.

### Tech Stack

| Layer | Technology |
| --- | --- |
| Mobile App | React Native with Expo |
| Backend | Node.js with TypeScript |
| Data | Local-first storage, Postgres-ready services |
| API Layer | RESTful services |
| Auth | Token-based auth |
| AI Layer | Controlled prompt orchestration |
| Testing | Jest end-to-end and unit tests |
| Tooling | TypeScript, ESLint, Prettier |

---

## Architecture at a Glance

```mermaid
flowchart TD
  A[Mobile Client] --> B[API Layer]
  B --> C[Orchestration Layer]
  C --> D[Safety Filters]
  D --> E[Faith-Aligned Response]
  E --> F[Local Reflection Store]

  classDef core fill:#f1f5fb,stroke:#9db2ce,color:#1f2d3d;
  class A,B,C,D,E,F core;
```

---

## Applications

Noor supports disciplined reflection across everyday situations:

- Clarifying a difficult decision before acting
- Interrupting circular thinking loops
- Reframing assumptions with faith and reason
- Closing a moment of tension with a clear intention

---

## Who Noor Is For

Muslims who:

- Want to think more clearly before acting
- Value faith-aligned accountability
- Prefer structure over endless journaling
- Want intention to guide action

---

## Privacy

- Local-first storage by default
- User-controlled deletion
- Minimal data exposure

---

## Project Status

Noor is in active development with a focus on:

- Core reflection flows
- Stability and testing
- Clean, intentional language
- App store readiness
- Private validation builds

---

## Closing

Noor is intentionally narrow. That focus is its strength.

It exists to help Muslims think more truthfully, act more deliberately, and carry intention into daily life.

**Nothing more. Nothing less.**
