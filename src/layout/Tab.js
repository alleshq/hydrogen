import React from "react";

export default (props) => (
	<div className={`tab ${props.active ? "active" : ""}`}>
		<img src={props.icon} alt="" draggable="false" />
		<h1>{props.title}</h1>
	</div>
);