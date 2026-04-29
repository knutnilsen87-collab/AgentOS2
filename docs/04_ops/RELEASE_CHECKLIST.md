# AgentOS Release Checklist

## Scope

Use this checklist before tagging or distributing a prod-grade build.

## Required Gates

- [ ] `npm ci` completes on a clean Windows machine.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] `npm test` passes and includes smoke coverage.
- [ ] `npm run package:desktop` creates NSIS, portable, and unpacked Windows artifacts.
- [ ] Desktop app launches from the release build.
- [ ] Golden path is manually verified:
  - [ ] open app
  - [ ] connect/select local project
  - [ ] run project scan
  - [ ] create mission
  - [ ] generate plan
  - [ ] approve or request rework
  - [ ] run read-only verification
  - [ ] save and reopen task
- [ ] `.agentos/tasks/` task persistence survives restart.
- [ ] `.agentos/artifacts/audit.log` records verification events.
- [ ] Proposed artifact patch can be reviewed, applied, audited, and verified.
- [ ] Approval mode and risk are visible throughout the flow.
- [ ] Known issues are reviewed and updated.
- [ ] Rollback instructions are current.

## Release Notes Template

- Version:
- Date:
- Build commit:
- Golden path status:
- Validation commands:
- Known limitations:
- Rollback target:

## Decision Rule

Do not call a build prod-grade if any critical gate is unchecked.
