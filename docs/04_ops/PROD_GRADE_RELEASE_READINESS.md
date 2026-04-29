# AgentOS - Production-grade Release Readiness Matrix

## Status Values

- NOT_STARTED
- IN_PROGRESS
- BLOCKED
- READY

## Product And UX

- [ ] **IN_PROGRESS** Golden path complete on clean Windows machine
- [ ] **IN_PROGRESS** First-run experience understandable within 30 seconds
- [x] **READY** Guided mode reduces complexity
- [x] **READY** Advanced mode exposes more control without layout chaos
- [x] **READY** Thread-first workspace feels coherent
- [x] **READY** Right rail provides useful evidence and approvals
- [x] **READY** Bottom conversation dock is persistent and context-aware

## Functional

- [x] **READY** Project selection works
- [x] **READY** Project scan works
- [x] **READY** Mission/thread input creates tasks
- [x] **READY** Plan generation works
- [x] **READY** Review package works
- [x] **READY** Verification checks work
- [x] **READY** Task persistence works
- [x] **READY** Recent task reopen works

## Safety

- [x] **READY** Approval mode always visible
- [x] **READY** Risk always visible
- [x] **READY** High-risk actions have stronger UX treatment
- [x] **READY** Sandbox/runtime state visible
- [x] **READY** No silent irreversible behavior in normal flow
- [x] **READY** Verification commands are limited to a read-only whitelist
- [x] **READY** Protected drive/home/system paths are rejected as project roots
- [x] **READY** Verification events are written to `.agentos/artifacts/audit.log`

## Engineering Quality

- [x] **READY** Lint/static gate passes
- [x] **READY** Typecheck passes
- [x] **READY** Build passes
- [x] **READY** Smoke tests pass
- [x] **READY** Critical golden-path regressions covered by smoke/static tests
- [x] **READY** CI workflow exists for install, typecheck, build, and smoke tests

## Operations

- [x] **READY** Setup instructions current
- [x] **READY** Validation instructions current
- [x] **READY** Release checklist exists
- [x] **READY** Known issues documented
- [x] **READY** Rollback approach documented
- [x] **READY** Support/debug flow documented
- [x] **READY** Unsigned pre-prod packaging path exists
- [ ] **IN_PROGRESS** Installer signing and auto-update exist

## Current Decision

AgentOS has a substantially stronger prod-grade foundation after phases 5-7, but should still be treated as **pre-prod** until:

- the golden path is manually verified on a clean Windows machine
- installer signing or an explicit unsigned-distribution policy exists
- clean-machine manual QA evidence is attached to the release notes

Do not mark the product prod-grade until all critical rows are READY.
