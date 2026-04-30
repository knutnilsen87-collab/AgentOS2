import type { TaskRecord } from '@agentos/shared-types';

interface Props {
  projectName: string;
  selectedTaskId: string | null;
  recentTasks: readonly TaskRecord[];
  onNewThread: () => void;
  onOpenProject: () => void;
  onSelectTask: (task: TaskRecord) => void;
}

export function ProjectSidebar({ projectName, selectedTaskId, recentTasks, onNewThread, onOpenProject, onSelectTask }: Props) {
  return (
    <aside className="left-rail">
      <div className="left-rail-section">
        <button className="primary-rail-button" type="button" onClick={onNewThread}>+ New thread</button>
        <button className="secondary-rail-button" type="button" onClick={onOpenProject}>Open project</button>
      </div>

      <div className="left-rail-section">
        <p className="rail-label">Projects</p>
        <div className="project-card project-card--active">
          <strong>{projectName}</strong>
          <span>Current local workspace</span>
        </div>
      </div>

      <div className="left-rail-section">
        <p className="rail-label">Recent threads</p>
        <ul className="thread-list">
          {recentTasks.map((task) => (
            <li key={task.id} className={task.id === selectedTaskId ? 'thread-item thread-item--active' : 'thread-item'}>
              <button type="button" className="thread-item-button" onClick={() => onSelectTask(task)}>
                <strong>{task.summary ?? task.prompt}</strong>
                <span>{task.phase ?? 'missionCompose'} · {task.status}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <details className="left-rail-section workspace-tools">
        <summary className="rail-label">Workspace tools</summary>
        <ul className="simple-link-list quiet-link-list">
          <li>Routines</li>
          <li>Memories</li>
          <li>Policies</li>
          <li>Verification history</li>
        </ul>
      </details>
    </aside>
  );
}
