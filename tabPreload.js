const {ipcRenderer, remote} = require("electron");
const windowId = remote.getCurrentWindow().id;
const tabId = remote.getCurrentWebContents().tabId;

//Hydrogen Object
window.Hydrogen = {};

//Listen for meta changes
(() => {
	var meta = {};
	setInterval(() => {
		const title = document.title;
		const url = location.href;
		const iconLink = document.querySelector("link[rel='shortcut icon']");
		const icon = iconLink ? iconLink.href : null;

		if (meta.title !== title || meta.url !== url || meta.icon !== icon) {
			meta.title = title;
			meta.url = url;
			meta.icon = icon;

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
