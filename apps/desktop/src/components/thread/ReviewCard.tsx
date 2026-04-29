import type { ReviewPackage, VerificationCommand } from '@agentos/shared-types';

interface Props {
  reviewPackage?: ReviewPackage;
  onRunVerification: (command: VerificationCommand) => void;
  onRequestRework: () => void;
}

export function ReviewCard({ reviewPackage, onRunVerification, onRequestRework }: Props) {
  if (!reviewPackage) return null;
  return (
    <section className="content-card">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Review package</p>
          <h3>Evidence before apply</h3>
        </div>
      </div>
      <p>{reviewPackage.summary}</p>
      <div className="review-grid">
        <div><span className="summary-label">Touched files</span><strong>{reviewPackage.touchedFiles.length}</strong></div>
        <div><span className="summary-label">Command log lines</span><strong>{reviewPackage.commandLog.length}</strong></div>
        <div><span className="summary-label">Findings</span><strong>{reviewPackage.findings.length}</strong></div>
      </div>
      {reviewPackage.commandLog.length ? (
        <div className="command-log-box">
          <p className="eyebrow">Command evidence</p>
          <pre>{reviewPackage.commandLog.join('\n')}</pre>
        </div>
      ) : null}
      {!reviewPackage.findings.length ? <p className="muted-copy">No findings yet. Review artifacts become denser after execution or diff generation.</p> : null}
      <div className="artifact-actions">
        <button type="button" className="button-primary" onClick={() => onRunVerification('typecheck')}>Typecheck</button>
        <button type="button" className="button-secondary" onClick={() => onRunVerification('build')}>Build</button>
        <button type="button" className="button-secondary" onClick={() => onRunVerification('test')}>Smoke tests</button>
        <button type="button" className="button-secondary" onClick={onRequestRework}>Request rework</button>
      </div>
    </section>
  );
}
