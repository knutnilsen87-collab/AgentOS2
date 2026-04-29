# Development acceleration checklist

## Goal
Remove as much ambiguity as possible so Codex or a developer can move from scaffold to working phase-1 product faster.

## Included in this pack
- source scaffold for thread-first desktop UI
- seed types and mock data
- phase visibility helpers
- right-rail visibility rules
- bottom conversation dock scaffold
- docs, prompts, issue templates, PR template

## First implementation passes
1. Make the new desktop shell compile.
2. Keep the bottom chat dock persistent.
3. Preserve fixed 5-region layout.
4. Wire real project scanner data into the new center/rail model.
5. Replace seed thread data with local task-store-backed data.
6. Add real actions for quick chips.

## Definition of a useful first milestone
- app opens
- thread-first UI renders
- guided vs advanced visibly differ
- plan/review/verification phases are understandable at a glance
- bottom dock feels useful even with seed data
