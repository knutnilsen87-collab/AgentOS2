import type { TaskPlan, VerificationCommand } from '@agentos/shared-types';

interface Props {
  plan?: TaskPlan;
  onApprovePlan: () => void;
  onRequestRework: () => void;
  onRunVerification: (command: VerificationCommand) => void;
}

export function PlanCard({ plan, onApprovePlan, onRequestRework, onRunVerification }: Props) {
  if (!plan) return null;
  return (
    <section className="content-card">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Plan</p>
          <h3>Review before execution</h3>
        </div>
      </div>
      <ol className="plan-list">
        {plan.steps.map((step) => (
          <li key={step.id}>
            <strong>{step.title}</strong>
            {step.detail ? <p>{step.detail}</p> : null}
          </li>
        ))}
      </ol>
      {plan.assumptions?.length ? (
        <div className="assumptions-box">
          <p className="eyebrow">Assumptions</p>
          <ul>{plan.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
        </div>
      ) : null}
      <div className="artifact-actions">
        <button type="button" className="button-primary" onClick={onApprovePlan}>Approve plan</button>
        <button type="button" className="button-secondary" onClick={() => onRunVerification('typecheck')}>Run read-only verification</button>
        <button type="button" className="button-secondary" onClick={onRequestRework}>Request rework</button>
      </div>
    </section>
  );
}
