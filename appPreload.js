const {ipcRenderer} = require("electron");

window.app = {
    minimize: () => ipcRenderer.send("asynchronous-message", "app.minimize"),
    maximize: () => ipcRenderer.send("asynchronous-message", "app.maximize")
};