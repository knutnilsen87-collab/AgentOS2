# AgentOS Support And Debug Guide

## First Facts To Collect

- AgentOS version or build commit.
- Windows version.
- Node and npm versions.
- Project path selected by the user.
- Whether the issue happens before or after project selection.
- Last visible phase in the header.
- Current approval mode and risk shown in the UI.

## Useful Commands

```powershell
npm.cmd run typecheck --workspaces --if-present
npm.cmd run build --workspaces --if-present
npm.cmd test
```

## Local Evidence

- Task records live under `.agentos/tasks/`.
- Verification audit events live in `.agentos/artifacts/audit.log`.
- Command evidence is stored in the task record review package.

## Common Failure Areas

- Project path rejected by safety policy.
- Workspace typecheck fails because the selected project has existing TypeScript errors.
- Task JSON is corrupt or manually edited.
- Electron bridge unavailable because the renderer was opened in a browser instead of the desktop app.

## Bug Report Template

- Summary:
- Steps to reproduce:
- Expected result:
- Actual result:
- Selected project path:
- Active task id:
- Approval mode:
- Risk:
- Verification command output:
- Relevant `.agentos/tasks/` record:
