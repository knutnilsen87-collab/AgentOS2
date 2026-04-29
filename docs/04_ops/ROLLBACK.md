# AgentOS Rollback Guide

## Purpose

Rollback means returning a user or developer to the last known working build and preserving local AgentOS state when possible.

## Local State Locations

- Project tasks: `<project>/.agentos/tasks/`
- Project artifacts and audit log: `<project>/.agentos/artifacts/`
- Electron app state: Electron `userData` directory, file `agentos-app-state.json`

## Safe Rollback Steps

1. Stop the desktop app.
2. Back up the project `.agentos/` folder.
3. Check out or reinstall the previous known working build.
4. Run:
   - `npm ci`
   - `npm run typecheck`
   - `npm run build`
   - `npm test`
5. Launch the app and confirm the last project/task can be reopened.

## Data Recovery

If a task record is corrupt, move the affected JSON file out of `.agentos/tasks/` and keep it for debugging. The app is expected to continue listing other valid tasks.

## Rollback Blockers

Do not delete `.agentos/` as a first response. It contains the user's task history, verification evidence, and audit records.
