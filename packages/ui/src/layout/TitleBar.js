import React from "react";
import Tab from "./Tab";

export default ({tabs}) => (
	<div className="titleBar">
		<div className="left">
			<div className="tabs">
				{Object.keys(tabs).map(id => (
					<Tab key={id} id={id} {...tabs[id]} />
				))}
				{Object.keys(tabs).length < 10 ? (
					<div
						className="new"
						onClick={() => window.app.newTab()}
						onContextMenu={window.app.newWindow}
					>
						<i className="material-icons">add</i>
					</div>
				) : (
					<></>
				)}
			</div>
		</div>
		<div className="right">
			<img
				className="user"
				draggable="false"
				alt=""
				src="https://avatar.alles.cx/u/archie"
			/>
		</div>
	</div>
);
