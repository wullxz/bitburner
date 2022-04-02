/** @param {NS} ns **/
export async function main(ns) {
	let args = ns.args;
	var script = args.shift();
	const fillHome = ns.args.includes('--fillhome');
	var me = ns.getHostname();

	var myRamUsage = ns.getScriptRam('launcher.js');
	var serverRam = ns.getServerMaxRam(me);
	var serverUsed = ns.getServerUsedRam(me);
	ns.tprint(`${serverRam} - ${serverUsed} + ${myRamUsage}`);
	var free = serverRam - serverUsed + myRamUsage;
	var scriptUsage = ns.getScriptRam(script);
	if (me == 'home' && !fillHome) free = free - 35;
	ns.tprint(`[${me}]: ${free} / ${scriptUsage}`);
	var threads = (free / scriptUsage >> 0);
	ns.tprint(`[${me}]: ${threads}`);

	if (threads < 1) return;
	ns.spawn(script, threads, ...args);
}