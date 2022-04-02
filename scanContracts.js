/** @param {NS} ns **/
export async function main(ns) {
	var me = ns.getHostname();
	ns.print(`RUNNING ON ${me}`);
	var contracts = ns.ls(me, '.cct');

	if (contracts.length == 0) ns.exit();

	var res = {};
	res['server'] = me;
	res['contracts'] = contracts || [];

	ns.print(JSON.stringify(contracts));
	ns.writePort(1, JSON.stringify(res));
}