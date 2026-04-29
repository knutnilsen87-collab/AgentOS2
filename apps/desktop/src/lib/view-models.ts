import type { ProjectSummary, UiDisplayProfile, UiPhase, WorkspaceThread } from '@agentos/shared-types';

export type CenterSection =
  | 'hero'
  | 'projectScanSummary'
  | 'missionInput'
  | 'constraints'
  | 'thread'
  | 'plan'
  | 'review'
  | 'verification'
  | 'patch';

export type RailSection =
  | 'approvalCompact'
  | 'evidenceCompact'
  | 'candidateFiles'
  | 'reviewFindings'
  | 'verification';

export function getCenterSectionsForPhase(phase: UiPhase, profile: UiDisplayProfile): CenterSection[] {
  const guided = profile === 'guided';
  switch (phase) {
    case 'onboarding':
      return ['hero'];
    case 'projectSummary':
      return ['hero', 'projectScanSummary'];
    case 'missionCompose':
      return guided ? ['hero', 'missionInput', 'constraints', 'projectScanSummary'] : ['hero', 'missionInput', 'constraints', 'projectScanSummary', 'thread'];
    case 'plan':
      return ['hero', 'plan', 'thread'];
    case 'review':
      return ['hero', 'review', 'patch', 'thread'];
    case 'verification':
      return ['hero', 'verification', 'thread'];
    case 'execution':
      return ['hero', 'thread'];
    default:
      return ['hero', 'missionInput'];
  }
}

export function getRightRailSectionsForPhase(phase: UiPhase, profile: UiDisplayProfile): RailSection[] {
  const guided = profile === 'guided';
  switch (phase) {
    case 'onboarding':
      return ['approvalCompact'];
    case 'projectSummary':
      return ['approvalCompact', 'evidenceCompact'];
    case 'missionCompose':
      return guided ? ['approvalCompact', 'evidenceCompact'] : ['approvalCompact', 'evidenceCompact', 'candidateFiles'];
    case 'plan':
      return ['approvalCompact', 'evidenceCompact', 'candidateFiles'];
    case 'review':
      return ['approvalCompact', 'reviewFindings', 'candidateFiles', 'verification'];
    case 'verification':
      return ['approvalCompact', 'verification', 'reviewFindings'];
    case 'execution':
      return ['approvalCompact', 'evidenceCompact', 'candidateFiles'];
    default:
      return ['approvalCompact'];
  }
}

export function getChatPlaceholder(phase: UiPhase): string {
  switch (phase) {
    case 'onboarding':
      return 'Describe what you want to build or fix once a project is connected…';
    case 'missionCompose':
      return 'Describe what you want to achieve, refine scope, or ask AgentOS to explain the current state…';
    case 'plan':
      return 'Revise the plan, narrow scope, or ask why AgentOS chose this path…';
    case 'review':
      return 'Request rework, ask for safer changes, or inspect the evidence…';
    case 'verification':
      return 'Ask what is still unverified or what should happen next…';
    case 'execution':
      return 'Ask what is happening now or tell AgentOS how to continue…';
    default:
      return 'Tell AgentOS what to do next…';
  }
}

export function buildCurrentState(project: ProjectSummary | null, phase: UiPhase, thread: WorkspaceThread) {
  if (!project) {
    return {
      title: 'No project connected yet',
      body: 'Connect a local project first. AgentOS will scan it read-only, build a project summary, and then start a mission thread.'
    };
  }

  const phaseMessages: Record<UiPhase, string> = {
    onboarding: 'A local project is required before mission work begins.',
    projectSummary: 'The project has been scanned and summarized. Choose the next mission.',
    missionCompose: 'The project is ready. Define the mission and generate the next reviewable plan.',
    plan: 'A plan is ready for review. Constrain scope or approve the next step.',
    execution: 'Execution is in progress or simulated. Watch evidence and runtime updates.',
    review: 'A review package is available. Inspect findings before approving anything.',
    verification: 'Verification is the active phase. Check what passed and what still needs proof.'
  };

  return {
    title: thread.title,
    body: phaseMessages[phase]
  };
}
