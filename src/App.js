import React from "react";
import "./style/index.scss";

import TitleBar from "./layout/TitleBar";
import NavBar from "./layout/NavBar";

export default () => {
	return (
		<div className="app">
			<TitleBar />
			<NavBar />
		</div>
	);
};
