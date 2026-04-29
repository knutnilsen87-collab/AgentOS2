import type { ProjectSummary, VerificationCheck, WorkspaceThread } from '@agentos/shared-types';
import type { RailSection } from '../../lib/view-models';

interface Props {
  sections: RailSection[];
  projectSummary: ProjectSummary | null;
  thread: WorkspaceThread;
  checks: VerificationCheck[];
}

export function RightRail({ sections, projectSummary, thread, checks }: Props) {
  return (
    <aside className="right-rail-shell">
      {sections.includes('approvalCompact') ? (
        <section className="content-card rail-card compact-rail-card">
          <p className="eyebrow">Approval</p>
          <h3>{thread.plan?.approvalMode ?? 'edit-with-approval'}</h3>
          <p className="muted-copy">Review-first by default. Permanent changes should never feel casual.</p>
        </section>
      ) : null}

      {sections.includes('evidenceCompact') ? (
        <section className="content-card rail-card compact-rail-card">
          <p className="eyebrow">Evidence</p>
          <h3>{projectSummary ? 'Project evidence available' : 'Waiting for project evidence'}</h3>
          <p className="muted-copy">This rail expands as work becomes riskier or more review-heavy.</p>
        </section>
      ) : null}

      {sections.includes('candidateFiles') && projectSummary?.entryPoints?.length ? (
        <section className="content-card rail-card">
          <p className="eyebrow">Candidate files</p>
          <ul className="simple-link-list">
            {projectSummary.entryPoints.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
      ) : null}

      {sections.includes('reviewFindings') ? (
        <section className="content-card rail-card">
          <p className="eyebrow">Findings</p>
          {thread.reviewPackage?.findings.length ? (
            <ul className="simple-link-list">
              {thread.reviewPackage.findings.map((finding) => <li key={finding.id}>{finding.title}</li>)}
            </ul>
          ) : (
            <p className="muted-copy">No concrete findings yet. This stays compact until there is something real to review.</p>
          )}
        </section>
      ) : null}

      {sections.includes('verification') ? (
        <section className="content-card rail-card">
          <p className="eyebrow">Verification status</p>
          <ul className="simple-link-list">
            {checks.map((check) => <li key={check.id}>{check.label}: {check.status}</li>)}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}
