const {protocol, session} = require("electron");
const isDev = require("electron-is-dev");
const axios = require("axios");

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
	session.fromPartition("tabs").protocol.registerStringProtocol(
		"hydrogen",
		async (request, callback) => {
			var url = request.url.substr(11);
			if (url.split("/")[1] === "static" || url.endsWith(".js")) {
				url = url.split("/");
				url.shift();
				url = url.join("/");
			}

			const sourceUrl = isDev
				? `http://localhost:5165/home`
				: `file://${__dirname}/internal/build/index.html`;

			try {
				const {data} = await axios.get(sourceUrl);
				callback(data);
			} catch (err) {
				console.log(err.response.data);
				callback("Failed to access internal pages");
			}
		},
		error => {
			if (error) console.error(error);
		}
	);
};
