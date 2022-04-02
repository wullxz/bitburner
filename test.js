import * as util from 'util.js';
/** @param {NS} ns */
export async function main(ns) {
    let c = util.getCountParam(ns.args, '-v');
    ns.tprint(c);
}