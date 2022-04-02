/** @param {NS} ns **/
export async function main(ns) {
	var caller = ns.args[0];
	async function worm() {
		var servers = ns.scan();
		var me = ns.getHostname();

		await ns.exec('kill_sah.js', me, 1, me);
		async function exploit(srv) {
			ns.tprint(`[${srv}]: copying and running sah.js`);
			await ns.scp('worm.js', srv);
			await ns.scp('kill_sah.js', srv);
			await ns.scp('sah.js', srv);
			await ns.scp('sah_launcher.js', srv);
			await ns.exec('kill_sah.js', srv, 1, srv);
			await ns.exec('worm.js', srv, 1, me);
			
		}

		async function runhax(srv) {
			try {
				await ns.exec('sah_launcher.js', srv);
			}
			catch (e) {
				ns.tprint(`[${srv}]: Cannot run remotely`);
			}
		}
	
		for (const srv of servers) {
			if (srv == caller || srv == 'home') continue;
			if (!ns.hasRootAccess(srv)) {
				try {
					try {
						await ns.brutessh(srv);
						await ns.ftpcrack(srv);
					}
					catch (e) {
						ns.tprint(`[${srv}]: brutessh/ftpcrack failed!`);
					}
					await ns.nuke(srv);
					await exploit(srv);
				}
				catch (error) {
					ns.tprint(`[${srv}]: error infecting:`);
					ns.tprint(error);
				}
			}
			else {
				await exploit(srv);
			}
		}
		await ns.sleep(5000);
		for (const srv of servers) {
			runhax(srv);
		}
		runhax(me);
	}
	await worm();	
}