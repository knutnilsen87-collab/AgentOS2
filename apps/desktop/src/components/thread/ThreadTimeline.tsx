import type { WorkspaceThread } from '@agentos/shared-types';

interface Props {
  thread: WorkspaceThread;
}

export function ThreadTimeline({ thread }: Props) {
  return (
    <section className="content-card">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Active thread</p>
          <h3>{thread.title}</h3>
        </div>
      </div>
      <div className="thread-timeline">
        {thread.messages.map((message) => (
          <article key={message.id} className={`thread-event thread-event--${message.role}`}>
            <div className="thread-event-meta">
              <strong>{message.role}</strong>
              <span>{message.kind ?? 'message'}</span>
            </div>
            <p>{message.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
