/** @param {NS} ns **/
export async function main(ns) {
	//ns.disableLog('ALL');
	var servers = ns.scan();

	async function exploit(srv) {
		await ns.scp('sah.js', srv);
		await ns.exec('sah.js', srv);
	}

	for (const srv of servers) {
		if (!ns.hasRootAccess(srv)) {
			try {
				ns.nuke(srv);
				await exploit(srv);
			}
			catch (error) {
				ns.print("Error nuking " + srv + ":");
				ns.tprint(error);
			}
		}
		else {
			await exploit(srv);
		}
	}

}