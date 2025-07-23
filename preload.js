const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  closeApp: () => ipcRenderer.invoke('close-app'),
  findRoku: () => ipcRenderer.invoke('find-roku'),
});
