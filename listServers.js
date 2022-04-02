/** @param {NS} ns */
export async function main(ns) {
	let servers = [];
	let snames = [];
	let scanned = [];

	await recScan('home');
	await ns.write('servers.json', JSON.stringify(servers, null, 2), 'w');

	async function recScan(node) {
		let srvs = await ns.scan(node);
		scanned.push(node);
		for (const s of srvs) {
			if (!snames.includes(s)) {

				servers.push(ns.getServer(s));
				snames.push(s);
			}
			if (!scanned.includes(s))
				await recScan(s);
		}
	}
}