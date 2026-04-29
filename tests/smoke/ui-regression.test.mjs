import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('golden path UI exposes required operator actions', async () => {
  const plan = await readFile('apps/desktop/src/components/thread/PlanCard.tsx', 'utf-8');
  const review = await readFile('apps/desktop/src/components/thread/ReviewCard.tsx', 'utf-8');
  const verification = await readFile('apps/desktop/src/components/thread/VerificationCard.tsx', 'utf-8');
  const patch = await readFile('apps/desktop/src/components/thread/ProposedPatchCard.tsx', 'utf-8');
  const sidebar = await readFile('apps/desktop/src/components/left-rail/ProjectSidebar.tsx', 'utf-8');

  assert(plan.includes('Approve plan'));
  assert(plan.includes('Run read-only verification'));
  assert(plan.includes('Request rework'));
  assert(review.includes('Command evidence'));
  assert(review.includes('Typecheck'));
  assert(review.includes('Build'));
  assert(review.includes('Smoke tests'));
  assert(verification.includes('Mark done'));
  assert(verification.includes('Smoke tests'));
  assert(patch.includes('Apply artifact patch'));
  assert(patch.includes('Propose status artifact'));
  assert(sidebar.includes('Open project'));
  assert(sidebar.includes('Recent threads'));
});
