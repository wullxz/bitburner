import * as util from 'util.js';

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('ALL');
	const replace = util.getBoolParam(ns.args, '--replace');
	let scripts = util.getListParam(ns.args, ",", '--scripts') || ['servers.json.txt', 'launcher.js', 'util.js', 'money.js'];
	const main_script = util.getParam(ns.args, '--main-script', '--mainscript', '--ms') || 'money.js';
	let params = util.getListParam(ns.args, '--param') || [];

	let allServers = util.allServers(ns);
	let servers;
	let serverSet = util.getParam(ns.args, '--server-set', '--serverset');
	if (serverSet) {
		if (serverSet == 'own') {
			servers = [];
			for (const s of ns.getPurchasedServers())
				servers.push(ns.getServer(s));
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
		let p = params.slice(0);
		p.push('--hostname', s);
		if (main_script === 'money.js') p.push('-w');
		try {
			for (const f of scripts)
				await ns.scp(f, s);
			if (s != 'home' && replace) ns.killall(s);
			ns.exec('launcher.js', s, 1, main_script, ...p);
			ns.tprint(`[${s}]: run.`);
		}
		catch (e) {
			ns.tprint(`[${s}]: could not run.`);
		}
	}
}