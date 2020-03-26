const {ipcRenderer, remote} = require("electron");
const windowId = remote.getCurrentWindow().id;
const tabId = remote.getCurrentWebContents().tabId;

//Hydrogen Object
window.Hydrogen = {};

//Listen for meta changes
(() => {
	var meta = {};
	setInterval(() => {
		const urlData = new URL(location.href);

		const title = document.title;
		const url = location.href;
		const iconElem = document.querySelector("link[rel='shortcut icon']");
		const icon = iconElem ? iconElem.href : urlData.origin + "/favicon.ico";
		const colorElem = document.querySelector("meta[name='theme-color']");
		const color = colorElem ? colorElem.content : null;

		if (
			meta.title !== title ||
			meta.url !== url ||
			meta.icon !== icon ||
			meta.color !== color
		) {
			meta = {
				title,
				url,
				icon,
				color
			};

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
