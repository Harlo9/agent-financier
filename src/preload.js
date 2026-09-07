const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  sendMessage: (messages) => ipcRenderer.invoke('chat-message', messages),
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  triggerReport: () => ipcRenderer.invoke('trigger-report'),
  onWeeklyReport: (cb) => ipcRenderer.on('weekly-report', (_, data) => cb(data)),
  onOpenSettings: (cb) => ipcRenderer.on('open-settings', () => cb())
})
