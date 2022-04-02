/** @param {NS} ns **/

export async function main(ns) {
	ns.disableLog('ALL');
	var allServers = ns.scan();
	var hackCounter = {};
	var hackThreshold = 10;
	var me = ns.getHostname();

	/**
	* Returns a currency string with a k suffix for 1000.
	*/
	function fcur(input) {
		return ns.nFormat(input, '0 a');	
	}
	
	async function groomAndHack(srv) {
		ns.print(`[${srv}]: hacking...`);
		if (hackCounter[srv] >= hackThreshold) {
			ns.print(`[${srv}]: growing!`)
			await ns.grow(srv);
			await ns.weaken(srv);
			hackCounter[srv] = 0;
		}
		try {
			var hacked = await ns.hack(srv);
			if (hacked) hackCounter[srv] = hackCounter[srv] + 1;
			ns.print(`[${srv}]: hacked ${fcur(hacked)}`);
		}
		catch (e) {
			ns.print(`[${srv}]: unable to hack!`);
		}
	}
	
	async function mainloop(allServers) {
		while (true) {
			var hlvl = ns.getHackingLevel();
			var servers = allServers.filter(s => ns.getServerRequiredHackingLevel(s) <= hlvl && ns.hasRootAccess(s) && s != 'home');
			if (me != 'home') servers.push(me);
			if (servers.length == 0) ns.exit();
	
			for (const srv of servers) {
				await groomAndHack(srv);
			}
			await ns.sleep(50);
		}
	}

	for (const s of allServers) {
		hackCounter[s] = 0;	
	}
	if (me != 'home') hackCounter[me] = 0;
	await mainloop(allServers);
}