import React from "react";
import Tab from "./Tab";

export default () => (
	<div className="titleBar">
		<div className="left">
			<img className="logo" alt="" src="h10.svg" />
			<div className="tabs">
				<Tab title="Archie Baer" icon="https://abaer.dev/lines-dark.png" />
				<Tab title="Archie Baer" icon="https://abaer.dev/lines-dark.png" active />
				<Tab title="Archie Baer" icon="https://abaer.dev/lines-dark.png" />
				<Tab title="Archie Baer" icon="https://abaer.dev/lines-dark.png" />
				<Tab title="Archie Baer" icon="https://abaer.dev/lines-dark.png" />
			</div>
		</div>
		<div className="right">
			<img
				className="user"
				draggable="false"
				alt=""
				src="https://avatar.alles.cx/u/archie"
			/>
			<div className="minimize" onClick={window.app.minimize}>
				<i className="material-icons">minimize</i>
			</div>
			<div className="maximize" onClick={window.app.maximize}>
				<i className="material-icons">fullscreen</i>
			</div>
			<div className="close" onClick={window.close}>
				<i className="material-icons">close</i>
			</div>
		</div>
	</div>
);
