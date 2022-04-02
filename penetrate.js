/** @param {NS} ns */
export async function main(ns) {
	let server_args = (ns.args.indexOf('--servers')) ? ns.args[ns.args.indexOf('--servers') + 1] : "";
	let servers = (server_args) ? server_args.split(",") : ns.read('servers.txt').split(",");

	for (const s of servers) {
		ns.tprint(`[${s}]: nuking...`);
		await nuke(s);
	}

	async function nuke(srv) {
		try {
			await ns.brutessh(srv);
			await ns.ftpcrack(srv);
			await ns.relaysmtp(srv);
			await ns.httpworm(srv);
			await ns.sqlinject(srv);
			await ns.formulas(srv);
		}
		catch (e) {
			ns.tprint(`[${srv}]: could not open ports.`);
		}

		try {
			await ns.nuke(srv);
		}	
		catch (e) {
			ns.tprint(`[${srv}]: could not nuke.`);
		}
	}
}