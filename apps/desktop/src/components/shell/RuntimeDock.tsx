interface Props {
  nodeVersion?: string;
  electronVersion?: string;
  chromeVersion?: string;
  appVersion: string;
  sandboxStatus: string;
  writePolicy: string;
  shellPolicy: string;
}

export function RuntimeDock({ nodeVersion, electronVersion, chromeVersion, appVersion, sandboxStatus, writePolicy, shellPolicy }: Props) {
  return (
    <footer className="runtime-dock">
      <span>Runtime dock</span>
      <span>AgentOS: {appVersion}</span>
      <span>Node: {nodeVersion ?? 'n/a'}</span>
      <span>Electron: {electronVersion ?? 'n/a'}</span>
      <span>Chrome: {chromeVersion ?? 'n/a'}</span>
      <span>Sandbox: {sandboxStatus}</span>
      <span>Writes: {writePolicy}</span>
      <span>Shell: {shellPolicy}</span>
    </footer>
  );
}
