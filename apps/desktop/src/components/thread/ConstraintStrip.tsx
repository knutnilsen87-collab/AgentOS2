interface Props {
  profile: 'guided' | 'advanced';
}

export function ConstraintStrip({ profile }: Props) {
  return (
    <section className="constraint-strip">
      <span>Scope: desktop app only</span>
      <span>Approval: edit-with-approval</span>
      <span>Allowed tools: scanner, planner, task-store</span>
      {profile === 'advanced' ? <span>Roles: planner, reviewer, runtime guard</span> : null}
    </section>
  );
}
