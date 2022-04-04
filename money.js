import * as util from './util.js';
/** @param {NS} ns **/

export async function main(ns) {
	ns.disableLog('ALL');
	const lpad = util.lpad;
	const rpad = util.rpad;
	let oldPrint = ns.print;
    ns.print = function(arg) {
        let d = new Date();
        let time = d.toLocaleTimeString();
        return oldPrint(`${lpad(time, 11)} | ${arg}`);
    }
	let targets = ns.args.indexOf('--targets');
	var allServers = (targets >= 0)
						? ns.args[targets].split(",").filter(s => s != 'home')
						: JSON.parse(ns.read('servers.json')).filter(s => s.hostname != 'home' && !s.purchasedByPlayer);
	allServers = allServers.filter(s => s.moneyMax).sort((a, b) => (a.moneyMax < b.moneyMax) ? 1 : -1);
	var hackCounter = 0;
	var hackThreshold = 1;
	let failThreshold = 5;
	let choseTopServers = util.getParam(ns.args, '--top-servers', '--topservers') || 15;
	let me = util.getParam(ns.args, '--hostname');

	function portOpenersAvailable() {
		let openers = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'SQLInject.exe', 'HTTPWorm.exe'];
		let count = 0;
		for (const o of openers) {
			if (ns.fileExists(o, 'home'))
				count++
		}
		return count;
	}

	/**
	* Returns a currency string with a k suffix for 1000.
	*/
	function fcur(input) {
		return ns.nFormat(input, '0.000 a');	
	}

	function generateServerList() {
		let hskill = ns.getHackingLevel();
		let servers = allServers.filter(s => s.requiredHackingSkill <= hskill && s.numOpenPortsRequired <= portOpenersAvailable()).slice(0, choseTopServers);
		shuffle(servers);
		return servers.map(x => x.hostname);
	}

	async function fixMoneyAvailable(srv) {
		let counter = 0;
		let max = ns.getServerMaxMoney(srv);
		let now = ns.getServerMoneyAvailable(srv);
		let gTime = ns.getGrowTime(srv);
		let failcounter = 0;
		ns.print(`[${me}][${srv}]: Checking money: ${fcur(max)} | ${fcur(now)} | ${ns.nFormat(now / max, '0.00 %')} | ${ns.nFormat(gTime / 1000, '00:00:00')} per grow`);
		while (now < (max * 0.6)) {
			try {
				if (failcounter > failThreshold) return;
				await ns.grow(srv);
			} 
			catch (e) {
				failcounter++;
				ns.print(`[${me}][${srv}]: Failed to grow.`);
			}
			finally {
				counter = counter + 1;
				max = ns.getServerMaxMoney(srv);
				now = ns.getServerMoneyAvailable(srv);
				let success = (failcounter > failThreshold) ? 'F' : 'S' ;
				console.log(`[${me}][${srv}]: ${success} | growing run ${counter}. Current money: ${fcur(now)}/${fcur(max)}.`);
			}
			if (counter % 10 == 0) await fixHackingDiff(srv);
		}
		console.log(`[${me}][${srv}]: Fixed money: ${fcur(max)} | ${fcur(now)} | ${ns.nFormat(now / max, '0.00 %')} | ${counter} times`);
		ns.print(`[${me}][${srv}]: Fixed money: ${fcur(max)} | ${fcur(now)} | ${ns.nFormat(now / max, '0.00 %')} | ${counter} times`);
	}

	async function fixHackingDiff(srv) {
		let counter = 0;
		let base = ns.getServerMinSecurityLevel(srv);
		let now = ns.getServerSecurityLevel(srv);
		let wTime = ns.getWeakenTime(srv);
		let failcounter = 0;
		ns.print(`[${me}][${srv}]: Checking security: ${fcur(base)} | ${fcur(now)} | ${ns.nFormat(now / base, '0.00')} | ${ns.nFormat(wTime / 1000, '00:00:00')} per weaken.`);
		while (now > (base * 3)) {
			try {
				if (failcounter > failThreshold) return;
				await ns.weaken(srv);
			}
			catch (e) {
				failcounter++;
 				ns.print(`[${me}][${srv}]: Failed to weaken.`); 
			}
			finally {
				counter = counter + 1;
				base = ns.getServerMinSecurityLevel(srv);
				now = ns.getServerSecurityLevel(srv);
				let success = (failcounter > failThreshold) ? 'F' : 'S' ;
				console.log(`[${me}][${srv}]: ${success} | weakening run ${counter}. Current security: ${base}/${ns.nFormat(now, '0.000')}.`);
			}
		}
		console.log(`[${me}][${srv}]: Fixed security: ${fcur(base)} | ${fcur(now)} | ${ns.nFormat(now / base, '0.00')} | ${counter} times`);
		ns.print(`[${me}][${srv}]: Fixed security: ${fcur(base)} | ${fcur(now)} | ${ns.nFormat(now / base, '0.00')} | ${counter} times`);
	}

	async function hack(srv) {
		try {
			var htime = ns.getHackTime(srv);
			ns.print(`[${me}][${srv}]: hacking... ${ns.nFormat(htime/1000, '00:00:00')}`);
			var hacked = await ns.hack(srv);
			ns.print(`[${me}][${srv}]: hacked ${fcur(hacked)}`);
			console.log(`[${me}][${srv}]: hacked ${fcur(hacked)}`);
		} catch (e) { ns.print(`[${me}][${srv}]: failed hacking!`); }
	}

	async function mainloop(allServers) {
		ns.print(`[${me}]: Will start work on those servers: ${allServers}`);
		while (true) {
			if (hackCounter >= hackThreshold) {
				for (const srv of allServers) {
					console.log(`[${me}][${srv}]: grooming...`);
					ns.print(`[${me}][${srv}]: grooming...`);
					await fixHackingDiff(srv);
					await fixMoneyAvailable(srv);
					await fixHackingDiff(srv);
					await hack(srv);
				}
				hackCounter = 0;
			}
			for (const srv of allServers) {
				await hack(srv);
			}
			await ns.sleep(50);
			hackCounter = hackCounter + 1;
			if (hackCounter % 100 === 0) return;
		}
	}

	while (true) {
		if (ns.args.includes('-w') || ns.args.includes('--weaken'))
			hackCounter = hackThreshold;
		else hackCounter = 0;
		let servers = generateServerList();
		await mainloop(servers);
		ns.sleep(50);
	}
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}