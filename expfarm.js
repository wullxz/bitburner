/** @param {NS} ns **/
export async function main(ns) {
	var farm = 'joesguns';
	while (true) {
		await ns.weaken(farm);
		await ns.grow(farm);
		await ns.weaken(farm);
		await ns.sleep(100);
	}
}