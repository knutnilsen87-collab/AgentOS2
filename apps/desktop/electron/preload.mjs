import { contextBridge, ipcRenderer } from 'electron';

const agentosApi = {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    electron: process.versions.electron,
    chrome: process.versions.chrome
  },
  loadLastProject: () => ipcRenderer.invoke('agentos:load-last-project'),
  selectProject: () => ipcRenderer.invoke('agentos:select-project'),
  scanProject: (rootPath) => ipcRenderer.invoke('agentos:scan-project', rootPath),
  listTaskRecords: (projectRoot) => ipcRenderer.invoke('agentos:list-task-records', projectRoot),
  saveTaskRecord: (projectRoot, record) => ipcRenderer.invoke('agentos:save-task-record', projectRoot, record),
  runVerificationCommand: (projectRoot, command) => ipcRenderer.invoke('agentos:run-verification-command', projectRoot, command),
  applyProposedPatch: (projectRoot, patch) => ipcRenderer.invoke('agentos:apply-proposed-patch', projectRoot, patch)
};

contextBridge.exposeInMainWorld('agentos', agentosApi);
