export type ApprovalMode =
  | 'read-only'
  | 'propose-only'
  | 'edit-with-approval'
  | 'trusted-auto'
  | 'routine';

export type TaskRiskLevel = 'low' | 'medium' | 'high';
export type TaskStatus = 'draft' | 'planned' | 'running' | 'needs-review' | 'done' | 'failed';
export type VerificationCommand = 'typecheck' | 'build' | 'test';
export type UiDisplayProfile = 'guided' | 'advanced';
export type UiPhase =
  | 'onboarding'
  | 'projectSummary'
  | 'missionCompose'
  | 'plan'
  | 'execution'
  | 'review'
  | 'verification';

export interface PlanStep {
  id: string;
  title: string;
  detail?: string;
}

export interface TaskPlan {
  objective: string;
  approvalMode: ApprovalMode;
  risk: TaskRiskLevel;
  steps: PlanStep[];
  assumptions?: string[];
  nextAction?: string;
}

export interface ProjectSummary {
  rootPath: string;
  manifests: string[];
  languages: string[];
  estimatedFileCount: number;
  entryPoints?: string[];
  warnings?: string[];
}

export interface ThreadMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  kind?: 'message' | 'plan' | 'review' | 'verification';
  text: string;
  createdAt: string;
}

export interface VerificationCheck {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'pending';
  detail: string;
}

export interface ReviewFinding {
  id: string;
  title: string;
  detail: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface ReviewPackage {
  summary: string;
  touchedFiles: string[];
  commandLog: string[];
  findings: ReviewFinding[];
}

export interface CommandRunResult {
  command: VerificationCommand;
  status: 'pass' | 'fail';
  exitCode: number | null;
  startedAt: string;
  finishedAt: string;
  output: string[];
}

export interface ProposedPatch {
  id: string;
  title: string;
  targetPath: string;
  status: 'proposed' | 'applied' | 'discarded';
  beforeText?: string;
  afterText: string;
  createdAt: string;
  appliedAt?: string;
}

export interface TaskRecord {
  id: string;
  prompt: string;
  status: TaskStatus;
  approvalMode: ApprovalMode;
  createdAt: string;
  updatedAt: string;
  summary?: string;
  phase?: UiPhase;
  risk?: TaskRiskLevel;
  projectRoot?: string;
  plan?: TaskPlan;
  reviewPackage?: ReviewPackage;
  verificationChecks?: VerificationCheck[];
  proposedPatches?: ProposedPatch[];
}

export interface WorkspaceThread {
  id: string;
  title: string;
  phase: UiPhase;
  status: TaskStatus;
  risk: TaskRiskLevel;
  messages: ThreadMessage[];
  plan?: TaskPlan;
  reviewPackage?: ReviewPackage;
  verificationChecks?: VerificationCheck[];
}

export interface QuickAction {
  id: string;
  label: string;
  intent: string;
}
