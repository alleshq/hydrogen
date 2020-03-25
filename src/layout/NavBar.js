import React, {useState} from "react";

export default () => {
	const [refreshing, setRefreshing] = useState(false);

	return (
		<div className="navBar">
			<div className="navButtons">
				<i className="back material-icons">arrow_back_ios</i>
				<i className="forward material-icons">arrow_forward_ios</i>
				<i
					className={`refresh material-icons ${refreshing ? "active" : ""}`}
					onClick={(e) => {
						if (refreshing) return;
						setRefreshing(true);
						setTimeout(() => setRefreshing(false), 500);
						window.app.refresh();
					}}
				>
					refresh
				</i>
			</div>
		</div>
	);
};
