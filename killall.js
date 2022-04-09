/** @param {NS} ns **/
export async function main(ns) {
    const own = ns.getPurchasedServers();
    for (const o of own) {
        ns.killall(o);
    }
}
