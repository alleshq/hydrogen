const {ipcRenderer, remote} = require("electron");
const windowId = remote.getCurrentWindow().id;
const tabId = remote.getCurrentWebContents().tabId;

//Hydrogen Object
window.Hydrogen = {};

//Listen for title changes
(() => {
    var oldTitle = "";
    setInterval(() => {
        if (document.title !== oldTitle) {
            oldTitle = document.title;
            ipcRenderer.send("asynchronous-message", "tab.updateTitle", windowId, tabId, document.title);
        }
    }, 100);
})();