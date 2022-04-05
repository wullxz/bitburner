/** @param {NS} ns */
export async function main(ns) {
	let server_args = (ns.args.indexOf('--servers')) ? ns.args[ns.args.indexOf('--servers') + 1] : "";
	let servers = (server_args) ? server_args.split(",") : ns.read('servers.txt').split(",");

	for (const s of servers) {
		await nuke(s);
	}

	async function nuke(srv) {
		let p = 0; // ports opened counter
		try {
			await ns.brutessh(srv);
			p++;
			await ns.ftpcrack(srv);
			p++;
			await ns.relaysmtp(srv);
			p++;
			await ns.httpworm(srv);
			p++;
			await ns.sqlinject(srv);
			p++;
			await ns.formulas(srv);
			p++;
		}
		catch (e) {
			if (p !== 0) ns.tprint(`[${srv}]: opened ${p} ports!`);
			//ns.tprint(`[${srv}]: could not open ports.`);
		}

		try {
			await ns.nuke(srv);
			ns.tprint(`[${srv}]: nuked!`)
		}	
		catch (e) {
			//ns.tprint(`[${srv}]: could not nuke.`);
		}
	}
}