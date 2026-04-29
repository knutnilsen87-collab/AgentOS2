import type { ApprovalMode, ProjectSummary, TaskPlan, TaskRiskLevel, VerificationCheck, WorkspaceThread } from '@agentos/shared-types';

function riskFromPrompt(prompt: string): TaskRiskLevel {
  const lower = prompt.toLowerCase();
  if (lower.includes('delete') || lower.includes('database') || lower.includes('auth')) return 'high';
  if (lower.includes('refactor') || lower.includes('runtime') || lower.includes('startup')) return 'medium';
  return 'low';
}

export function buildPhaseOnePlan(prompt: string, approvalMode: ApprovalMode, project?: ProjectSummary): TaskPlan {
  const risk = riskFromPrompt(prompt);
  return {
    objective: prompt,
    approvalMode,
    risk,
    assumptions: [
      'Start read-only unless the operator escalates privileges.',
      'Prefer the narrowest scope that can still prove the fix path.',
      'Keep reviewability higher priority than raw automation speed.'
    ],
    nextAction: 'Review the plan, narrow scope if needed, then approve read-only or patch work.',
    steps: [
      { id: 'understand', title: 'Understand current project state', detail: project ? `Use ${project.estimatedFileCount} scanned files and manifest clues.` : 'Scan the local project and identify entry points.' },
      { id: 'scope', title: 'Constrain scope and risk', detail: 'Make affected files and approval boundaries explicit.' },
      { id: 'plan', title: 'Produce a reviewable implementation plan', detail: 'Show steps, assumptions, and blast radius before execution.' },
      { id: 'review', title: 'Collect review artifacts', detail: 'Prepare affected files, evidence, findings, and verification targets.' },
      { id: 'verify', title: 'Verify before apply', detail: 'Do not claim done without visible checks.' }
    ]
  };
}

export function buildSeedThread(prompt: string, approvalMode: ApprovalMode, project?: ProjectSummary): WorkspaceThread {
  const plan = buildPhaseOnePlan(prompt, approvalMode, project);
  const now = new Date().toISOString();
  return {
    id: 'thread-seed-001',
    title: 'Desktop startup recovery',
    phase: project ? 'missionCompose' : 'onboarding',
    status: 'planned',
    risk: plan.risk,
    plan,
    messages: [
      {
        id: 'm1',
        role: 'system',
        text: project
          ? 'Project connected. AgentOS is ready for a mission-driven thread.'
          : 'No project connected yet. Start by connecting a local project or running a health check.',
        createdAt: now
      },
      {
        id: 'm2',
        role: 'agent',
        kind: 'plan',
        text: 'AgentOS will prefer read-only understanding first, then a reviewable plan, then evidence and verification.',
        createdAt: now
      }
    ],
    reviewPackage: {
      summary: 'No review package yet. It appears after the first real plan or execution artifact is produced.',
      touchedFiles: [],
      commandLog: [],
      findings: []
    },
    verificationChecks: buildSeedVerification(project)
  };
}

export function buildSeedVerification(project?: ProjectSummary): VerificationCheck[] {
  return [
    {
      id: 'scan',
      label: 'Project scan',
      status: project ? 'pass' : 'pending',
      detail: project ? `${project.estimatedFileCount} files scanned read-only.` : 'Connect a local project to populate project context.'
    },
    {
      id: 'plan',
      label: 'Plan review',
      status: 'pending',
      detail: 'Generate and review a plan before any permanent file changes.'
    },
    {
      id: 'verify',
      label: 'Verification gate',
      status: 'pending',
      detail: 'Verification results appear after execution or simulation.'
    }
  ];
}
