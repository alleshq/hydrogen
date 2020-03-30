import {BrowserView} from "electron";
import {v4 as uuid} from "uuid";

//Resize TabView
export const resizeTabView = (tv, win) => {
	tv.setBounds({
		x: 0,
		y: 90,
		width: win.getBounds().width,
		height: win.getBounds().height - 90
	});
};

//Get Active Tab
export const getActiveTab = tabs => {
	const tabStatus = Object.keys(tabs).map(id => (tabs[id].active ? 1 : 0));
	const activeId = Object.keys(tabs)[tabStatus.indexOf(1)];
	const active = tabs[activeId];
	active.tabId = activeId;
	return active;
};

//Set Active Tab
export const setActiveTab = (win, tabId) => {
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
export const createTab = (win, url, active, first = false) => {
	//Create BrowserView
	const tab = new BrowserView({
		webPreferences: {
			preload: __dirname + "/../../preloads/tabPreload.js",
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
export const updateTabs = win => {
	win.webContents.send(
		"asynchronous-message",
		"app.updateTabs",
		JSON.stringify(win.tabs)
	);
};
