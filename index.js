const {app, BrowserWindow} = require("electron");
app.allowRendererProcessReuse = true;

const createWindow = () => {
	const mainWindow = new BrowserWindow({
    width: 1000,
    minWidth: 1000,
    height: 700,
    minHeight: 700,
		webPreferences: {
			preload: __dirname + "/preload.js",
		},
	});
}
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
