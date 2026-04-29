import type { VerificationCheck, VerificationCommand } from '@agentos/shared-types';

interface Props {
  checks: VerificationCheck[];
  onMarkDone: () => void;
  onRunVerification: (command: VerificationCommand) => void;
}

export function VerificationCard({ checks, onMarkDone, onRunVerification }: Props) {
  const canMarkDone = checks.length > 0 && checks.every((check) => check.status === 'pass');

  return (
    <section className="content-card">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Verification</p>
          <h3>Visible basis for “done”</h3>
        </div>
      </div>
      <ul className="verification-list">
        {checks.map((check) => (
          <li key={check.id} className={`verification-item verification-item--${check.status}`}>
            <div><strong>{check.label}</strong><p>{check.detail}</p></div>
            <span>{check.status}</span>
          </li>
        ))}
      </ul>
      <div className="artifact-actions">
        <button type="button" className="button-primary" onClick={onMarkDone} disabled={!canMarkDone}>Mark done</button>
        <button type="button" className="button-secondary" onClick={() => onRunVerification('typecheck')}>Typecheck</button>
        <button type="button" className="button-secondary" onClick={() => onRunVerification('build')}>Build</button>
        <button type="button" className="button-secondary" onClick={() => onRunVerification('test')}>Smoke tests</button>
      </div>
    </section>
  );
}
