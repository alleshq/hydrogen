const {ipcRenderer, remote} = require("electron");
const windowId = remote.getCurrentWindow().id

window.ontabupdate = () => {};
ipcRenderer.on("asynchronous-message", (event, ...args) => {
	if (args[0] === "tabUpdate") {
		window.ontabupdate(JSON.parse(args[1]));
	}
});

window.app = {
	windowId,
	minimize: () => ipcRenderer.send("asynchronous-message", "app.minimize", windowId),
	maximize: () => ipcRenderer.send("asynchronous-message", "app.maximize", windowId),
	refresh: () => ipcRenderer.send("asynchronous-message", "app.refresh", windowId),
	getTabs: () => JSON.parse(ipcRenderer.sendSync("synchronous-message",  "getTabs", windowId))
};