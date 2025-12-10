const { contextBridge, ipcRenderer } = require("electron");
const { screen } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getCursorPos: () => ipcRenderer.invoke("getCursorPos"),
});
