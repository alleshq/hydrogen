const {protocol, session} = require("electron");
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
		async (request, callback) => {
			let url = request.url.substr(11);
			if (url.split("/")[1] === "static" || url.endsWith(".js")) {
				url = url.split("/");
				url.shift();
				url = url.join("/");
			}

			const sourceUrl = isDev
				? `http://localhost:5165/`
				: `file://${__dirname}/internal/build/index.html`;

			callback({
				url: sourceUrl
			});
		},
		error => {
			if (error) console.error(error);
		}
	);
};
