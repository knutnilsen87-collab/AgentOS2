interface Props {
  title: string;
  body: string;
  nextAction: string;
}

export function HeroMissionCard({ title, body, nextAction }: Props) {
  return (
    <section className="hero-card">
      <div>
        <p className="eyebrow">Current state</p>
        <h2>{title}</h2>
        <p className="hero-copy">{body}</p>
      </div>
      <div className="next-action-box">
        <p className="eyebrow">Next action</p>
        <strong>{nextAction}</strong>
      </div>
    </section>
  );
}
