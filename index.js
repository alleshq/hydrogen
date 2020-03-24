const {app, BrowserWindow} = require("electron");
const isDev = require("electron-is-dev");
app.allowRendererProcessReuse = true;

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 1000,
		minWidth: 1000,
		height: 700,
		minHeight: 700,
		frame: false,
		webPreferences: {
			preload: __dirname + "/preload.js",
		},
	});

	mainWindow.loadURL(
		isDev ? "http://localhost:3000" : `file://${__dirname}/../build/index.html`
	);
};
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
