import type { KeyboardEvent } from 'react';
import type { QuickAction, UiDisplayProfile, UiPhase, WorkspaceThread } from '@agentos/shared-types';

interface Props {
  projectName: string;
  phase: UiPhase;
  profile: UiDisplayProfile;
  thread: WorkspaceThread;
  quickActions: QuickAction[];
  placeholder: string;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onQuickAction: (intent: string) => void;
}

export function BottomConversationDock({
  projectName,
  phase,
  profile,
  thread,
  quickActions,
  placeholder,
  draft,
  onDraftChange,
  onSend,
  onQuickAction
}: Props) {
  const guided = profile === 'guided';
  const visibleQuickActions = guided ? quickActions.slice(0, 2) : quickActions;

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      onSend();
    }
  }

  return (
    <section className="bottom-conversation-dock">
      <div className="dock-context-strip">
        <span>Project: {projectName}</span>
        <span>Phase: {phase}</span>
        {!guided ? <span>Thread: {thread.title}</span> : null}
        {!guided ? <span>Profile: {profile}</span> : null}
      </div>

      <div className="dock-chip-row">
        {visibleQuickActions.map((action) => (
          <button key={action.id} type="button" className="dock-chip" onClick={() => onQuickAction(action.intent)}>{action.label}</button>
        ))}
        {guided && quickActions.length > visibleQuickActions.length ? <span className="dock-more-label">More in advanced</span> : null}
      </div>

      {!guided ? <div className="dock-thread-preview">
        {thread.messages.slice(-2).map((message) => (
          <div key={message.id} className="dock-thread-line">
            <strong>{message.role}</strong>
            <span>{message.text}</span>
          </div>
        ))}
      </div> : null}

      <div className="dock-input-row">
        <textarea
          rows={3}
          className="dock-input"
          placeholder={placeholder}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="button" className="dock-send-button" onClick={onSend}>Send</button>
      </div>
    </section>
  );
}
