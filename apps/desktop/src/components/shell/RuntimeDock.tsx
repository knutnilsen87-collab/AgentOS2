interface Props {
  nodeVersion?: string;
  electronVersion?: string;
  chromeVersion?: string;
  appVersion: string;
}

export function RuntimeDock({ nodeVersion, electronVersion, chromeVersion, appVersion }: Props) {
  return (
    <footer className="runtime-dock">
      <span>Runtime dock</span>
      <span>AgentOS: {appVersion}</span>
      <span>Node: {nodeVersion ?? 'n/a'}</span>
      <span>Electron: {electronVersion ?? 'n/a'}</span>
      <span>Chrome: {chromeVersion ?? 'n/a'}</span>
      <span>Status: local-first / review-first</span>
    </footer>
  );
}
