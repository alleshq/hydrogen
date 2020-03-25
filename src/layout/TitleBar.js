import React from "react";

export default () => (
	<div className="titleBar">
		<div className="left">
			<img className="logo" src="h10.svg" />
		</div>
		<div className="right">
			<img
				className="user"
				draggable="false"
				src="https://avatar.alles.cx/u/archie"
			/>
			<div className="minimize">
				<i className="material-icons">minimize</i>
			</div>
			<div className="maximize">
				<i className="material-icons">fullscreen</i>
			</div>
			<div className="close">
				<i className="material-icons">close</i>
			</div>
		</div>
	</div>
);
