import * as util from 'util.js';
/** @param {NS} ns **/
export async function main(ns) {
    let baseName = "ahb";
    const mreserved = util.getParam(ns.args, '--reserve', '--reserved', '--reserved-moeny') || 0;
    const dryRun = util.getBoolParam(ns.args, '-d', '--dry-run', '--dryrun');
    let multi = util.getParam(ns.args, '-p', '--power') || 3; // assumes you need up to 8gb for your hack and distro script. you may be able to lower this accordingly.
    let hackScript = "runDist.js";

    let servers = ns.getPurchasedServers();
    if (servers.length > 0) {
        let maxRam = servers.reduce((a, e) => Math.max(a, ns.getServerMaxRam(e)), 3);
        while (Math.pow(2, multi) < maxRam) multi++;
    }

    let queue = new Queue();
    for (let i = 0; i < servers.length; i++) {
        queue.enqueue(servers[i]);
    }

    let nameCounter = 1;
    let maxRam = Math.pow(2, 20);
    while (true) {
        if (Math.pow(2, multi) >= maxRam) {
            ns.tprint("maxed on servers, killing process");
            return;
        }

        const oldmulti = multi;
        const evaluated = evaluatePower();
        if (evaluated && evaluated.pow > multi) multi = evaluated.pow;
        if (multi > oldmulti) ns.tprint(`Bumping ram multi from ${oldmulti} to ${multi} to purchase ${evaluated.amount} new servers!`);

        let count = queue.length;
        let cash = ns.getPlayer().money - mreserved;
        let ram = Math.min(Math.pow(2, 20), Math.pow(2, multi));
        let cost = ns.getPurchasedServerCost(ram);

        if (count >= ns.getPurchasedServerLimit() && cash >= cost) {
            let current = queue.peek();   
            if (false && Math.min(maxRam, Math.pow(2, multi)) <= ns.getServerMaxRam(current)) {
                ns.tprint("bumping ram multi from " + multi + " to " + (multi + 1));
                multi++;
                continue;
            }
            else {
                if (!dryRun) {
                    current = queue.dequeue();
                    ns.killall(current);
                    ns.deleteServer(current);
                }
                else {
                    ns.tprint(`DRYRUN: would kill a machine for a newer one now!`);
                }
            }
        }
        else if (count < ns.getPurchasedServerLimit() && cash >= cost) {
            if (!dryRun) {
                let name = baseName + nameCounter;
                nameCounter++;
                let newBox = ns.purchaseServer(name, ram);
                queue.enqueue(newBox);
                ns.run(hackScript, 1, newBox);
            }
            else {
                ns.tprint(`DRYRUN: would buy a new machine with ${ram} GB RAM / Power ${multi} now!`);
                await ns.sleep(10000);
            }
        }

        await ns.asleep(1000);
    }

    function evaluatePower() {
        let buypow = multi;
        let money = ns.getServerMoneyAvailable('home') - mreserved;
        let buyable = 0;
        let possible_buys = [];
        do {
            let cost = ns.getPurchasedServerCost(Math.pow(2, buypow));
            buyable = Math.floor(money / cost);
            if (buyable > 1) possible_buys.push({pow: buypow, amount: buyable});
            buypow = buypow + 1;
        } while (buyable > 1 && buypow <= 20) ; // max power is 20

        const newpow = possible_buys.filter(x => x.amount >= 10).sort((a, b) => (a > b) ? 1 : -1)[0];
        //ns.tprint(`Calculated power: ${newpow.pow} for a total of ${newpow.amount} new machines!`);
        return newpow;
    }
}

class Queue extends Array {
    enqueue(val) {
        this.push(val);
    }

    dequeue() {
        return this.shift();
    }

    peek() {
        return this[0];
    }

    isEmpty() {
        return this.length === 0;
    }
}