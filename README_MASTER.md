# README_MASTER

## Project
Name: AgentOS (working title)
Purpose: Build a desktop-first agentic project operating system that can understand, plan, execute, verify, review, and improve work across code, docs, design, repo workflows, and automation.
Owner: Echo / Norwegian Steel
Primary stack: To be finalized during implementation bootstrap. Recommended baseline is desktop-first shell + agent runtime + sandbox layer + repo/memory/orchestration services.

## What this repository is
This repository is currently a **Codex-ready bootstrap and project-definition repo**.
It is not yet a compile-ready product repo.

At this stage, the repository exists to make the project:
- understandable to humans
- operable by Codex
- handoff-safe for new developers
- structured enough to move into phased implementation without losing context

## Source of truth
Use these files in this order:

1. `status_bundle.txt`
2. `README_MASTER.md`
3. `02_PRODUCT/PRD_REQUIREMENTS_v1.md`
4. `04_ARCHITECTURE_BACKEND/SYSTEM_ARCHITECTURE_v1.md`
5. `07_POLICY_LEGAL_RISK/SAFETY_AND_APPROVAL_MODEL.md`
6. `AGENTS.md`
7. `.codex/config.toml`
8. `.agents/skills/*/SKILL.md`
9. `09_MACHINE_READABLE/project_manifest.json`

## Current phase
Bootstrap / Product Definition / Codex Enablement

## Current truth about project maturity
- **Documented:** Yes
- **Architected at high level:** Yes
- **Codex-ready for repo onboarding and planning:** Yes
- **Implementation scaffolded:** Not yet
- **Compile-ready:** No
- **Production-ready:** No

## Project outcome
The target system should combine:
- local + later cloud agent execution
- safe sandboxing and approval modes
- repo-aware task execution
- multi-agent orchestration
- persistent project memory
- reusable skills / domain packs
- transparent run logs, diff review, replay, and handoff quality

## Recommended reading order for a new contributor
1. `status_bundle.txt`
2. `README_MASTER.md`
3. `00_START_HERE/CODEX_FIRST_RUN.md`
4. `02_PRODUCT/PRD_REQUIREMENTS_v1.md`
5. `04_ARCHITECTURE_BACKEND/SYSTEM_ARCHITECTURE_v1.md`
6. `07_POLICY_LEGAL_RISK/SAFETY_AND_APPROVAL_MODEL.md`
7. `AGENTS.md`
8. `.codex/config.toml`
9. `.agents/skills/`

## Working agreements
- Treat `status_bundle.txt` as the primary operational status file.
- Do not claim the project is implementation-complete, compile-ready, or production-ready without evidence.
- Keep documentation, status, and machine-readable files aligned.
- Prefer small, reviewable iterations.
- Use Codex in safe approval modes until the repo has a stable scaffold and verification loop.
