import type { ApprovalMode, UiDisplayProfile } from '@agentos/shared-types';

interface Props {
  prompt: string;
  approvalMode: ApprovalMode;
  profile: UiDisplayProfile;
  onPromptChange: (value: string) => void;
  onGeneratePlan: () => void;
  onReadOnlyFirst: () => void;
  onNarrowScope: () => void;
}

export function MissionComposer({
  prompt,
  approvalMode,
  profile,
  onPromptChange,
  onGeneratePlan,
  onReadOnlyFirst,
  onNarrowScope
}: Props) {
  return (
    <section className="content-card mission-composer">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Mission</p>
          <h3>What do you want to achieve?</h3>
        </div>
        <span className="composer-mode-chip">{profile} · {approvalMode}</span>
      </div>
      <p className="muted-copy">Describe the goal, not the full solution. AgentOS will turn it into a reviewable thread with a plan and evidence.</p>
      <textarea value={prompt} onChange={(event) => onPromptChange(event.target.value)} rows={5} className="mission-textarea" />
      <div className="example-chip-row">
        <span className="example-chip">Fix desktop startup</span>
        <span className="example-chip">Analyze this repo and suggest the MVP path</span>
        <span className="example-chip">Create the safest next implementation plan</span>
      </div>
      <div className="composer-actions">
        <button type="button" className="button-primary" onClick={onGeneratePlan}>Generate plan</button>
        <button type="button" className="button-secondary" onClick={onReadOnlyFirst}>Read-only first</button>
        <button type="button" className="button-secondary" onClick={onNarrowScope}>Narrow scope</button>
      </div>
    </section>
  );
}
