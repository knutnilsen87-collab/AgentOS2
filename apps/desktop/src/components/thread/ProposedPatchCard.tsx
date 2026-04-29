import type { ProposedPatch } from '@agentos/shared-types';

interface Props {
  patches: ProposedPatch[];
  onProposePatch: () => void;
  onApplyPatch: (patch: ProposedPatch) => void;
  onDiscardPatch: (patch: ProposedPatch) => void;
}

export function ProposedPatchCard({ patches, onProposePatch, onApplyPatch, onDiscardPatch }: Props) {
  return (
    <section className="content-card">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Proposed patch</p>
          <h3>Review before apply</h3>
        </div>
      </div>

      {patches.length ? (
        <ul className="patch-list">
          {patches.map((patch) => (
            <li key={patch.id} className={`patch-item patch-item--${patch.status}`}>
              <div>
                <strong>{patch.title}</strong>
                <span>{patch.targetPath} · {patch.status}</span>
              </div>
              <pre>{patch.afterText}</pre>
              {patch.status === 'proposed' ? (
                <div className="artifact-actions">
                  <button type="button" className="button-primary" onClick={() => onApplyPatch(patch)}>Apply artifact patch</button>
                  <button type="button" className="button-secondary" onClick={() => onDiscardPatch(patch)}>Discard</button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted-copy">No patch proposed yet. Phase-one apply is limited to AgentOS-owned artifact files.</p>
      )}

      <div className="artifact-actions">
        <button type="button" className="button-secondary" onClick={onProposePatch}>Propose status artifact</button>
      </div>
    </section>
  );
}
