const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getData: () => ipcRenderer.invoke('get-data'),
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
  closeApp: () => ipcRenderer.invoke('close-app'),
});