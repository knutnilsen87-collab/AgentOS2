# AgentOS Known Issues

## Current Known Limitations

- The desktop app can be packaged locally, but installer signing and auto-update are not production-configured.
- UI regression coverage is currently smoke/static coverage, not browser-driven screenshot coverage.
- Verification is intentionally limited to whitelisted read-only commands: typecheck, build, and smoke tests.
- The first apply workflow is intentionally limited to AgentOS-owned files under `.agentos/artifacts/`; general source-code diff/apply is not enabled yet.
- Project memory is still limited to task history and last-project reopen state.
- Release validation has not yet been run on a completely clean Windows machine outside this workspace.
- Installer signing and auto-update are not configured. Local packaging is configured as unsigned pre-prod packaging.

## Support Severity

- **P0:** crash on launch, task history loss, silent irreversible action, approval state hidden or wrong.
- **P1:** golden path blocked, verification cannot run, corrupted task record breaks task list.
- **P2:** confusing state, layout regression, non-critical command evidence missing.
- **P3:** copy, polish, or documentation issue.

## Triage Rule

Any P0 or P1 issue blocks prod-grade release until resolved or explicitly accepted by the release owner.
