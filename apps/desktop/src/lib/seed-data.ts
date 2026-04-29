import type { ApprovalMode, ProjectSummary, QuickAction, UiDisplayProfile, UiPhase, WorkspaceThread } from '@agentos/shared-types';
import { buildSeedThread } from '@agentos/task-engine';

export const defaultApprovalMode: ApprovalMode = 'edit-with-approval';
export const defaultProfile: UiDisplayProfile = 'guided';
export const defaultPhase: UiPhase = 'missionCompose';
export const defaultPrompt = 'Scan this project, explain the current state, and generate the safest next plan.';

export const seedProjectSummary: ProjectSummary = {
  rootPath: 'C:/Projects/AgentOS',
  manifests: ['package.json', 'apps/desktop/package.json', 'tsconfig.base.json'],
  languages: ['TypeScript', 'PowerShell', 'Markdown'],
  estimatedFileCount: 215,
  entryPoints: ['apps/desktop/src/main.tsx', 'apps/desktop/src/App.tsx', 'apps/desktop/electron/main.mjs'],
  warnings: ['No real sandbox telemetry yet.', 'Diff rendering is still a placeholder in phase 1.']
};

export const seedQuickActions: QuickAction[] = [
  { id: 'explain', label: 'Explain', intent: 'Explain the current plan in simpler language.' },
  { id: 'revise', label: 'Revise plan', intent: 'Revise the current plan with a safer, smaller scope.' },
  { id: 'scope', label: 'Narrow scope', intent: 'Keep work inside the desktop app only.' },
  { id: 'evidence', label: 'Show evidence', intent: 'Show the evidence and findings relevant to this thread.' },
  { id: 'verify', label: 'Run verification', intent: 'Run the current verification step or show what is still unverified.' }
];

export const seedRecentTasks = [
  { id: 'task-001', prompt: 'Fix desktop startup', status: 'needs-review', approvalMode: 'edit-with-approval', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), summary: 'Runtime startup investigation', phase: 'review', risk: 'medium' },
  { id: 'task-002', prompt: 'Analyze repo and propose MVP path', status: 'planned', approvalMode: 'propose-only', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), summary: 'MVP path planning', phase: 'plan', risk: 'low' }
] as const;

export function createSeedThread(projectConnected = true): WorkspaceThread {
  return buildSeedThread(defaultPrompt, defaultApprovalMode, projectConnected ? seedProjectSummary : undefined);
}
