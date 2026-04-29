# Codex handoff – UI plus source scaffold

Read first:
1. README.md
2. AGENTS.md
3. docs/05_ui_ux/CODEX_ON_STEROIDS_UI_VISION.md
4. docs/03_execution/DEV_ACCELERATION_CHECKLIST.md
5. apps/desktop/src/App.tsx

## Mission
Use the included source scaffold as the baseline for the next phase of AgentOS.
The product should feel like Codex on steroids:
- thread-first
- faster to start
- stronger on review/evidence/verification
- bottom chat dock always available

## Immediate expectations
- keep the current source scaffold structure
- replace seed/mock data gradually
- do not collapse back into dashboard-first or chat-only design
- keep the bottom dock permanent
- keep the right rail phase-aware

## Deliver in each PR
- changed files
- what moved from mock -> real
- what remains seed-only
- exact validation command


## Additional instruction for Codex
When making implementation choices, optimize not only for compile success, but for the prod-grade finish line defined in:
- `docs/03_execution/PROD_GRADE_DEFINITION_OF_DONE.md`
- `docs/04_ops/PROD_GRADE_RELEASE_READINESS.md`
- `docs/03_execution/FIRST_PROD_GRADE_BACKLOG.md`

Always state whether a change moves the product closer to the prod-grade DoD or is only scaffold work.
