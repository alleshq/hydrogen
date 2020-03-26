export default (tabs) => {
	const tabStatus = Object.keys(tabs).map((id) => (tabs[id].active ? 1 : 0));
	const activeId = Object.keys(tabs)[tabStatus.indexOf(1)];
	const active = tabs[activeId];
	active.tabId = activeId;
	return active;
};
