const {app, BrowserWindow, BrowserView, ipcMain} = require("electron");
const isDev = require("electron-is-dev");
const uuid = require("uuid").v4;

app.allowRendererProcessReuse = true;

//Create Window
const createWindow = () => {
	const win = new BrowserWindow({
		width: 1000,
		minWidth: 1000,
		height: 700,
		minHeight: 700,
		frame: false,
		webPreferences: {
			preload: __dirname + "/appPreload.js"
		}
	});
	if (isDev) win.openDevTools();

	//Create Tabs
	win.tabs = {};

	createTab(win, "https://twitter.com/alleshq", true, true);
	createTab(win, "https://abaer.dev");

	//Load App Page
	win.loadURL(
		isDev ? "http://localhost:3000" : `file://${__dirname}/../build/index.html`
	);

	//Resize
	resizeTabView(win.tabs[Object.keys(win.tabs)[0]], win);
};
app.whenReady().then(createWindow);

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
	if (args[0] === "minimize") {
		BrowserWindow.fromId(args[1]).minimize();
	} else if (args[0] === "maximize") {
		const win = BrowserWindow.fromId(args[1]);
		if (win.isMaximized()) {
			win.unmaximize();
		} else {
			win.maximize();
		}
	} else if (args[0] === "refresh") {
		const tab = getActiveTab(BrowserWindow.fromId(args[1]).tabs);
		tab.webContents.reload();
	} else if (args[0] === "setTab") {
		setActiveTab(BrowserWindow.fromId(args[1]), args[2]);
	}
});

ipcMain.on("synchronous-message", (event, ...args) => {
	if (args[0] === "getTabs") {
		event.returnValue = JSON.stringify(BrowserWindow.fromId(args[1]).tabs);
	}
});

//Resize TabView
const resizeTabView = (tv, win) => {
	tv.setBounds({
		x: 0,
		y: 90,
		width: win.getBounds().width,
		height: win.getBounds().height - 90
	});
};

//Get Active Tab
const getActiveTab = (tabs) => {
	const tabStatus = Object.keys(tabs).map((id) => (tabs[id].active ? 1 : 0));
	const activeId = Object.keys(tabs)[tabStatus.indexOf(1)];
	const active = tabs[activeId];
	active.tabId = activeId;
	return active;
};

//Set Active Tab
const setActiveTab = (win, tabId) => {
	//Make Previous Tab Inactive
	const previousActiveTab = getActiveTab(win.tabs);
	win.removeBrowserView(previousActiveTab);
	previousActiveTab.active = false;
	const id = previousActiveTab.tabId;
	delete previousActiveTab.id;
	win.tabs[id] = previousActiveTab;

	//Make Tab Active
	const tab = win.tabs[tabId];
	tab.active = true;
	win.addBrowserView(tab);
	win.tabs[tabId] = tab;

	//Resize Tab
	resizeTabView(tab, win);

	//Update UI
	win.webContents.send(
		"asynchronous-message",
		"tabUpdate",
		JSON.stringify(win.tabs)
	);
};

//Create Tab
const createTab = (win, url, active, first) => {
	const tab = new BrowserView();
	const id = uuid();
	resizeTabView(tab, win);
	tab.title = url;
	tab.icon = "https://alleshq.com/a00.png";
	if (first) {
		tab.active = true;
		win.addBrowserView(tab);
	}
	tab.webContents.loadURL(url);
	win.tabs[id] = tab;

	//On Resize
	win.on("resize", () => {
		resizeTabView(tab, win);
	});

	//Make tab active
	if (!first && active) {
		setActiveTab(win, id);
	} else {
		win.webContents.send("tabUpdate", JSON.stringify(win.tabs));
	}
};
