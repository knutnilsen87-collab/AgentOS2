import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('desktop app keeps approval, risk, version, and verification visible', async () => {
  const app = await readFile('apps/desktop/src/App.tsx', 'utf-8');
  const topStatus = await readFile('apps/desktop/src/components/shell/TopStatusBar.tsx', 'utf-8');
  const runtimeDock = await readFile('apps/desktop/src/components/shell/RuntimeDock.tsx', 'utf-8');
  const verification = await readFile('apps/desktop/src/components/thread/VerificationCard.tsx', 'utf-8');

  assert(topStatus.includes('Approval: {approvalMode}'));
  assert(topStatus.includes('Risk: {risk}'));
  assert(runtimeDock.includes('AgentOS: {appVersion}'));
  assert(app.includes('onMarkDone'));
  assert(verification.includes('disabled={!canMarkDone}'));
});

test('runtime does not expose generic shell execution', async () => {
  const main = await readFile('apps/desktop/electron/main.mjs', 'utf-8');
  const preload = await readFile('apps/desktop/electron/preload.mjs', 'utf-8');

  assert(!main.includes('agentos:run-shell'));
  assert(!preload.includes('runShell'));
  assert(main.includes('VERIFICATION_COMMANDS'));
  assert(main.includes('build'));
  assert(main.includes('test'));
  assert(main.includes('assertAllowedProjectRoot'));
  assert(main.includes('assertAgentOsArtifactTarget'));
});

test('release operations docs cover installer, rollback, and support', async () => {
  const release = await readFile('docs/04_ops/RELEASE_CHECKLIST.md', 'utf-8');
  const rollback = await readFile('docs/04_ops/ROLLBACK.md', 'utf-8');
  const support = await readFile('docs/04_ops/SUPPORT_DEBUG.md', 'utf-8');

  assert(release.includes('Desktop app launches from the release build'));
  assert(rollback.includes('Back up the project `.agentos/` folder'));
  assert(support.includes('Bug Report Template'));
});
