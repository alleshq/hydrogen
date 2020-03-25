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

	//Load App Page
	win.loadURL(
		isDev ? "http://localhost:3000" : `file://${__dirname}/../build/index.html`
	);

	//Create Tabs
	win.tabs = {};
	const tab = new BrowserView();
	win.setBrowserView(tab);
	resizeTabView(tab, win);
	tab.title = "Homepage";
	tab.icon = "https://alleshq.com/a00.png";
	tab.active = true;
	tab.webContents.loadURL("https://twitter.com");
	win.tabs[uuid()] = tab;

	//On Resize
	win.on("resize", () => {
		resizeTabView(tab, win);
	});
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
const getActiveTab = tabs => {
	const tabStatus = Object.keys(tabs).map(id => tabs[id].active ? 1 : 0);
	const activeId = Object.keys(tabs)[tabStatus.indexOf(1)];
	const active = tabs[activeId];
	active.id = activeId;
	return active;
};