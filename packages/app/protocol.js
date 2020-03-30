const {protocol, session} = require("electron");
const isDev = require("electron-is-dev");
const axios = require("axios");

//Get Active Tab
const getActiveTab = tabs => {
	const tabStatus = Object.keys(tabs).map(id => (tabs[id].active ? 1 : 0));
	const activeId = Object.keys(tabs)[tabStatus.indexOf(1)];
	const active = tabs[activeId];
	active.tabId = activeId;
	return active;
};

protocol.registerSchemesAsPrivileged([
	{
		scheme: "hydrogen",
		privileges: {
			bypassCSP: true,
			secure: true,
			standard: true,
			supportFetchAPI: true,
			allowServiceWorkers: true,
			corsEnabled: false
		}
	}
]);

module.exports = win => {
	session.fromPartition("tabs").protocol.registerStringProtocol(
		"hydrogen",
		async (request, callback) => {
			const tab = getActiveTab(win.tabs);

			var url = request.url.substr(11);
			if (url.split("/")[1] === "static" || url.endsWith(".js")) {
				url = url.split("/");
				url.shift();
				url = url.join("/");
			}

			const sourceUrl = isDev
				? `http://localhost:5165/home`
				: `file://${__dirname}/internal/build/index.html`;

			tab.webContents.loadURL(sourceUrl);
		},
		error => {
			if (error) console.error(error);
		}
	);
};
