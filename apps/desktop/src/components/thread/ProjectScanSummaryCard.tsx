import type { ProjectSummary } from '@agentos/shared-types';

interface Props {
  projectSummary: ProjectSummary | null;
}

export function ProjectScanSummaryCard({ projectSummary }: Props) {
  if (!projectSummary) return null;
  return (
    <section className="content-card compact-card">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Project scan summary</p>
          <h3>Read-only understanding before action</h3>
        </div>
      </div>
      <div className="summary-grid">
        <div><span className="summary-label">Files scanned</span><strong>{projectSummary.estimatedFileCount}</strong></div>
        <div><span className="summary-label">Manifest clues</span><strong>{projectSummary.manifests.length}</strong></div>
        <div><span className="summary-label">Languages</span><strong>{projectSummary.languages.join(', ')}</strong></div>
      </div>
      <p className="muted-copy">Likely entry points: {projectSummary.entryPoints?.join(', ') ?? 'Not yet detected'}.</p>
    </section>
  );
}
