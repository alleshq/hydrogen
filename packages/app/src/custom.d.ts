declare namespace Electron {
	export interface BrowserWindow {
		tabs: Object;
		moving?: boolean;
	}

	export interface WebContents {
		tabId?: string;
	}

	export interface BrowserView {
		title: string;
		icon: string | null;
		url: string;
		active: boolean;
	}
}
