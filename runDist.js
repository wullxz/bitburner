import * as util from 'util.js';
/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('ALL');
	const replace = util.getBoolParam(ns.args, '--replace');
	let allServers = util.allServers(ns);
	let servers;
	let serverSet = util.getParam(ns.args, '--server-set', '--serverset');
	if (serverSet) {
		if (serverSet == 'own') {
			servers = allServers.filter(x => x.purchasedByPlayer && x.hostname != 'home');	
		}
		else if (serverSet == 'named') {
			servers = allServers.filter(x => !x.purchasedByPlayer && x.hostname != 'home');
		}
	}
	else {
		let hn = util.getParam(ns.args, '--server', '--s');
		if (!hn) hn = ns.args[0];
		servers = [ns.getServer(hn)];
	}
	for (const sobj of servers) {
		let s = sobj.hostname
		try {
			await ns.scp('servers.json.txt', s);
			await ns.scp('launcher.js', s);
			await ns.scp('util.js', s);
			await ns.scp('money.js', s);
			if (s != 'home' && replace) ns.killall(s);
			ns.exec('launcher.js', s, 1, 'money.js', '-w', '--hostname', s);
			ns.tprint(`[${s}]: run.`);
		}
		catch (e) {
			ns.tprint(`[${s}]: could not run.`);
		}
	}
}