const {protocol, session, ipcRenderer} = require("electron");
const isDev = require("electron-is-dev");

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

module.exports = () => {
	session.fromPartition("tabs").protocol.registerHttpProtocol(
		"hydrogen",
		(request, callback) => {
			var url = request.url.substr(11);
			if (url.split("/")[1] === "static" || url.endsWith(".js")) {
				url = url.split("/");
				url.shift();
				url = url.join("/");
			}
			callback({
				url: isDev
					? "http://localhost:5165/" + url
					: `file://${__dirname}/internal/build/index.html`
			});
		},
		error => {
			if (error) console.error(error);
		}
	);
};
