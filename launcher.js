/** @param {NS} ns **/
export async function main(ns) {
	let args = ns.args;
	var script = args.shift();
	const fillHome = ns.args.includes('--fillhome');
	var me = ns.getHostname();

	var myRamUsage = ns.getScriptRam('launcher.js');
	var serverRam = ns.getServerMaxRam(me);
	var serverUsed = ns.getServerUsedRam(me);
	var free = serverRam - serverUsed + myRamUsage;
	var scriptUsage = ns.getScriptRam(script);
	if (me == 'home' && serverRam >= 64 && !fillHome) free = free - 35;
	var threads = (free / scriptUsage >> 0);
	ns.tprint(`[${me}]: ${nf(free)} GB free | ${nf(scriptUsage)} GB will be used by ${nf(threads)} threads of ${script}.`);

	if (threads < 1) return;
	ns.spawn(script, threads, ...args);

	function nf(num) {
		return ns.nFormat(num, '0.000 a');
	}
}