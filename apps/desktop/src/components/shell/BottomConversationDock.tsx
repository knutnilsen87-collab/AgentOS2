import type { QuickAction, UiDisplayProfile, UiPhase, WorkspaceThread } from '@agentos/shared-types';

interface Props {
  projectName: string;
  phase: UiPhase;
  profile: UiDisplayProfile;
  thread: WorkspaceThread;
  quickActions: QuickAction[];
  placeholder: string;
}

export function BottomConversationDock({ projectName, phase, profile, thread, quickActions, placeholder }: Props) {
  return (
    <section className="bottom-conversation-dock">
      <div className="dock-context-strip">
        <span>Project: {projectName}</span>
        <span>Thread: {thread.title}</span>
        <span>Phase: {phase}</span>
        <span>Profile: {profile}</span>
      </div>

      <div className="dock-chip-row">
        {quickActions.map((action) => (
          <button key={action.id} type="button" className="dock-chip">{action.label}</button>
        ))}
      </div>

      <div className="dock-thread-preview">
        {thread.messages.slice(-2).map((message) => (
          <div key={message.id} className="dock-thread-line">
            <strong>{message.role}</strong>
            <span>{message.text}</span>
          </div>
        ))}
      </div>

      <div className="dock-input-row">
        <textarea rows={3} className="dock-input" placeholder={placeholder} />
        <button type="button" className="dock-send-button">Send</button>
      </div>
    </section>
  );
}
