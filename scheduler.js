/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog('ALL');
    const looptime = 10000;
    const round = 360;
    let round_counter = 1;

    const schedule_conf = [
        {
            script: 'solveContracts.js',
            counter_mod: 60
        }
    ]

    await mainloop();

    async function mainloop() {
        while (true) {
            for (const c of schedule_conf) {
                if (round_counter % c.counter_mod === 0) {
                    let args = c.args || [];
                    ns.print(`Running ${c.script} with args ${c.args}`);
                    await ns.run(c.script, 1, 'home', ...args);
                }
            }
            round_counter = (round_counter > round) ? 1 : round_counter + 1;
            await ns.sleep(looptime);
        }
    }
}