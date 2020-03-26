import React from "react";

export default props => (
	<div
		className={`tab ${props.active ? "active" : ""}`}
		onClick={() => window.app.setTab(props.id)}
		style={{
			borderColor: props.active ? (
				props.color ? props.color : "#f70f0f"
			) : undefined
		}}
	>
		{props.icon ? <img src={props.icon} alt="" draggable="false" /> : <></>}
		<h1>{props.title}</h1>
		<i
			className="material-icons close"
			onClick={() => window.app.closeTab(props.id)}
		>
			close
		</i>
	</div>
);
