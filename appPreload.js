const {ipcRenderer, remote} = require("electron");
const windowId = remote.getCurrentWindow().id;

window.ontabupdate = () => {};
ipcRenderer.on("asynchronous-message", (event, ...args) => {
	if (args[0] === "app.updateTabs") {
		window.ontabupdate(JSON.parse(args[1]));
	}
});

window.app = {
	windowId,
	minimize: () =>
		ipcRenderer.send("asynchronous-message", "app.minimize", windowId),
	maximize: () =>
		ipcRenderer.send("asynchronous-message", "app.maximize", windowId),
	refresh: () =>
		ipcRenderer.send("asynchronous-message", "app.refresh", windowId),
	back: () => ipcRenderer.send("asynchronous-message", "app.back", windowId),
	forward: () =>
		ipcRenderer.send("asynchronous-message", "app.forward", windowId),
	getTabs: () =>
		JSON.parse(
			ipcRenderer.sendSync("synchronous-message", "app.getTabs", windowId)
		),
	setTab: tabId =>
		ipcRenderer.send("asynchronous-message", "app.setTab", windowId, tabId),
	newTab: url =>
		ipcRenderer.send("asynchronous-message", "app.newTab", windowId, url),
	newWindow: () => ipcRenderer.send("asynchronous-message", "app.newWindow"),
	closeTab: tabId =>
		ipcRenderer.send("asynchronous-message", "app.closeTab", windowId, tabId),
	navInput: v =>
		ipcRenderer.send("asynchronous-message", "app.navInput", windowId, v),
	startWindowMove: (relX, relY) =>
		ipcRenderer.send(
			"asynchronous-message",
			"app.startWindowMove",
			windowId,
			JSON.stringify([relX, relY])
		),
	endWindowMove: () =>
		ipcRenderer.send("asynchronous-message", "app.endWindowMove", windowId)
};
