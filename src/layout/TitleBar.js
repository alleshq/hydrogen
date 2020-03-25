import React, {useState} from "react";
import Tab from "./Tab";

export default () => {
	const [tabs, setTabs] = useState(window.app.getTabs());
	window.ontabupdate = setTabs;

	return (
		<div className="titleBar">
			<div className="left">
				<img className="logo" draggable="false" alt="" src="h10.svg" />
				<div className="tabs">
					{Object.keys(tabs).map((id) => (
						<Tab key={id} id={id} {...tabs[id]} />
					))}
					{Object.keys(tabs).length < 10 ? (
						<div className="new" onClick={window.app.newTab}>
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
};
