const {
	app,
	BrowserWindow,
	BrowserView,
	ipcMain,
	screen,
	session
} = require("electron");
const isDev = require("electron-is-dev");
const uuid = require("uuid").v4;
const axios = require("axios");
const registerProtocol = require("./protocol");

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
		frame: false,
		webPreferences: {
			preload: __dirname + "/appPreload.js"
		},
		title: "Hydrogen"
	});

	//Create Tabs
	win.tabs = {};
	createTab(win, "https://veev.cc/", true, true);
	resizeTabView(win.tabs[Object.keys(win.tabs)[0]], win);

	//Load App Page
	win.loadURL(
		!isDev ? "http://localhost:5164" : `file://${__dirname}/app/build/index.html`
	);

	//Window Movement
	setInterval(() => {
		if (win.moving) {
			const mousePos = screen.getCursorScreenPoint();
			const x = mousePos.x - win.moving[0];
			const y = mousePos.y - win.moving[1];
			win.setPosition(x, y);
		}
	}, 10);

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
	} else if (args[0] === "app.startWindowMove") {
		const win = BrowserWindow.fromId(args[1]);
		if (!win.isMaximized()) win.moving = JSON.parse(args[2]);
	} else if (args[0] === "app.endWindowMove") {
		const win = BrowserWindow.fromId(args[1]);
		delete win.moving;
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
const getActiveTab = tabs => {
	const tabStatus = Object.keys(tabs).map(id => (tabs[id].active ? 1 : 0));
	const activeId = Object.keys(tabs)[tabStatus.indexOf(1)];
	const active = tabs[activeId];
	active.tabId = activeId;
	return active;
};

//Set Active Tab
const setActiveTab = (win, tabId) => {
	if (!win) return;
	const tab = win.tabs[tabId];
	if (!tab) return;

	//Make Previous Tab Inactive
	const previousActiveTab = getActiveTab(win.tabs);
	win.removeBrowserView(previousActiveTab);
	previousActiveTab.active = false;

	//Make Tab Active
	tab.active = true;
	win.addBrowserView(tab);

	//Resize Tab
	resizeTabView(tab, win);

	//Update UI
	updateTabs(win);
};

//Create Tab
const createTab = (win, url, active, first) => {
	//Create BrowserView
	const tab = new BrowserView({
		webPreferences: {
			preload: __dirname + "/tabPreload.js",
			partition: "tabs"
		}
	});
	const id = uuid();
	tab.webContents.tabId = id;
	resizeTabView(tab, win);

	//Hacky User Agent Thing
	const ua = tab.webContents.userAgent;
	tab.webContents.userAgent =
		ua.substr(0, ua.indexOf(")")) + "; rv:74.0) Gecko/20100101 Firefox/74.0";

	//Inital Meta
	tab.title = url;
	tab.icon = null;
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
const updateTabs = win => {
	win.webContents.send(
		"asynchronous-message",
		"app.updateTabs",
		JSON.stringify(win.tabs)
	);
};

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
		const url = (await axios.get(`${apiUrl}/to/${encodeURIComponent(value)}`))
			.data;
		tab.webContents.loadURL(url);
	}
};
