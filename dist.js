/** @param {NS} ns **/
export async function main(ns) {
	var caller = ns.args[0];
	var payload = JSON.parse(ns.args[1]); 
	var dorun = JSON.parse(ns.args[2]) || [];
	var me = await ns.getHostname();

	ns.print(`RUNNING ON ${me}`);
	
	async function infect(srv) {
		ns.print(`[${srv}]: copying and running payload`);
		await ns.scp('dist.js', srv);
		for (const p of payload) {
			await ns.scp(p, srv);
		}
		await ns.exec('dist.js', srv, 1, me, ns.args[1], ns.args[2]);
	}

	async function dist() {
		var servers = ns.scan();
	
		for (const srv of servers) {
			if (srv == caller || srv == 'home') continue;

			await infect(srv);
		}
		await ns.sleep(2000);
		for (const srv of servers) {
			for (const r of dorun) {
				await ns.exec(r, srv);
			}
		}
	}
	await dist();	
}