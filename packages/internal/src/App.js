import React from "react";
import "./style/index.scss";
import Home from "./pages/home";

const Router = () => {
	switch (window.location.hostname) {
		case "home":
			return <Home />;
		default:
			return <Home />;
	}
};

export default () => (
	<div className="app">
		<Router />
	</div>
);
