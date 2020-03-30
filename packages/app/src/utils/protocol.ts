import {protocol, session} from "electron";
import isDev from "electron-is-dev";

protocol.registerSchemesAsPrivileged([
	{
		scheme: "hydrogen",
		privileges: {
			bypassCSP: true,
			secure: true,
			standard: true,
			supportFetchAPI: true,
			allowServiceWorkers: true,
			corsEnabled: false
		}
	}
]);

export default () => {
	session.fromPartition("tabs").protocol.registerHttpProtocol(
		"hydrogen",
		async (request, callback) => {
			let urlSubstr = request.url.substr(11);
			let url: string;
			if (urlSubstr.split("/")[1] === "static" || urlSubstr.endsWith(".js")) {
				let splitUrl = urlSubstr.split("/");
				splitUrl.shift();
				url = splitUrl.join("/");
			} else if (!isDev) {
				url = "index.html";
			}

			const sourceUrl = isDev
				? `http://localhost:5165/${url}`
				: `file://${__dirname}/internal/build/${url}`;

			callback({
				url: sourceUrl
			});
		},
		error => {
			if (error) console.error(error);
		}
	);
};
