import * as util from 'util.js';
/** @param {NS} ns */
export async function main(ns) {
	const purchasedServers = ns.getPurchasedServers();
	let verbose = util.getCountParam(ns.args, '-v');
	let maxpow = 3;
	let inventory = {};

	for (const s of purchasedServers) {
		let ram = ns.getServerMaxRam(s);
		let pow = Math.log2(ram);
		inventory[pow] = (pow in inventory) ? inventory[pow] + 1 : 1;
		if (pow > maxpow) maxpow = pow;
		if (verbose > 2) {
			ns.tprint(`- ${s}`);
			ns.tprint(`\tRAM: ${ram}`);
			ns.tprint(`\tPow: ${pow}`);
		}
	}

	let powstring = "";
	let countstring = "";
	let padding = 4;
	for (const p of Object.keys(inventory)) {
		powstring = powstring + lpad(p, padding);
		countstring = countstring + lpad(inventory[p], padding); 
	}

	ns.tprint(`===================`);
	ns.tprint(`Inventory:`);
	ns.tprint(`Pow: ${powstring}`);
	ns.tprint(`Cnt: ${countstring}`);

	let buypow = maxpow;
	let money = ns.getServerMoneyAvailable('home');
	let servers_per_money = 0;
	let buyable = 0;
	powstring = "";
	let buystring = "";
	do {
		let cost = ns.getPurchasedServerCost(Math.pow(2, buypow));
		buyable = Math.floor(money / cost);
		powstring = powstring + lpad(buypow, padding);
		buystring = buystring + lpad(buyable, padding);
		buypow = buypow + 1;
	} while (buyable > 1) ;
	ns.tprint(`===================`);
	ns.tprint(`Buyable:`);
	ns.tprint(`${rpad('Pow', 5)}: ${powstring}`);
	ns.tprint(`${rpad('Buys', 5)}: ${buystring}`);
}

function lpad(val, paddings) {
	let p = " ".repeat(paddings);
	val = String(val);
	return (p + val).slice((val.length > p.length) ? -val.length : -p.length);
}

function rpad(val, paddings) {
	let p = " ".repeat(paddings);
	val = String(val);
	return (val + p).slice(0, (val.length > p.length) ? val.length : p.length);
}