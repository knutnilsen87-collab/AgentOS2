import { useEffect, useMemo, useState } from 'react';
import type {
  ApprovalMode,
  CommandRunResult,
  ProjectSummary,
  ProposedPatch,
  ReviewPackage,
  TaskRecord,
  ThreadMessage,
  UiDisplayProfile,
  UiPhase,
  VerificationCheck,
  VerificationCommand,
  WorkspaceThread
} from '@agentos/shared-types';
import { buildPhaseOnePlan, buildSeedThread, buildSeedVerification } from '@agentos/task-engine';
import { defaultApprovalMode, defaultPrompt, defaultProfile, seedQuickActions } from './lib/seed-data';
import { buildCurrentState, getCenterSectionsForPhase, getChatPlaceholder, getRightRailSectionsForPhase } from './lib/view-models';
import { TopStatusBar } from './components/shell/TopStatusBar';
import { ProjectSidebar } from './components/left-rail/ProjectSidebar';
import { HeroMissionCard } from './components/thread/HeroMissionCard';
import { ProjectScanSummaryCard } from './components/thread/ProjectScanSummaryCard';
import { MissionComposer } from './components/thread/MissionComposer';
import { ConstraintStrip } from './components/thread/ConstraintStrip';
import { ThreadTimeline } from './components/thread/ThreadTimeline';
import { PlanCard } from './components/thread/PlanCard';
import { ReviewCard } from './components/thread/ReviewCard';
import { VerificationCard } from './components/thread/VerificationCard';
import { ProposedPatchCard } from './components/thread/ProposedPatchCard';
import { RightRail } from './components/right-rail/RightRail';
import { BottomConversationDock } from './components/shell/BottomConversationDock';
import { RuntimeDock } from './components/shell/RuntimeDock';

interface ProjectOpenResult {
  summary: ProjectSummary;
  tasks: TaskRecord[];
}

interface OpenAiChatResult {
  text: string;
  model: string;
  responseId: string | null;
}

interface AgentOsBridge {
  platform: string;
  versions: {
    node: string;
    electron: string;
    chrome: string;
  };
  loadLastProject: () => Promise<ProjectOpenResult | null>;
  selectProject: () => Promise<ProjectOpenResult | null>;
  scanProject: (rootPath: string) => Promise<ProjectOpenResult>;
  listTaskRecords: (projectRoot: string) => Promise<TaskRecord[]>;
  saveTaskRecord: (projectRoot: string, record: TaskRecord) => Promise<string>;
  runVerificationCommand: (projectRoot: string, command: VerificationCommand) => Promise<CommandRunResult>;
  applyProposedPatch: (projectRoot: string, patch: ProposedPatch) => Promise<ProposedPatch>;
  chatWithOpenAI: (payload: {
    message: string;
    phase: UiPhase;
    approvalMode: ApprovalMode;
    projectSummary: ProjectSummary | null;
    thread: WorkspaceThread;
  }) => Promise<OpenAiChatResult>;
}

declare global {
  interface Window {
    agentos?: AgentOsBridge;
  }
}

function projectNameFromPath(rootPath?: string): string {
  if (!rootPath) return 'No project connected';
  return rootPath.split(/[\\/]/).filter(Boolean).at(-1) ?? rootPath;
}

function taskId() {
  return `task-${Date.now().toString(36)}`;
}

function appendMessage(thread: WorkspaceThread, text: string, kind: 'message' | 'plan' | 'review' | 'verification' = 'message'): WorkspaceThread {
  return {
    ...thread,
    messages: [
      ...thread.messages,
      {
        id: `${thread.id}-${Date.now().toString(36)}`,
        role: 'agent',
        kind,
        text,
        createdAt: new Date().toISOString()
      }
    ]
  };
}

function buildStatusArtifact(record: TaskRecord): ProposedPatch {
  const createdAt = new Date().toISOString();
  return {
    id: `patch-${Date.now().toString(36)}`,
    title: 'Write task status artifact',
    targetPath: `.agentos/artifacts/${record.id}-status.md`,
    status: 'proposed',
    beforeText: '',
    afterText: [
      '# AgentOS Task Status',
      '',
      `- Task: ${record.id}`,
      `- Prompt: ${record.prompt}`,
      `- Status: ${record.status}`,
      `- Phase: ${record.phase ?? 'unknown'}`,
      `- Risk: ${record.risk ?? 'unknown'}`,
      `- Updated: ${createdAt}`,
      ''
    ].join('\n'),
    createdAt
  };
}

function createThreadFromRecord(record: TaskRecord, projectSummary: ProjectSummary | null): WorkspaceThread {
  return {
    id: record.id,
    title: record.summary ?? record.prompt,
    phase: record.phase ?? 'plan',
    status: record.status,
    risk: record.risk ?? record.plan?.risk ?? 'low',
    plan: record.plan,
    messages: [
      {
        id: `${record.id}-user`,
        role: 'user',
        text: record.prompt,
        createdAt: record.createdAt
      },
      {
        id: `${record.id}-agent`,
        role: 'agent',
        kind: record.plan ? 'plan' : 'message',
        text: record.plan?.nextAction ?? 'Saved task loaded from local AgentOS state.',
        createdAt: record.updatedAt
      }
    ],
    reviewPackage: record.reviewPackage ?? {
      summary: 'Review package is waiting for execution evidence. The plan is saved and ready for operator review.',
      touchedFiles: [],
      commandLog: [],
      findings: []
    },
    verificationChecks: record.verificationChecks ?? buildSeedVerification(projectSummary ?? undefined)
  };
}

export function App() {
  const [profile, setProfile] = useState<UiDisplayProfile>(defaultProfile);
  const [phase, setPhase] = useState<UiPhase>('onboarding');
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>(defaultApprovalMode);
  const [projectSummary, setProjectSummary] = useState<ProjectSummary | null>(null);
  const [recentTasks, setRecentTasks] = useState<TaskRecord[]>([]);
  const [thread, setThread] = useState<WorkspaceThread>(buildSeedThread(defaultPrompt, defaultApprovalMode));
  const [chatDraft, setChatDraft] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [currentRecord, setCurrentRecord] = useState<TaskRecord | null>(null);
  const [runtimeMessage, setRuntimeMessage] = useState('Open a project to start the golden path.');

  const centerSections = useMemo(() => getCenterSectionsForPhase(phase, profile), [phase, profile]);
  const rightSections = useMemo(() => getRightRailSectionsForPhase(phase, profile), [phase, profile]);
  const currentState = buildCurrentState(projectSummary, phase, thread);
  const placeholder = getChatPlaceholder(phase);
  const projectName = projectNameFromPath(projectSummary?.rootPath);
  const sandboxStatus = 'Policy-gated, not OS-isolated';
  const writePolicy = 'Review required; no silent apply';
  const shellPolicy = 'No free shell; whitelist only';

  function appendChatMessage(role: ThreadMessage['role'], text: string, kind: ThreadMessage['kind'] = 'message') {
    const message: ThreadMessage = {
      id: `chat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      role,
      kind,
      text,
      createdAt: new Date().toISOString()
    };

    setThread((current) => ({
      ...current,
      messages: [...current.messages, message]
    }));
  }

  async function sendChatMessage(text = chatDraft) {
    const trimmed = text.trim();
    if (!trimmed || chatSending) return;

    appendChatMessage('user', trimmed);
    setChatDraft('');
    setChatSending(true);

    try {
      if (!window.agentos?.chatWithOpenAI) {
        throw new Error('OpenAI bridge is unavailable. Restart the desktop app after updating.');
      }

      const result = await window.agentos.chatWithOpenAI({
        message: trimmed,
        phase,
        approvalMode,
        projectSummary,
        thread
      });
      appendChatMessage('agent', result.text);
      setRuntimeMessage(`OpenAI response received from ${result.model}.`);
    } catch (error) {
      const lower = trimmed.toLowerCase();
      const fallback = lower.includes('verify') || lower.includes('verif')
        ? 'OpenAI chat failed, but the message was registered. Next safe step is verification: run a whitelisted check and keep evidence visible before done.'
        : lower.includes('plan') || lower.includes('scope')
          ? 'OpenAI chat failed, but the message was registered. Use the plan as the reviewable decision point before execution.'
          : `OpenAI chat failed: ${error instanceof Error ? error.message : 'unknown error'}`;

      appendChatMessage('agent', fallback, lower.includes('verify') || lower.includes('verif') ? 'verification' : 'message');
      setRuntimeMessage(`OpenAI chat failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    } finally {
      setChatSending(false);
    }
  }

  useEffect(() => {
    let alive = true;

    async function loadLastProject() {
      if (!window.agentos) return;
      let result: ProjectOpenResult | null = null;
      try {
        result = await window.agentos.loadLastProject();
      } catch (error) {
        if (alive) setRuntimeMessage(`Could not reopen last project: ${error instanceof Error ? error.message : 'unknown error'}`);
        return;
      }
      if (!alive || !result) return;

      setProjectSummary(result.summary);
      setRecentTasks(result.tasks);

      const latestTask = result.tasks[0];
      if (latestTask) {
        setCurrentRecord(latestTask);
        setSelectedTaskId(latestTask.id);
        setThread(createThreadFromRecord(latestTask, result.summary));
        setPrompt(latestTask.prompt);
        setApprovalMode(latestTask.approvalMode);
        setPhase(latestTask.phase ?? 'plan');
        setRuntimeMessage(`Reopened ${latestTask.id} from ${projectNameFromPath(result.summary.rootPath)}.`);
      } else {
        setThread(buildSeedThread(prompt, approvalMode, result.summary));
        setPhase('projectSummary');
        setRuntimeMessage(`Reopened ${projectNameFromPath(result.summary.rootPath)}. No saved tasks yet.`);
      }
    }

    void loadLastProject();
    return () => {
      alive = false;
    };
  }, []);

  async function persistRecord(record: TaskRecord, nextThread: WorkspaceThread, nextPhase: UiPhase, message: string) {
    setCurrentRecord(record);
    setThread(nextThread);
    setSelectedTaskId(record.id);
    setApprovalMode(record.approvalMode);
    setPhase(nextPhase);
    setRecentTasks((current) => [record, ...current.filter((task) => task.id !== record.id)]);

    if (projectSummary?.rootPath && window.agentos) {
      try {
        await window.agentos.saveTaskRecord(projectSummary.rootPath, record);
        const tasks = await window.agentos.listTaskRecords(projectSummary.rootPath);
        setRecentTasks(tasks);
      } catch (error) {
        setRuntimeMessage(`Save failed: ${error instanceof Error ? error.message : 'unknown error'}`);
        return;
      }
    }

    setRuntimeMessage(message);
  }

  async function openProject() {
    if (!window.agentos) {
      setRuntimeMessage('Electron bridge is unavailable. Launch through the desktop app to open projects.');
      return;
    }

    setRuntimeMessage('Waiting for local project selection...');
    let result: ProjectOpenResult | null = null;
    try {
      result = await window.agentos.selectProject();
    } catch (error) {
      setRuntimeMessage(`Project scan failed: ${error instanceof Error ? error.message : 'unknown error'}`);
      return;
    }
    if (!result) {
      setRuntimeMessage('Project selection cancelled.');
      return;
    }

    setProjectSummary(result.summary);
    setRecentTasks(result.tasks.length ? result.tasks : []);
    setSelectedTaskId(null);
    setCurrentRecord(null);
    setThread(buildSeedThread(prompt, approvalMode, result.summary));
    setPhase('projectSummary');
    setRuntimeMessage(`Scanned ${result.summary.estimatedFileCount} files read-only.`);
  }

  function newThread() {
    setPrompt(defaultPrompt);
    setSelectedTaskId(null);
    setCurrentRecord(null);
    setThread(buildSeedThread(defaultPrompt, approvalMode, projectSummary ?? undefined));
    setPhase(projectSummary ? 'missionCompose' : 'onboarding');
    setRuntimeMessage(projectSummary ? 'Ready for a new mission.' : 'Connect a project before creating a mission.');
  }

  async function generatePlan(nextApprovalMode = approvalMode, nextPrompt = prompt) {
    const trimmedPrompt = nextPrompt.trim();
    if (!trimmedPrompt) {
      setRuntimeMessage('Mission text is required before AgentOS can generate a plan.');
      return;
    }

    const plan = buildPhaseOnePlan(trimmedPrompt, nextApprovalMode, projectSummary ?? undefined);
    const now = new Date().toISOString();
    const record: TaskRecord = {
      id: taskId(),
      prompt: trimmedPrompt,
      status: 'planned',
      approvalMode: nextApprovalMode,
      createdAt: now,
      updatedAt: now,
      summary: plan.objective,
      phase: 'plan',
      risk: plan.risk,
      projectRoot: projectSummary?.rootPath,
      plan,
      reviewPackage: {
        summary: 'Plan generated. No files have been changed. Review approval and risk before any execution step.',
        touchedFiles: [],
        commandLog: ['Generated plan locally from mission input.'],
        findings: []
      },
      verificationChecks: buildSeedVerification(projectSummary ?? undefined),
      proposedPatches: []
    };

    const nextThread = createThreadFromRecord(record, projectSummary);
    setApprovalMode(nextApprovalMode);
    setCurrentRecord(record);
    setThread(nextThread);
    setSelectedTaskId(record.id);
    setRecentTasks((current) => [record, ...current.filter((task) => task.id !== record.id)]);
    setPhase('plan');

    if (projectSummary?.rootPath && window.agentos) {
      try {
        await window.agentos.saveTaskRecord(projectSummary.rootPath, record);
        const tasks = await window.agentos.listTaskRecords(projectSummary.rootPath);
        setRecentTasks(tasks);
        setRuntimeMessage(`Saved ${record.id} to .agentos/tasks.`);
      } catch (error) {
        setRuntimeMessage(`Plan created but save failed: ${error instanceof Error ? error.message : 'unknown error'}`);
      }
    } else {
      setRuntimeMessage('Plan created in memory. Connect a project to persist task history.');
    }
  }

  function selectTask(task: TaskRecord) {
    setSelectedTaskId(task.id);
    setCurrentRecord(task);
    setThread(createThreadFromRecord(task, projectSummary));
    setPrompt(task.prompt);
    setApprovalMode(task.approvalMode);
    setPhase(task.phase ?? 'plan');
    setRuntimeMessage(`Loaded ${task.id} from recent task history.`);
  }

  async function approvePlan() {
    if (!currentRecord) {
      setRuntimeMessage('Generate a plan before approving it.');
      return;
    }

    const now = new Date().toISOString();
    const nextReviewPackage: ReviewPackage = {
      summary: 'Plan approved for read-only verification. No write/apply operation has been authorized.',
      touchedFiles: currentRecord.reviewPackage?.touchedFiles ?? [],
      commandLog: [...(currentRecord.reviewPackage?.commandLog ?? []), 'Operator approved plan for read-only verification.'],
      findings: currentRecord.reviewPackage?.findings ?? []
    };
    const nextRecord: TaskRecord = {
      ...currentRecord,
      status: 'needs-review',
      phase: 'review',
      updatedAt: now,
      reviewPackage: nextReviewPackage
    };
    const nextThread = appendMessage(createThreadFromRecord(nextRecord, projectSummary), 'Plan approved. Review package is ready for verification.', 'review');
    await persistRecord(nextRecord, nextThread, 'review', `Approved ${nextRecord.id} for review.`);
  }

  async function requestRework() {
    if (!currentRecord) {
      setRuntimeMessage('No active task to rework.');
      return;
    }

    const now = new Date().toISOString();
    const nextRecord: TaskRecord = {
      ...currentRecord,
      status: 'planned',
      phase: 'plan',
      updatedAt: now,
      reviewPackage: {
        summary: 'Operator requested rework. Narrow scope or adjust the mission before verification.',
        touchedFiles: currentRecord.reviewPackage?.touchedFiles ?? [],
        commandLog: [...(currentRecord.reviewPackage?.commandLog ?? []), 'Operator requested rework.'],
        findings: [
          ...(currentRecord.reviewPackage?.findings ?? []),
          {
            id: `finding-${Date.now().toString(36)}`,
            title: 'Rework requested',
            detail: 'The operator asked for a safer or clearer plan before continuing.',
            severity: 'warning'
          }
        ]
      }
    };
    const nextThread = appendMessage(createThreadFromRecord(nextRecord, projectSummary), 'Rework requested. Return to plan and narrow the task.', 'review');
    await persistRecord(nextRecord, nextThread, 'plan', `Rework requested for ${nextRecord.id}.`);
  }

  function verificationChecksFromRun(run: CommandRunResult, scanPassed: boolean): VerificationCheck[] {
    const labelByCommand: Record<VerificationCommand, string> = {
      typecheck: 'Workspace typecheck',
      build: 'Workspace build',
      test: 'Smoke tests'
    };

    return [
      {
        id: 'scan',
        label: 'Project scan',
        status: scanPassed ? 'pass' : 'fail',
        detail: scanPassed ? `${projectSummary?.estimatedFileCount ?? 0} files scanned read-only.` : 'No project scan is available.'
      },
      {
        id: 'plan',
        label: 'Plan review',
        status: 'pass',
        detail: 'Operator approved a reviewable plan before verification.'
      },
      {
        id: run.command,
        label: labelByCommand[run.command],
        status: run.status,
        detail: run.status === 'pass'
          ? `${labelByCommand[run.command]} completed successfully.`
          : `${labelByCommand[run.command]} failed with exit code ${run.exitCode ?? 'unknown'}.`
      }
    ];
  }

  async function runReadOnlyVerification(command: VerificationCommand = 'typecheck') {
    if (!currentRecord) {
      setRuntimeMessage('Generate a task before running verification.');
      return;
    }
    if (!projectSummary?.rootPath || !window.agentos) {
      setRuntimeMessage('Connect a project before running verification.');
      return;
    }

    const startedAt = new Date().toISOString();
    const runningRecord: TaskRecord = {
      ...currentRecord,
      status: 'running',
      phase: 'execution',
      updatedAt: startedAt,
      reviewPackage: {
        summary: `Running approved read-only verification command: ${command}.`,
        touchedFiles: currentRecord.reviewPackage?.touchedFiles ?? [],
        commandLog: [...(currentRecord.reviewPackage?.commandLog ?? []), `Running verification: ${command}`],
        findings: currentRecord.reviewPackage?.findings ?? []
      }
    };
    await persistRecord(runningRecord, appendMessage(createThreadFromRecord(runningRecord, projectSummary), `Read-only verification started: ${command}.`, 'verification'), 'execution', `Running ${command}...`);

    let run: CommandRunResult;
    try {
      run = await window.agentos.runVerificationCommand(projectSummary.rootPath, command);
    } catch (error) {
      run = {
        command,
        status: 'fail',
        exitCode: null,
        startedAt,
        finishedAt: new Date().toISOString(),
        output: [error instanceof Error ? error.message : 'Verification command failed before it could run.']
      };
    }
    const finishedAt = new Date().toISOString();
    const checks = verificationChecksFromRun(run, true);
    const commandLog = [
      ...(runningRecord.reviewPackage?.commandLog ?? []),
      `Finished ${run.command}: ${run.status} (${run.finishedAt})`,
      ...run.output
    ];
    const nextRecord: TaskRecord = {
      ...runningRecord,
      status: run.status === 'pass' ? 'needs-review' : 'failed',
      phase: 'verification',
      updatedAt: finishedAt,
      reviewPackage: {
        summary: run.status === 'pass'
          ? 'Verification passed. The task can be marked done because the visible checks are green.'
          : 'Verification failed. Review command evidence before continuing.',
        touchedFiles: [],
        commandLog,
        findings: run.status === 'pass'
          ? []
          : [{
              id: `finding-${Date.now().toString(36)}`,
              title: 'Verification failed',
              detail: `${run.command} failed with exit code ${run.exitCode ?? 'unknown'}.`,
              severity: 'critical'
            }]
      },
      verificationChecks: checks
    };
    const nextThread = appendMessage(createThreadFromRecord(nextRecord, projectSummary), nextRecord.reviewPackage?.summary ?? 'Verification finished.', 'verification');
    await persistRecord(nextRecord, nextThread, 'verification', `Verification ${run.status} for ${nextRecord.id}.`);
  }

  async function markDone() {
    if (!currentRecord) {
      setRuntimeMessage('No task is active.');
      return;
    }

    const checks = currentRecord.verificationChecks ?? [];
    if (!checks.length || checks.some((check) => check.status !== 'pass')) {
      setRuntimeMessage('AgentOS will not mark done until all visible verification checks pass.');
      return;
    }

    const now = new Date().toISOString();
    const nextRecord: TaskRecord = {
      ...currentRecord,
      status: 'done',
      phase: 'verification',
      updatedAt: now,
      reviewPackage: {
        summary: 'Task marked done after all visible verification checks passed.',
        touchedFiles: currentRecord.reviewPackage?.touchedFiles ?? [],
        commandLog: [...(currentRecord.reviewPackage?.commandLog ?? []), 'Operator marked task done after verification.'],
        findings: currentRecord.reviewPackage?.findings ?? []
      }
    };
    const nextThread = appendMessage(createThreadFromRecord(nextRecord, projectSummary), 'Task marked done with visible verification basis.', 'verification');
    await persistRecord(nextRecord, nextThread, 'verification', `${nextRecord.id} marked done.`);
  }

  async function proposeStatusPatch() {
    if (!currentRecord) {
      setRuntimeMessage('Generate or load a task before proposing a patch.');
      return;
    }

    const patch = buildStatusArtifact(currentRecord);
    const now = new Date().toISOString();
    const nextRecord: TaskRecord = {
      ...currentRecord,
      updatedAt: now,
      phase: 'review',
      status: 'needs-review',
      proposedPatches: [patch, ...(currentRecord.proposedPatches ?? [])],
      reviewPackage: {
        summary: 'A proposed artifact patch is ready for review. It is limited to .agentos/artifacts.',
        touchedFiles: [patch.targetPath],
        commandLog: [...(currentRecord.reviewPackage?.commandLog ?? []), `Proposed artifact patch: ${patch.targetPath}`],
        findings: currentRecord.reviewPackage?.findings ?? []
      }
    };
    const nextThread = appendMessage(createThreadFromRecord(nextRecord, projectSummary), `Proposed patch: ${patch.targetPath}`, 'review');
    await persistRecord(nextRecord, nextThread, 'review', `Proposed ${patch.id}.`);
  }

  async function applyPatch(patch: ProposedPatch) {
    if (!currentRecord || !projectSummary?.rootPath || !window.agentos) {
      setRuntimeMessage('Connect a project and load a task before applying a patch.');
      return;
    }

    let appliedPatch: ProposedPatch;
    try {
      appliedPatch = await window.agentos.applyProposedPatch(projectSummary.rootPath, patch);
    } catch (error) {
      setRuntimeMessage(`Apply blocked: ${error instanceof Error ? error.message : 'unknown error'}`);
      return;
    }

    const now = new Date().toISOString();
    const patches = (currentRecord.proposedPatches ?? []).map((item) => item.id === patch.id ? appliedPatch : item);
    const nextRecord: TaskRecord = {
      ...currentRecord,
      updatedAt: now,
      phase: 'review',
      status: 'needs-review',
      proposedPatches: patches,
      reviewPackage: {
        summary: 'Artifact patch applied. Run verification before marking done.',
        touchedFiles: Array.from(new Set([...(currentRecord.reviewPackage?.touchedFiles ?? []), appliedPatch.targetPath])),
        commandLog: [...(currentRecord.reviewPackage?.commandLog ?? []), `Applied artifact patch: ${appliedPatch.targetPath}`],
        findings: currentRecord.reviewPackage?.findings ?? []
      }
    };
    const nextThread = appendMessage(createThreadFromRecord(nextRecord, projectSummary), `Applied artifact patch: ${appliedPatch.targetPath}`, 'review');
    await persistRecord(nextRecord, nextThread, 'review', `Applied ${appliedPatch.id}.`);
  }

  async function discardPatch(patch: ProposedPatch) {
    if (!currentRecord) return;

    const now = new Date().toISOString();
    const discardedPatch: ProposedPatch = { ...patch, status: 'discarded' };
    const patches = (currentRecord.proposedPatches ?? []).map((item) => item.id === patch.id ? discardedPatch : item);
    const nextRecord: TaskRecord = {
      ...currentRecord,
      updatedAt: now,
      proposedPatches: patches,
      reviewPackage: {
        summary: 'Proposed patch discarded by operator.',
        touchedFiles: currentRecord.reviewPackage?.touchedFiles ?? [],
        commandLog: [...(currentRecord.reviewPackage?.commandLog ?? []), `Discarded proposed patch: ${patch.targetPath}`],
        findings: currentRecord.reviewPackage?.findings ?? []
      }
    };
    const nextThread = appendMessage(createThreadFromRecord(nextRecord, projectSummary), `Discarded proposed patch: ${patch.targetPath}`, 'review');
    await persistRecord(nextRecord, nextThread, 'review', `Discarded ${patch.id}.`);
  }

  return (
    <div className={`app-shell app-shell--${profile}`}>
      <TopStatusBar
        projectName={projectName}
        phase={phase}
        approvalMode={approvalMode}
        risk={thread.risk}
        profile={profile}
        onToggleProfile={() => setProfile((current) => (current === 'guided' ? 'advanced' : 'guided'))}
      />

      <main className="workspace-layout">
        <ProjectSidebar
          projectName={projectName}
          selectedTaskId={selectedTaskId}
          recentTasks={recentTasks}
          onNewThread={newThread}
          onOpenProject={() => void openProject()}
          onSelectTask={selectTask}
        />

        <section className="center-canvas">
          {centerSections.includes('hero') ? (
            <HeroMissionCard title={currentState.title} body={currentState.body} nextAction={thread.plan?.nextAction ?? runtimeMessage} />
          ) : null}

          {centerSections.includes('missionInput') ? (
            <MissionComposer
              prompt={prompt}
              approvalMode={approvalMode}
              profile={profile}
              onPromptChange={setPrompt}
              onGeneratePlan={() => void generatePlan()}
              onReadOnlyFirst={() => void generatePlan('read-only', `Read-only first: ${prompt}`)}
              onNarrowScope={() => setPrompt((current) => `${current}\n\nConstrain scope to the smallest safe project slice.`)}
            />
          ) : null}

          {centerSections.includes('constraints') ? <ConstraintStrip profile={profile} /> : null}
          {centerSections.includes('projectScanSummary') ? <ProjectScanSummaryCard projectSummary={projectSummary} /> : null}
          {centerSections.includes('plan') ? (
            <PlanCard
              plan={thread.plan}
              onApprovePlan={() => void approvePlan()}
              onRequestRework={() => void requestRework()}
              onRunVerification={(command) => void runReadOnlyVerification(command)}
            />
          ) : null}
          {centerSections.includes('review') ? (
            <ReviewCard
              reviewPackage={thread.reviewPackage}
              onRunVerification={(command) => void runReadOnlyVerification(command)}
              onRequestRework={() => void requestRework()}
            />
          ) : null}
          {centerSections.includes('patch') ? (
            <ProposedPatchCard
              patches={currentRecord?.proposedPatches ?? []}
              onProposePatch={() => void proposeStatusPatch()}
              onApplyPatch={(patch) => void applyPatch(patch)}
              onDiscardPatch={(patch) => void discardPatch(patch)}
            />
          ) : null}
          {centerSections.includes('verification') ? (
            <VerificationCard
              checks={thread.verificationChecks ?? []}
              onMarkDone={() => void markDone()}
              onRunVerification={(command) => void runReadOnlyVerification(command)}
            />
          ) : null}
          {centerSections.includes('thread') ? <ThreadTimeline thread={thread} /> : null}
        </section>

        <RightRail sections={rightSections} projectSummary={projectSummary} thread={thread} checks={thread.verificationChecks ?? []} />
      </main>

      <BottomConversationDock
        projectName={projectName}
        phase={phase}
        profile={profile}
        thread={thread}
        quickActions={seedQuickActions}
        placeholder={placeholder}
        draft={chatDraft}
        onDraftChange={setChatDraft}
        onSend={() => void sendChatMessage()}
        onQuickAction={(intent) => void sendChatMessage(intent)}
        isSending={chatSending}
      />

      <RuntimeDock
        appVersion={__AGENTOS_VERSION__}
        nodeVersion={window.agentos?.versions.node}
        electronVersion={window.agentos?.versions.electron}
        chromeVersion={window.agentos?.versions.chrome}
        sandboxStatus={sandboxStatus}
        writePolicy={writePolicy}
        shellPolicy={shellPolicy}
      />
    </div>
  );
}
