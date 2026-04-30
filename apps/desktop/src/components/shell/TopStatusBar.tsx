import type { ApprovalMode, TaskRiskLevel, UiDisplayProfile, UiPhase } from '@agentos/shared-types';
import { StatusPill } from '../shared/StatusPill';

interface Props {
  projectName: string;
  phase: UiPhase;
  approvalMode: ApprovalMode;
  risk: TaskRiskLevel;
  profile: UiDisplayProfile;
  theme: 'dark' | 'light';
  onToggleProfile: () => void;
  onToggleTheme: () => void;
}

export function TopStatusBar({ projectName, phase, approvalMode, risk, profile, theme, onToggleProfile, onToggleTheme }: Props) {
  const riskTone = risk === 'high' ? 'danger' : risk === 'medium' ? 'warning' : 'success';
  const showRisk = risk !== 'low';

  return (
    <header className="top-status-bar">
      <div>
        <p className="eyebrow">AgentOS</p>
        <h1>Mission workspace</h1>
        <p className="top-subtitle">Plan, review, verify.</p>
      </div>
      <div className="top-status-pills">
        <StatusPill tone="accent">Project: {projectName}</StatusPill>
        <StatusPill>Phase: {phase}</StatusPill>
        {showRisk ? <StatusPill tone={riskTone}>Risk: {risk}</StatusPill> : null}
        <button className="profile-toggle" onClick={onToggleProfile} type="button">
          {profile === 'guided' ? 'Guided mode' : 'Advanced mode'}
        </button>
        <button className="profile-toggle" onClick={onToggleTheme} type="button">
          {theme === 'light' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </header>
  );
}
