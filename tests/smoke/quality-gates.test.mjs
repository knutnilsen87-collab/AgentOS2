import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('prod-grade operational docs are present', async () => {
  const release = await readFile('docs/04_ops/PROD_GRADE_RELEASE_READINESS.md', 'utf-8');
  const dod = await readFile('docs/03_execution/PROD_GRADE_DEFINITION_OF_DONE.md', 'utf-8');

  assert(release.includes('Production-grade Release Readiness Matrix'));
  assert(dod.includes('Security and safety Definition of Done'));
});

test('desktop runtime exposes only whitelisted verification command', async () => {
  const main = await readFile('apps/desktop/electron/main.mjs', 'utf-8');

  assert(main.includes('VERIFICATION_COMMANDS'));
  assert(main.includes('typecheck'));
  assert(!main.includes("ipcMain.handle('agentos:run-shell'"));
  assert(main.includes('Protected path rejected'));
  assert(main.includes('audit.log'));
});
