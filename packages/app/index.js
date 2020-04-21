const {app, BrowserWindow, ipcMain, screen, session} = require("electron");
const isDev = require("electron-is-dev");
const axios = require("axios");
const registerProtocol = require("./protocol");
const {
	resizeTabView,
	getActiveTab,
	setActiveTab,
	createTab,
	updateTabs
} = require("./tabs");

const apiUrl = `${
	isDev ? "http://localhost" : "https://hydrogen.alles.cx"
}/api/v1`;
app.allowRendererProcessReuse = true;

//Create Window
const createWindow = maximized => {
	const {width, height} = screen.getPrimaryDisplay().workAreaSize;
	const win = new BrowserWindow({
		width: maximized ? width : 1000,
		height: maximized ? height : 700,
		minWidth: 1000,
		minHeight: 700,
		webPreferences: {
			preload: __dirname + "/preloads/uiPreload.js"
		},
		title: "Hydrogen"
	});
	win.removeMenu();

	//Create Tabs
	win.tabs = {};
	createTab(win, "https://veev.cc/", true, true);
	resizeTabView(win.tabs[Object.keys(win.tabs)[0]], win);

	//Load App Page
	win.loadURL(
		isDev ? "http://localhost:5164" : `file://${__dirname}/app/build/index.html`
	);

	//On Resize
	win.on("resize", () => {
		const tab = getActiveTab(win.tabs);
		resizeTabView(tab, win);
	});
};
app.whenReady().then(() => {
	createWindow(true);
	registerProtocol();
});

//End process on windows closed
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

//macOS activate
app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

//IPC
ipcMain.on("asynchronous-message", (event, ...args) => {
	if (args[0] === "app.refresh") {
		const tab = getActiveTab(BrowserWindow.fromId(args[1]).tabs);
		tab.webContents.reload();
	} else if (args[0] === "app.setTab") {
		setActiveTab(BrowserWindow.fromId(args[1]), args[2]);
	} else if (args[0] === "app.newTab") {
		createTab(
			BrowserWindow.fromId(args[1]),
			args[2] ? args[2] : "https://veev.cc/",
			true
		);
	} else if (args[0] === "app.closeTab") {
		const win = BrowserWindow.fromId(args[1]);
		const active = getActiveTab(win.tabs).tabId;

		if (Object.keys(win.tabs).length <= 1) return win.close();

		if (active === args[2]) {
			const activeIndex = Object.keys(win.tabs).indexOf(active);
			setActiveTab(
				win,
				Object.keys(win.tabs)[activeIndex > 0 ? activeIndex - 1 : 1]
			);
		}

		win.tabs[args[2]].destroy();
		delete win.tabs[args[2]];
		updateTabs(win);
	} else if (args[0] === "app.navInput") {
		const win = BrowserWindow.fromId(args[1]);
		const tab = getActiveTab(win.tabs);
		handleNavInput(win, tab, args[2]);
	} else if (args[0] === "app.back") {
		const tab = getActiveTab(BrowserWindow.fromId(args[1]).tabs);
		tab.webContents.goBack();
	} else if (args[0] === "app.forward") {
		const tab = getActiveTab(BrowserWindow.fromId(args[1]).tabs);
		tab.webContents.goForward();
	} else if (args[0] === "app.newWindow") {
		createWindow(false);
	} else if (args[0] === "tab.updateMeta") {
		const win = BrowserWindow.fromId(args[1]);
		const tab = win.tabs[args[2]];
		const meta = JSON.parse(args[3]);
		if (!tab) return;

		tab.title = meta.title.trim() ? meta.title.trim() : meta.url;
		tab.url = meta.url;
		tab.icon = meta.icon;
		tab.color = meta.color;

		updateTabs(win);
	}
});

ipcMain.on("synchronous-message", (event, ...args) => {
	if (args[0] === "app.getTabs") {
		event.returnValue = JSON.stringify(BrowserWindow.fromId(args[1]).tabs);
	}
});

//Blocking
const {ElectronBlocker} = require("@cliqz/adblocker-electron");
const fetch = require("cross-fetch");
ElectronBlocker.fromLists(fetch, ["https://easylist.to/easylist/easylist.txt"])
	.then(blocker => {
		blocker.enableBlockingInSession(session.fromPartition("tabs"));
	})
	.catch(() => {
		console.log("Ad Blocker failed.");
	});

//Nav Input
const handleNavInput = async (win, tab, value) => {
	value = value.trim();
	if (value.startsWith("h:")) {
		const cmd = value.replace("h:", "").split(" ");
		if (cmd[0] === "dev") {
			tab.webContents.openDevTools();
		} else if (cmd[0] === "duplicate") {
			createTab(win, tab.url, true);
		}
	} else {
		const url = value.startsWith("!!")
			? value.substr(2)
			: (await axios.get(`${apiUrl}/to/${encodeURIComponent(value)}`)).data;
		tab.webContents.loadURL(url);
	}
};
