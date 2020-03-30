import React, {useState} from "react";
import "./style/index.scss";

import TitleBar from "./layout/TitleBar";
import NavBar from "./layout/NavBar";

export default () => {
	const [tabs, setTabs] = useState(window.app.getTabs());
	window.ontabupdate = setTabs;

	return (
		<div className="app">
			<TitleBar tabs={tabs} />
			<NavBar tabs={tabs} />
		</div>
	);
};
