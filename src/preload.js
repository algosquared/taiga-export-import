import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('taigaExport', {
	fetchAttachment: (url) => ipcRenderer.invoke('fetch-attachment', { url })
});
