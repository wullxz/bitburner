/** @param {NS} ns */
export async function main(ns) {
}

export function getParam(args, ...parameter) {
	for (const p of parameter) {
		let idx = args.indexOf(p);
		if (idx >= 0) return args[idx + 1];
	}
	
	return undefined;
}

export function getBoolParam(args, ...parameter) {
	for (const p of parameter) {
		let idx = args.indexOf(p);
		if (idx >= 0) return true;
	}
	
	return false;
}

export function defunct_getCountParam(args, parameter) {
	parameter = parameter.replace(/^-/, "");
	let pattern = /-${parameter}+/;
	args.forEach((val, idx) => {
		if (val.match(pattern)) {
			return val.length - 1;
		}
	});
	return 0;
}

export function getCountParam(args, parameter) {
	let count = 0;
	args.forEach((val) => { if (val === parameter) count = count+1 });
	return count;
}

export function lpad(val, paddings) {
	let p = " ".repeat(paddings);
	val = String(val);
	return (p + val).slice((val.length > p.length) ? -val.length : -p.length);
}

export function rpad(val, paddings) {
	let p = " ".repeat(paddings);
	val = String(val);
	return (val + p).slice(0, (val.length > p.length) ? val.length : p.length);	
}

export function allServers(ns) {
	return JSON.parse(ns.read('servers.json'));
}

export function range(a, b) {
	if (!b) {
		b = a;
		a = 0;
	}

	let ar = [...Array(b+1).keys()].slice(a) ;
	console.log(ar);

	return ar;
}