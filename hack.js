/** @param {NS} ns **/
export async function main(ns) {
    const threads = ns.args[0];
    const server = ns.args[0];
    const sleeptime = ns.args[1];
    await ns.sleep(sleeptime);
    const hacked = await ns.hack(server, threads);
    console.log(`${server}: hacked ${ns.nFormat(hacked, '0.000 a')}!`);
}
