/** @param {NS} ns **/
export async function main(ns) {
	var me = ns.getHostname();
	var myRamUsage = ns.getScriptRam('sah_launcher.js');
	var serverRam = ns.getServerMaxRam(me);
	var serverUsed = ns.getServerUsedRam(me);
	var free = serverRam - serverUsed + myRamUsage;
	var sahUsage = ns.getScriptRam('sah.js');
	var threads = (free / sahUsage >> 0);

	ns.spawn('sah.js', threads);
}