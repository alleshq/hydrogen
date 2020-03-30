import React from "react";
import "./style/index.scss";

import {
	BrowserRouter as Router,
	Switch,
	Route
} from "react-router-dom";

import home from "./pages/home";

export default () => (
	<div className="app">
		<Router>
			<Switch>
				<Route path="/home" children={home} />
			</Switch>
		</Router>
	</div>
);
