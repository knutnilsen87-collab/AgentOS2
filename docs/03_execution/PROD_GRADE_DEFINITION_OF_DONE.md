# AgentOS — Production-grade Definition of Done

## Purpose
This document defines what must be true before AgentOS can reasonably be called a **production-grade product** rather than an advanced scaffold or internal alpha.

It is written to remove ambiguity for:
- founders
- Codex
- contractors
- future developers
- QA/release owners

The goal is not perfection.
The goal is a clear finish line for the first prod-grade release.

---

## Product-level Definition of Done
AgentOS is prod-grade when all of the following are true:

1. A new user can install it, connect a local project, create a task, review the plan, approve a safe action, run verification, and understand the result without developer intervention.
2. The core desktop experience is stable enough that crashes, broken layouts, and dead-end flows are rare and actively monitored.
3. Review, approval, evidence, and verification are real product behaviors, not just placeholder UI.
4. Local data persistence, task history, and project memory are reliable and survive restarts.
5. The shell, task system, and runtime behavior are tested enough that regressions are caught before release.
6. The product has enough onboarding, help, and guardrails that it does not depend on hidden tribal knowledge.
7. Security, sandboxing, and destructive action boundaries are explicit and enforced.
8. The product can be released, installed, updated, debugged, and supported through a repeatable release process.

---

## Release gates
All release gates below must be green for the first prod-grade release.

### Gate 1 — Core user flow
The following user journey must work end-to-end:
- install desktop app
- launch app successfully
- connect/select local project
- run project scan
- create mission/task from thread input
- generate plan
- review plan
- approve or request rework
- run verification
- save and reopen task history

Definition of done:
- works on a clean Windows machine
- no blocker bugs in the golden path
- user can finish the flow without reading source code

### Gate 2 — UI/UX readiness
The UI must support the intended product identity:
- Codex-style thread-first workspace
- operational right rail
- persistent bottom conversation dock
- guided and advanced display profiles
- calm, understandable first-run experience

Definition of done:
- first-task experience is not overloaded
- mission input is obvious
- current phase is obvious
- current next action is obvious
- approval state is obvious
- high-risk actions are visually stronger than low-risk actions
- the UI does not collapse into a generic chatbot

### Gate 3 — Runtime and persistence
The core runtime must work reliably enough for real usage.

Definition of done:
- project scans succeed or fail gracefully
- task plans can be created repeatedly
- task records persist correctly
- task/thread state survives restart
- verification results persist correctly
- corrupted local state is handled safely

### Gate 4 — Review and verification
Review and verification must be real features, not decorative placeholders.

Definition of done:
- review package contains meaningful summary data
- affected files are surfaced when relevant
- approval decisions change task state correctly
- verification checks are visible and persist
- unresolved warnings remain visible
- “done” is never shown without visible verification basis

### Gate 5 — Safety and approvals
The app must behave conservatively and predictably.

Definition of done:
- approval mode is always visible
- destructive or risky operations cannot appear casual
- safe/read-only flows are supported
- sandbox/runtime status is visible
- the product never silently performs irreversible work without explicit permission

### Gate 6 — Quality and reliability
The app must be supportable.

Definition of done:
- lint, typecheck, and build pass in CI
- smoke tests pass
- critical UI states have regression coverage
- startup failures and major task failures are surfaced clearly
- unhandled exceptions are minimized and logged

### Gate 7 — Operations and release readiness
The product must be shippable.

Definition of done:
- versioning exists
- release checklist exists
- packaging/install path exists
- rollback path exists
- known issues list exists
- support/debug instructions exist

---

## Functional Definition of Done
The following capabilities must be complete enough for a prod-grade v1.

### 1. Desktop shell
Must have:
- stable app shell
- thread-first main workspace
- right rail
- bottom conversation dock
- runtime/status dock
- clear project and task navigation

Not done if:
- shell crashes frequently
- layout breaks at normal desktop sizes
- major parts are still only mock placeholders with no path to real data

### 2. Project scan
Must have:
- local project selection
- scan execution
- summary generation
- graceful error state
- visible scan status

Not done if:
- scan silently fails
- result cannot be trusted or reopened
- the user cannot tell what happened

### 3. Mission / thread input
Must have:
- thread or mission entry point
- persistent bottom input
- phase-aware placeholder/help
- ability to create the next task/plan from current context

Not done if:
- chat input exists but is disconnected from task state
- user input feels like generic chat with no project awareness

### 4. Plan generation
Must have:
- plan creation from mission input
- visible ordered steps
- risk summary
- approval decision path

Not done if:
- plan exists only as raw text dump
- no review path exists

### 5. Review package
Must have:
- review summary
- notes or findings
- verification relationship
- approval actions

Not done if:
- review is decorative only
- no concrete operator decision can be made from it

### 6. Verification
Must have:
- checks list
- pass/fail/pending state
- persisted results
- next-action guidance

Not done if:
- “verified” is shown without checks
- verification disappears after restart

### 7. Task persistence
Must have:
- save
- reopen
- recent tasks list
- selected task reload

Not done if:
- tasks are lost after restart
- saved tasks cannot be trusted

---

## UX Definition of Done
The UX is done for prod-grade v1 when these statements are true.

### New user experience
- A new user can understand where to start within 30 seconds.
- The product does not overwhelm the user on first launch.
- Guided mode actually reduces visible complexity.

### Operational clarity
- The user can always tell:
  - what the system is doing now
  - what phase the current task is in
  - what the next action is
  - whether approval is required
  - whether the system is done or still uncertain

### Control and trust
- Risk is visible.
- Approval is visible.
- Evidence is visible.
- Verification is visible.
- The user never needs to guess whether the system actually did something.

### Thread usability
- The thread feels like a fast working surface, not a noisy transcript.
- Artifact cards improve the thread rather than cluttering it.
- The bottom dock is useful enough that users naturally use it, but it does not dominate the product.

---

## Technical Definition of Done

### Code quality
Must have:
- passing lint
- passing typecheck
- passing build
- no large dead code areas in the golden path
- consistent shared types for UI/task state

### Test baseline
Must have at minimum:
- smoke tests for startup flow
- smoke tests for task plan generation flow
- smoke tests for task persistence flow
- UI regression coverage for golden path states
- unit coverage for critical helpers/view-models

### Performance baseline
For prod-grade v1:
- app launch feels responsive on target Windows hardware
- thread interactions do not feel laggy during normal usage
- project scan summary appears within a reasonable time window for normal repos
- UI remains usable while background work is happening

### Stability baseline
- no known crash-on-start blockers
- no known corruption-on-save blockers
- no known approval-state desync blockers
- no known task-history-loss blockers

---

## Security and safety Definition of Done
Must have:
- explicit approval model visible in UI
- safe defaults
- conservative action boundaries
- clear separation between review and apply
- clear sandbox/runtime status
- local state paths documented
- no accidental destructive behavior in the normal flow

For the first prod-grade release, the product is **not done** if:
- irreversible actions can be triggered ambiguously
- approval context is hidden
- risky actions look visually identical to safe ones

---

## Documentation Definition of Done
Must have:
- current README
- setup instructions
- validation instructions
- release checklist
- known limitations
- source-of-truth order
- handoff docs for Codex and developers
- product UI vision documented
- prod-grade DoD documented

Not done if:
- the product only makes sense to the person who built it

---

## Supportability Definition of Done
Must have:
- reproducible bug report template
- logs/debug guidance
- known issues list
- version identifier visible to developers/support
- issue triage flow for critical product bugs

---

## Final “ship” checklist
AgentOS may be called prod-grade v1 only if all answers below are YES.

- Can a new user complete the golden path on Windows?
- Can the app persist and reopen task state reliably?
- Can the user clearly understand mission, phase, review, and verification?
- Does guided mode actually reduce complexity?
- Does the bottom conversation dock improve the product without turning it into a generic chat app?
- Are approval and risk always visible?
- Are verification checks real and persisted?
- Do lint, typecheck, build, and smoke tests pass?
- Is there a repeatable release process?
- Is there enough documentation that another developer can continue the work safely?

If any critical item above is NO, the product is not yet prod-grade.
