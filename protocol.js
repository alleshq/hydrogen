const {protocol, session} = require("electron");
const url = require("url");

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
    session.fromPartition("tabs").protocol.registerFileProtocol(
        "hydrogen",
        (request, callback) => {
            const parsed = url.parse(request.url);

            if (parsed.path === "/") {
                console.log(`${__dirname}/web/${parsed.hostname}.html`);
                return callback({
                    path: `${__dirname}/web/${parsed.hostname}.html`
                });
            }
            
            console.log(`${__dirname}/web/${parsed.path}`);
            callback({path: `${__dirname}/web/${parsed.path}`});
        },
        error => {
            if (error) console.error(error);
        }
    );
};
