import { contextBridge, ipcRenderer } from 'electron'

const api = {
  getVersion: (): Promise<string> => {
    return ipcRenderer.invoke('app:getVersion')
  },
}

contextBridge.exposeInMainWorld('api', api)