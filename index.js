const {app, BrowserWindow, BrowserView, ipcMain, screen} = require("electron");
const isDev = require("electron-is-dev");
const uuid = require("uuid").v4;

app.allowRendererProcessReuse = true;

//Create Window
const createWindow = () => {
	const {width, height} = screen.getPrimaryDisplay().workAreaSize;
	const win = new BrowserWindow({
		width,
		height,
		minWidth: 1000,
		minHeight: 700,
		frame: false,
		webPreferences: {
			preload: __dirname + "/appPreload.js"
		}
	});

	//Create Tabs
	win.tabs = {};

	createTab(win, "https://twitter.com/alleshq", true, true);

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
	if (args[0] === "app.minimize") {
		BrowserWindow.fromId(args[1]).minimize();
	} else if (args[0] === "app.maximize") {
		const win = BrowserWindow.fromId(args[1]);
		if (win.isMaximized()) {
			win.unmaximize();
		} else {
			win.maximize();
		}
	} else if (args[0] === "app.refresh") {
		const tab = getActiveTab(BrowserWindow.fromId(args[1]).tabs);
		tab.webContents.reload();
	} else if (args[0] === "app.setTab") {
		setActiveTab(BrowserWindow.fromId(args[1]), args[2]);
	} else if (args[0] === "app.newTab") {
		createTab(BrowserWindow.fromId(args[1]), "https://veev.cc", true);
	} else if (args[0] === "app.goTo") {
		const tab = getActiveTab(BrowserWindow.fromId(args[1]).tabs);
		const url = args[2];
		tab.webContents.loadURL(url);
	} else if (args[0] === "tab.updateMeta") {
		const win = BrowserWindow.fromId(args[1]);
		const tab = win.tabs[args[2]];
		const meta = JSON.parse(args[3]);
		tab.title = meta.title;
		tab.url = meta.url;
		updateTabs(win);
	}
});

ipcMain.on("synchronous-message", (event, ...args) => {
	if (args[0] === "app.getTabs") {
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

	//Make Tab Active
	const tab = win.tabs[tabId];
	tab.active = true;
	win.addBrowserView(tab);

	//Resize Tab
	resizeTabView(tab, win);

	//Update UI
	updateTabs(win);
};

//Create Tab
const createTab = (win, url, active, first) => {
	//Create Tab
	const tab = new BrowserView({
		webPreferences: {
			preload: __dirname + "/tabPreload.js"
		}
	});
	const id = uuid();
	tab.webContents.tabId = id;

	//Resize
	resizeTabView(tab, win);

	//Custom UA
	tab.webContents.userAgent = "Hydrogen";

	//Inital Meta
	tab.title = url;
	tab.icon = "https://alleshq.com/a00.png";
	tab.url = url;

	//If first, make active
	if (first) {
		tab.active = true;
		win.addBrowserView(tab);
	}

	//Load URL
	tab.webContents.loadURL(url);

	//Add to tabs object
	win.tabs[id] = tab;

	//Open dev tools
	if (isDev) tab.webContents.openDevTools();

	//On Resize
	win.on("resize", () => {
		resizeTabView(tab, win);
	});

	//On new tab
	tab.webContents.addListener("new-window", (e, url) => {
		createTab(win, url, true);
	});

	//Make tab active
	if (!first && active) {
		setActiveTab(win, id);
	} else {
		win.webContents.send("tabUpdate", JSON.stringify(win.tabs));
	}
};

//Update Tabs
const updateTabs = (win) => {
	win.webContents.send(
		"asynchronous-message",
		"app.updateTabs",
		JSON.stringify(win.tabs)
	);
};
