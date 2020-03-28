import React, {useState, useEffect} from "react";
import getActiveTab from "../getActiveTab";

export default ({tabs}) => {
	const [refreshing, setRefreshing] = useState(false);
	const [url, setUrl] = useState();
	const [navInput, setNavInput] = useState(false);
	const tab = getActiveTab(tabs);
	const urlData = new URL(tab.url);

	useEffect(() => setUrl(), [tab]);

	return (
		<div className="navBar">
			<div className="navButtons">
				<i className="back material-icons" onClick={window.app.back}>
					arrow_back_ios
				</i>
				<i className="forward material-icons" onClick={window.app.forward}>
					arrow_forward_ios
				</i>
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
				{console.log(urlData)}
				{navInput ? (
					<form
						onSubmit={e => {
							e.preventDefault();
							if (!url || url === tab.url) return;
							window.app.navInput(url);
						}}
					>
						<input
							value={typeof url === "string" ? url : tab.url}
							onChange={e => {
								setUrl(e.target.value);
							}}
						/>
					</form>
				) : (
					<>
						<i
							className={`material-icons lock ${
								urlData.protocol === "https:" ? "secure" : "insecure"
							}`}
						>
							{urlData.protocol === "https:" ? "https" : "no_encryption"}
						</i>
						<p className="url">
							<span className={`protocol protocol-${urlData.protocol.replace(/\W/g, "")}`}>{urlData.protocol + "//"}</span>
							<span className="hostname">{urlData.hostname}</span>
							{urlData.port ? (
								<span className="port">:{urlData.port}</span>
							) : (
								<></>
							)}
							<span className="pathname">{urlData.pathname}</span>
							<span className="search">{urlData.search}</span>
							<span className="hash">{urlData.hash}</span>
						</p>
					</>
				)}
			</div>
		</div>
	);
};
