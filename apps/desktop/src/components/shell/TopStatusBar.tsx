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
  const nextTheme = theme === 'light' ? 'dark' : 'light';

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
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          type="button"
          aria-label={`Switch to ${nextTheme} mode`}
          title={`Switch to ${nextTheme} mode`}
        >
          <span className="theme-toggle-label">{theme === 'light' ? 'Light' : 'Dark'}</span>
          <span className="theme-toggle-icon" aria-hidden="true">
            {theme === 'light' ? (
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M21 12.8A8.5 8.5 0 0 1 11.2 3a7 7 0 1 0 9.8 9.8Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" focusable="false">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
              </svg>
            )}
          </span>
        </button>
      </div>
    </header>
  );
}
