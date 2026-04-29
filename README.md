# AgentOS Dev Acceleration Pack v1

This package is a **development acceleration bundle** for AgentOS. It includes:

- the starter monorepo scaffold
- a richer **thread-first desktop UI source scaffold**
- Codex-oriented docs and handoffs
- implementation checklists, issue templates, PR template, and mock data
- a UI direction based on **Codex-style threads + stronger approvals/evidence/verification**

## What changed in this pack

This version adds concrete source code for the next UI direction:
- sidebar with project/thread model
- center canvas that is phase-aware
- compact right rail that grows with risk/review
- persistent bottom chat/command dock
- guided vs advanced display behavior

## Important truth

This is still a scaffold, not a fully verified production app.
It is designed to make development easier and reduce ambiguity for Codex or a human developer.

## Best next step

1. Read `AGENTS.md`
2. Read `docs/05_ui_ux/CODEX_ON_STEROIDS_UI_VISION.md`
3. Read `docs/03_execution/DEV_ACCELERATION_CHECKLIST.md`
4. Open `apps/desktop/src/App.tsx`
5. Start implementing from the source scaffold instead of starting from a blank screen


## Production-grade target
The explicit finish line for the first real release is documented here:
- `docs/03_execution/PROD_GRADE_DEFINITION_OF_DONE.md`
- `docs/04_ops/PROD_GRADE_RELEASE_READINESS.md`
- `docs/03_execution/FIRST_PROD_GRADE_BACKLOG.md`

Use these three together as the release truth for when AgentOS moves from scaffold/alpha to a real prod-grade product.
