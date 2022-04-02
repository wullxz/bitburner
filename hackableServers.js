import * as util from 'util.js';
/** @param {NS} ns */
export async function main(ns) {
	let hlvl = ns.getHackingLevel();
	let allServers = JSON.parse(ns.read('servers.json')).filter(x => x.hostname != 'home' && !x.purchasedByPlayer);
	allServers = allServers.filter(x => x.requiredHackingSkill <= hlvl && x.moneyMax > 0);
	allServers = allServers.sort((a, b) => (a.moneyMax < b.moneyMax) ? 1 : -1);

	for (const s of allServers) {
		ns.tprint(`${util.rpad(s.hostname, 20)} : ${util.lpad(ns.nFormat(s.moneyMax, '0.000 a'), 10)}`);
	}
}