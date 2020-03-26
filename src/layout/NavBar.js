import React, {useState, useEffect} from "react";
import getActiveTab from "../getActiveTab";

export default ({tabs}) => {
	const [refreshing, setRefreshing] = useState(false);
	const [url, setUrl] = useState();
	const tab = getActiveTab(tabs);

	useEffect(() => setUrl(), [tab]);

	return (
		<div className="navBar">
			<div className="navButtons">
				<i className="back material-icons">arrow_back_ios</i>
				<i className="forward material-icons">arrow_forward_ios</i>
				<i
					className={`refresh material-icons ${refreshing ? "active" : ""}`}
					onClick={() => {
						if (refreshing) return;
						setRefreshing(true);
						setTimeout(() => setRefreshing(false), 500);
						window.app.refresh();
					}}
				>
					refresh
				</i>
			</div>
			<div className="inputBar">
				<form onSubmit={e => {
					e.preventDefault();
					if (url === tab.url) return;
					window.app.goTo(url);
				}}>
					<input value={typeof url === "string" ? url : tab.url} onChange={e => {
						setUrl(e.target.value);
					}} />
				</form>
			</div>
		</div>
	);
};
