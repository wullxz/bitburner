/** @param {NS} ns **/
export async function main(ns) {
	let farm = 'joesguns';
	while (true) {
		await ns.weaken(farm);
		await ns.grow(farm);
		await ns.sleep(1);
	}
}
