import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execFileAsync = promisify(execFile);
const IGNORED_SCAN_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage', '.agentos']);
const MANIFEST_FILES = new Set(['package.json', 'tsconfig.json', 'README.md', 'README_MASTER.md', 'vite.config.ts']);
const VERIFICATION_COMMANDS = {
  typecheck: {
    executable: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['run', 'typecheck', '--workspaces', '--if-present']
  },
  build: {
    executable: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['run', 'build', '--workspaces', '--if-present']
  },
  test: {
    executable: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['test']
  }
};
const DEFAULT_OPENAI_MODEL = 'gpt-5.2-mini';
const PROTECTED_PROJECT_ROOTS = new Set([
  path.parse(process.cwd()).root.toLowerCase(),
  app.getPath('home').toLowerCase()
]);

async function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!(await pathExists(envPath))) return;

  const raw = await fs.readFile(envPath, 'utf-8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '');
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function normalizePathForPolicy(targetPath) {
  return path.resolve(targetPath).toLowerCase();
}

function assertAllowedProjectRoot(rootPath) {
  const normalized = normalizePathForPolicy(rootPath);
  if (PROTECTED_PROJECT_ROOTS.has(normalized)) {
    throw new Error('Protected path rejected. Select a specific project folder, not a drive root or home directory.');
  }
  if (normalized.includes(`${path.sep.toLowerCase()}windows${path.sep.toLowerCase()}`)) {
    throw new Error('Protected Windows system path rejected.');
  }
  if (normalized.includes(`${path.sep.toLowerCase()}program files`)) {
    throw new Error('Protected application install path rejected.');
  }
}

async function walkProject(dir, rootPath, state) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORED_SCAN_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(rootPath, fullPath).replaceAll(path.sep, '/');

    if (entry.isDirectory()) {
      if (entry.isSymbolicLink()) continue;
      await walkProject(fullPath, rootPath, state);
      continue;
    }

    if (entry.isSymbolicLink()) continue;

    state.count += 1;
    const ext = path.extname(entry.name).replace('.', '');
    if (ext) state.extensions.add(ext);
    if (MANIFEST_FILES.has(entry.name)) state.manifests.push(relativePath);
    if (
      ['main.tsx', 'App.tsx', 'main.mjs', 'preload.mjs', 'index.ts', 'index.tsx'].includes(entry.name) &&
      state.entryPoints.length < 12
    ) {
      state.entryPoints.push(relativePath);
    }
  }
}

async function scanProject(rootPath) {
  assertAllowedProjectRoot(rootPath);
  const state = {
    count: 0,
    manifests: [],
    extensions: new Set(),
    entryPoints: []
  };

  await walkProject(rootPath, rootPath, state);

  return {
    rootPath,
    manifests: state.manifests.sort(),
    languages: Array.from(state.extensions).sort(),
    estimatedFileCount: state.count,
    entryPoints: state.entryPoints.sort(),
    warnings: state.count === 0 ? ['No files were discovered during the read-only scan.'] : []
  };
}

function taskDirForProject(projectRoot) {
  assertAllowedProjectRoot(projectRoot);
  return path.join(projectRoot, '.agentos', 'tasks');
}

function appStatePath() {
  return path.join(app.getPath('userData'), 'agentos-app-state.json');
}

async function saveLastProject(rootPath) {
  assertAllowedProjectRoot(rootPath);
  await fs.mkdir(app.getPath('userData'), { recursive: true });
  await fs.writeFile(appStatePath(), JSON.stringify({ lastProjectRoot: rootPath }, null, 2), 'utf-8');
}

async function appendAuditLog(projectRoot, event) {
  const auditDir = path.join(projectRoot, '.agentos', 'artifacts');
  await fs.mkdir(auditDir, { recursive: true });
  const line = `${JSON.stringify({ createdAt: new Date().toISOString(), ...event })}\n`;
  await fs.appendFile(path.join(auditDir, 'audit.log'), line, 'utf-8');
}

async function loadLastProjectRoot() {
  try {
    const raw = await fs.readFile(appStatePath(), 'utf-8');
    const parsed = JSON.parse(raw);
    return typeof parsed.lastProjectRoot === 'string' ? parsed.lastProjectRoot : null;
  } catch {
    return null;
  }
}

async function listTaskRecords(projectRoot) {
  const taskDir = taskDirForProject(projectRoot);
  await fs.mkdir(taskDir, { recursive: true });
  const entries = await fs.readdir(taskDir);
  const records = [];

  for (const entry of entries.filter((item) => item.endsWith('.json'))) {
    const fullPath = path.join(taskDir, entry);
    try {
      const raw = await fs.readFile(fullPath, 'utf-8');
      records.push(JSON.parse(raw));
    } catch {
      records.push({
        id: entry.replace(/\.json$/, ''),
        prompt: `Unreadable task record: ${entry}`,
        status: 'failed',
        approvalMode: 'edit-with-approval',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        summary: 'AgentOS could not parse this saved task.',
        phase: 'review',
        risk: 'high'
      });
    }
  }

  return records.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

async function saveTaskRecord(projectRoot, record) {
  const taskDir = taskDirForProject(projectRoot);
  await fs.mkdir(taskDir, { recursive: true });
  const targetPath = path.join(taskDir, `${record.id}.json`);
  const tempPath = path.join(taskDir, `${record.id}.tmp`);
  await fs.writeFile(tempPath, JSON.stringify(record, null, 2), 'utf-8');
  await fs.rename(tempPath, targetPath);
  return targetPath;
}

function assertAgentOsArtifactTarget(projectRoot, targetPath) {
  assertAllowedProjectRoot(projectRoot);
  const resolvedRoot = path.resolve(projectRoot);
  const resolvedTarget = path.resolve(projectRoot, targetPath);
  const allowedRoot = path.join(resolvedRoot, '.agentos', 'artifacts');
  if (!resolvedTarget.startsWith(allowedRoot)) {
    throw new Error('Patch target rejected. Phase-one apply is limited to .agentos/artifacts.');
  }
  if (path.basename(resolvedTarget).startsWith('.')) {
    throw new Error('Hidden artifact targets are not allowed.');
  }
  return resolvedTarget;
}

async function applyProposedPatch(projectRoot, patch) {
  if (!patch || patch.status !== 'proposed') {
    throw new Error('Only proposed patches can be applied.');
  }

  const targetPath = assertAgentOsArtifactTarget(projectRoot, patch.targetPath);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });

  let currentText = '';
  try {
    currentText = await fs.readFile(targetPath, 'utf-8');
  } catch {
    currentText = '';
  }

  if (patch.beforeText !== undefined && currentText !== patch.beforeText) {
    throw new Error('Patch target changed since proposal. Refusing apply.');
  }

  await fs.writeFile(targetPath, patch.afterText, 'utf-8');
  await appendAuditLog(projectRoot, {
    kind: 'patch_applied',
    patchId: patch.id,
    targetPath: patch.targetPath,
    policy: 'agentos-artifacts-only'
  });

  return {
    ...patch,
    status: 'applied',
    appliedAt: new Date().toISOString()
  };
}

function outputLines(output) {
  return output
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .slice(-80);
}

function buildOpenAiContext(payload) {
  const project = payload?.projectSummary;
  const thread = payload?.thread;
  const recentMessages = Array.isArray(thread?.messages)
    ? thread.messages.slice(-8).map((message) => `${message.role}: ${message.text}`).join('\n')
    : 'No prior thread messages.';

  return [
    `Project: ${project?.rootPath ?? 'No project connected'}`,
    `Phase: ${payload?.phase ?? thread?.phase ?? 'unknown'}`,
    `Approval mode: ${payload?.approvalMode ?? 'unknown'}`,
    `Thread title: ${thread?.title ?? 'No active thread'}`,
    `Thread status: ${thread?.status ?? 'unknown'}`,
    `Thread risk: ${thread?.risk ?? 'unknown'}`,
    `Detected manifests: ${(project?.manifests ?? []).slice(0, 8).join(', ') || 'none'}`,
    `Detected languages: ${(project?.languages ?? []).slice(0, 12).join(', ') || 'none'}`,
    '',
    'Recent thread messages:',
    recentMessages
  ].join('\n');
}

async function chatWithOpenAi(payload) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set. Add it to .env or the process environment.');
  }

  const message = String(payload?.message ?? '').trim();
  if (!message) {
    throw new Error('Chat message is required.');
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      instructions: [
        'You are AgentOS inside a local desktop app.',
        'Help the operator plan, review, and verify software work.',
        'Be concise, concrete, and safety-aware.',
        'Do not claim you changed files or ran commands unless the app context explicitly says so.',
        'When asked to perform implementation, respond with the next safe AgentOS action rather than pretending to execute it.'
      ].join(' '),
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `${buildOpenAiContext(payload)}\n\nOperator message:\n${message}`
            }
          ]
        }
      ],
      max_output_tokens: 700,
      store: false
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.error?.message ?? `OpenAI request failed with ${response.status}`;
    throw new Error(detail);
  }

  const outputText = typeof data.output_text === 'string'
    ? data.output_text
    : Array.isArray(data.output)
      ? data.output
          .flatMap((item) => Array.isArray(item.content) ? item.content : [])
          .filter((item) => item.type === 'output_text' && typeof item.text === 'string')
          .map((item) => item.text)
          .join('\n')
      : '';

  return {
    text: outputText.trim() || 'OpenAI returned an empty response.',
    model,
    responseId: data.id ?? null
  };
}

async function runVerificationCommand(projectRoot, command) {
  assertAllowedProjectRoot(projectRoot);
  const definition = VERIFICATION_COMMANDS[command];
  if (!definition) {
    throw new Error(`Unsupported verification command: ${command}`);
  }

  const startedAt = new Date().toISOString();
  await appendAuditLog(projectRoot, {
    kind: 'verification_started',
    command,
    executable: definition.executable,
    args: definition.args,
    policy: 'read-only-whitelist'
  });
  try {
    const result = await execFileAsync(definition.executable, definition.args, {
      cwd: projectRoot,
      timeout: 120000,
      windowsHide: true,
      maxBuffer: 1024 * 1024
    });
    const payload = {
      command,
      status: 'pass',
      exitCode: 0,
      startedAt,
      finishedAt: new Date().toISOString(),
      output: outputLines(`${result.stdout ?? ''}\n${result.stderr ?? ''}`)
    };
    await appendAuditLog(projectRoot, { kind: 'verification_finished', command, status: payload.status, exitCode: payload.exitCode });
    return payload;
  } catch (error) {
    const exitCode = typeof error.code === 'number' ? error.code : null;
    const payload = {
      command,
      status: 'fail',
      exitCode,
      startedAt,
      finishedAt: new Date().toISOString(),
      output: outputLines(`${error.stdout ?? ''}\n${error.stderr ?? ''}\n${error.message ?? ''}`)
    };
    await appendAuditLog(projectRoot, { kind: 'verification_finished', command, status: payload.status, exitCode: payload.exitCode });
    return payload;
  }
}

function registerIpcHandlers() {
  ipcMain.handle('agentos:load-last-project', async () => {
    const rootPath = await loadLastProjectRoot();
    if (!rootPath || !(await pathExists(rootPath))) return null;

    const summary = await scanProject(rootPath);
    const tasks = await listTaskRecords(rootPath);
    return { summary, tasks };
  });

  ipcMain.handle('agentos:select-project', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Open local project',
      properties: ['openDirectory']
    });

    if (result.canceled || !result.filePaths[0]) return null;

    const rootPath = result.filePaths[0];
    await saveLastProject(rootPath);
    const summary = await scanProject(rootPath);
    const tasks = await listTaskRecords(rootPath);
    return { summary, tasks };
  });

  ipcMain.handle('agentos:scan-project', async (_event, rootPath) => {
    if (!rootPath || !(await pathExists(rootPath))) {
      throw new Error('Project path does not exist.');
    }

    const summary = await scanProject(rootPath);
    await saveLastProject(rootPath);
    const tasks = await listTaskRecords(rootPath);
    return { summary, tasks };
  });

  ipcMain.handle('agentos:list-task-records', async (_event, projectRoot) => {
    if (!projectRoot || !(await pathExists(projectRoot))) return [];
    return listTaskRecords(projectRoot);
  });

  ipcMain.handle('agentos:save-task-record', async (_event, projectRoot, record) => {
    if (!projectRoot || !(await pathExists(projectRoot))) {
      throw new Error('Cannot save task without a valid project root.');
    }

    return saveTaskRecord(projectRoot, record);
  });

  ipcMain.handle('agentos:run-verification-command', async (_event, projectRoot, command) => {
    if (!projectRoot || !(await pathExists(projectRoot))) {
      throw new Error('Cannot run verification without a valid project root.');
    }

    return runVerificationCommand(projectRoot, command);
  });

  ipcMain.handle('agentos:apply-proposed-patch', async (_event, projectRoot, patch) => {
    if (!projectRoot || !(await pathExists(projectRoot))) {
      throw new Error('Cannot apply patch without a valid project root.');
    }

    return applyProposedPatch(projectRoot, patch);
  });

  ipcMain.handle('agentos:chat-openai', async (_event, payload) => {
    return chatWithOpenAi(payload);
  });
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1100,
    minHeight: 760,
    title: 'AgentOS',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs')
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? 'http://localhost:5173';
  const isDev = !app.isPackaged;

  if (isDev) {
    void window.loadURL(devServerUrl);
    window.webContents.openDevTools({ mode: 'detach' });
  } else {
    void window.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

await loadDotEnv();
registerIpcHandlers();

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
