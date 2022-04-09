/** @param {NS} ns **/
export async function main(ns) {
    const threads = ns.args[0];
    const server = ns.args[0];
    const sleeptime = ns.args[1];
    await ns.sleep(sleeptime);
    await ns.grow(server, threads);
}
