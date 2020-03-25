const {app, BrowserWindow, BrowserView, ipcMain} = require("electron");
const isDev = require("electron-is-dev");
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

	//Load App Page
	win.loadURL(
		isDev ? "http://localhost:3000" : `file://${__dirname}/../build/index.html`
	);

	//Create Tab View
	const tabView = new BrowserView();
	win.setBrowserView(tabView);
	resizeTabView(tabView, win);
	tabView.webContents.loadURL("https://abaer.dev");

	//On Resize
	win.on("resize", () => {
		resizeTabView(tabView, win);
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
	const win = BrowserWindow.getFocusedWindow();

	if (args[0] === "app.minimize" && win) {
		win.minimize();
	} else if (args[0] === "app.maximize" && win) {
		if (win.isMaximized()) {
			win.unmaximize();
		} else {
			win.maximize();
		}
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
