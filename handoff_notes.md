# Handoff notes

## What changed in this version
- upgraded the lightweight UI note into a developer-ready phase-1 UI/UX spec
- added a UI implementation sequence aligned to the current repo build order
- added a machine-readable UI shell manifest
- added a repo-scoped `ui-mission-control` skill for Codex
- added a project-scoped `ui-architect` custom agent for Codex
- updated source-of-truth guidance so future UI work starts from the right files

## Honest current state
The repository now has enough UI product direction to continue real renderer work without inventing the workflow from scratch. In the v3 package, phases 1-7 have a pre-prod product slice: the desktop shell can select a local project, scan it read-only, list saved task records, generate a mission plan, save task records under `.agentos/tasks/`, reopen the last project, approve or request rework, run a whitelisted read-only typecheck verification, persist command evidence, write verification audit logs, and only mark done when visible checks pass.

Safety and release-readiness work now includes protected project root rejection, atomic task writes, root smoke tests, static gates, GitHub Actions CI, local desktop packaging, release checklist, known issues, rollback guide, support/debug guide, and an updated release readiness matrix.

Verified in this environment:
- `npm.cmd install`
- `npm.cmd run typecheck --workspaces --if-present`
- `npm.cmd run build --workspaces --if-present`
- `npm.cmd run lint`
- `npm.cmd test`
- `npm.cmd run package:desktop`

## Exact next operator steps
1. Use the already running Electron app or run `npm.cmd run dev --workspace @agentos/desktop`
2. Click `Open project`
3. Select a local project folder
4. Generate a mission plan
5. Approve the plan
6. Run read-only verification
7. Confirm command evidence and verification checks are persisted in `.agentos/tasks/`
8. Restart the app and confirm the last project/latest task reopens
9. Check `.agentos/artifacts/audit.log` after verification
10. Propose and apply an artifact patch, then verify it is limited to `.agentos/artifacts/`
11. Use `docs/04_ops/RELEASE_CHECKLIST.md` before any release decision

## First milestone after this update
The desktop shell renders as a stable mission-control layout with visible mission/approval/risk state, real project scan data, task plan generation, local task persistence, recent task reload behavior, review actions, read-only verification, constrained artifact apply, safety boundaries, smoke/static tests, local packaging, and operational release docs.
