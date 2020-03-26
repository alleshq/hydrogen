const {ipcRenderer, remote} = require("electron");
const windowId = remote.getCurrentWindow().id;
const tabId = remote.getCurrentWebContents().tabId;

//Hydrogen Object
window.Hydrogen = {};

//Listen for meta changes
(() => {
	var meta = {title: "", url: ""};
	setInterval(() => {
		if (
			document.title !== meta.title ||
			location.href !== meta.url
		) {
			meta.title = document.title;
			meta.url = location.href;
			ipcRenderer.send(
				"asynchronous-message",
				"tab.updateMeta",
				windowId,
				tabId,
				JSON.stringify(meta)
			);
		}
	}, 100);
})();
