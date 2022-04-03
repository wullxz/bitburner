/** @param {NS} ns **/
export async function main(ns) {
	let maxmoney = JSON.parse(ns.read('servers.json.txt')).filter(x => x.hostname === 'joesguns')[0].moneyMax;
	let farm = 'joesguns';
	let counter = 0;
	while (true) {
		await ns.weaken(farm);
		await ns.grow(farm);
		if (counter === 10 && ns.getServerMoneyAvailable(farm) > maxmoney * 0.9) {
			await ns.hack(farm);
			counter = 0;
		}
		counter++;
		await ns.sleep(50);
	}
}