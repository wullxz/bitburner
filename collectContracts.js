/** @param {NS} ns **/
export async function main(ns) {
	var servers = {};
	var breakCounter = 0;

	while (true) {
		var data = await ns.readPort(1);
		if (data != 'NULL PORT DATA') {
			breakCounter = 0;
			data = JSON.parse(data);
		}
		if (data == 'NULL PORT DATA') {
			breakCounter = breakCounter + 1;
			if (breakCounter > 100) break;
			await ns.sleep(500);
			continue;
		}

		ns.print(`Contracts read: ${data['server']}: ${data['contracts'].join(", ")}`)
		servers[data['server']] = data['contracts'];
		await ns.write('contracts.json', JSON.stringify(servers, null, 2), 'w');
		ns.print(".");
	}
	ns.clearPort(1);
}