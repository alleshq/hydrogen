import React, {useState, useEffect} from "react";

export default props => {
	const [showIcon, setShowIcon] = useState(true);

	useEffect(() => setShowIcon(true), [props.icon]);

	return (
		<div
			className={`tab ${props.active ? "active" : ""}`}
			onClick={() => window.app.setTab(props.id)}
			style={{
				borderColor: props.active
					? props.color
						? props.color
						: "#f70f0f"
					: undefined
			}}
		>
			{showIcon ? (
				<img
					src={props.icon}
					alt=""
					draggable="false"
					onError={() => setShowIcon(false)}
				/>
			) : (
				<></>
			)}
			<h1>{props.title}</h1>
			<i
				className="material-icons close"
				onClick={() => window.app.closeTab(props.id)}
			>
				close
			</i>
		</div>
	);
};
