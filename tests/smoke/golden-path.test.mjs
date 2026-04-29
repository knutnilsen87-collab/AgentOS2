import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { scanProject } from '../../packages/project-scanner/dist/packages/project-scanner/src/index.js';
import { buildPhaseOnePlan, buildSeedVerification } from '../../packages/task-engine/dist/packages/task-engine/src/index.js';
import { saveTaskRecord, listTaskRecords } from '../../packages/task-store/dist/packages/task-store/src/index.js';
import { renderStatusBundle } from '../../packages/status-bundle/dist/packages/status-bundle/src/index.js';

test('golden path packages support scan, plan, persist, reopen, and status summary', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'agentos-smoke-'));

  try {
    await writeFile(path.join(root, 'package.json'), JSON.stringify({ name: 'sample-project' }), 'utf-8');
    await writeFile(path.join(root, 'README.md'), '# Sample Project\n', 'utf-8');

    const summary = await scanProject(root);
    assert.equal(summary.estimatedFileCount, 2);
    assert.equal(summary.manifests.length, 2);
    assert(summary.languages.includes('json'));
    assert(summary.languages.includes('md'));

    const plan = buildPhaseOnePlan('Refactor startup safely', 'read-only', summary);
    assert.equal(plan.risk, 'medium');
    assert.equal(plan.approvalMode, 'read-only');
    assert(plan.steps.length >= 4);

    const now = new Date().toISOString();
    await saveTaskRecord({
      id: 'task-smoke',
      prompt: plan.objective,
      status: 'planned',
      approvalMode: 'read-only',
      createdAt: now,
      updatedAt: now,
      phase: 'plan',
      risk: plan.risk,
      projectRoot: root,
      plan,
      verificationChecks: buildSeedVerification(summary)
    }, path.join(root, '.agentos'));

    const tasks = await listTaskRecords(path.join(root, '.agentos'));
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].id, 'task-smoke');
    assert.equal(tasks[0].plan?.objective, 'Refactor startup safely');

    const status = renderStatusBundle({
      projectName: 'AgentOS',
      phase: 'smoke',
      summary: ['Golden path package smoke test passed.'],
      nextActions: ['Run desktop manual QA.']
    });
    assert(status.includes('PROJECT: AgentOS'));
    assert(status.includes('Golden path package smoke test passed.'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
