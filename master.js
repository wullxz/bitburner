/** @param {NS} ns **/
export async function main(ns) {
    // Attribution: Script and info taken from here: https://www.reddit.com/r/Bitburner/comments/rm48o1/the_best_hacking_approach_ive_seen_so_far/
    // I updated this to a managing script that controls purchased servers.

    const hosts = ns.getPurchasedServers();
    let targets = getTargets();
    const scripts = ['hack.js', 'grow.js', 'weaken.js'];
    const settings = {};
    let ripecounter = 0;

    // initialize and provision
    for (const h of hosts) {
        await provisionServer(h, scripts);
        settings[h] = { sleep: Date.now(), c: 0};
    }

    for (let index = 0; index <= hosts.length; index++) {
        if (index == hosts.length) index = 0;
        let host = hosts[index];
        if (ripecounter >= 25) await ns.sleep(10000);
        if (Date.now() < settings[host]['sleep']) {
            ns.print(`Skipping ${host} because it's not ripe yet!`);
            ripecounter++;
            continue; // host is not ripe yet
        }
        else {
            ripecounter = 0;
        }
        let target = targets[index].hostname;
        var player = ns.getPlayer();
        var fserver = ns.getServer(target);
        var contstantRam = ns.getScriptRam("master.js"); //grabbing script RAM values
        var hackscriptRam = ns.getScriptRam("hack.js");
        var growscriptRam = ns.getScriptRam("grow.js");
        var weakenscriptRam = ns.getScriptRam("weaken.js");
        var maxRam = (ns.getServerMaxRam(host) - contstantRam); //getting total RAM I can use that doesnt include the OP script
        var weakenThreads = (2000 - ((fserver.minDifficulty) / 0.05));
        var maxGrowThreads = ((maxRam / growscriptRam) - (weakenscriptRam * 2000));
        var cs = ns.getServerSecurityLevel(target);
        var ms = fserver.minDifficulty;
        var mm = fserver.moneyMax;
        var ma = ns.getServerMoneyAvailable(target);



        //Priming the server.  Max money and Min security must be acheived for this to work
        if (ma < mm) {
            ns.exec('weaken.js', host, 2000, target, 0);
            ns.exec('grow.js', host, maxGrowThreads, target, 0);
            var WeakenTime = (ns.formulas.hacking.weakenTime(fserver, player));
            settings[host]['sleep'] = Date.now() + WeakenTime + 1000;
            ma = ns.getServerMoneyAvailable(host);
            cs = ns.getServerSecurityLevel(host);

        }


        //If Max Money is true, making sure security level is at its minimum
        if ((cs > ms) == true) {
            ns.exec('weaken.js', host, 2000, target, 0);
            WeakenTime = (ns.formulas.hacking.weakenTime(fserver, player));
            settings[host]['sleep'] = Date.now() + WeakenTime + 1000;
            cs = ns.getServerSecurityLevel(host);
        }

        //Refreshing server stats now that the security level is at the minmum, and maybe our player stats have changed as priming can take a while
        player = ns.getPlayer();
        fserver = ns.getServer(host);

        var HPercent = (ns.formulas.hacking.hackPercent(fserver, player) * 100);
        var GPercent = (ns.formulas.hacking.growPercent(fserver, 1, player, 1));
        WeakenTime = (ns.formulas.hacking.weakenTime(fserver, player));
        var GrowTime = (ns.formulas.hacking.growTime(fserver, player));
        var HackTime = (ns.formulas.hacking.hackTime(fserver, player));

        var growThreads = Math.round(((5 / (GPercent - 1)))); //Getting the amount of threads I need to grow 200%.  I only need 100% but I'm being conservative here
        var hackThreads = Math.round((50 / HPercent));  //Getting the amount of threads I need to hack 50% of the funds
        weakenThreads = Math.round((weakenThreads - (growThreads * 0.004))); //Getting required threads to fully weaken the server

        var totalRamForRun = (hackscriptRam * hackThreads) + (growscriptRam * growThreads) + (weakenscriptRam * weakenThreads) //Calculating how much RAM is used for a single run
        var sleepTime = (WeakenTime / (maxRam / totalRamForRun)) //finding how many runs this server can handle and setting the time between run execution

        //if (sleepTime<500) // Testing forcing a min sleep time of 500 ms
        //{sleepTime = 500;
        //}

        var shiftCount = maxRam / totalRamForRun;
        var offset = sleepTime / 2
        var gOffset = offset / 4
        var hOffset = offset / 2


        var wsleep = 0; //At one point I made the weaken call sleep so I've kept it around
        var gsleep = ((WeakenTime - GrowTime - gOffset)); //Getting the time to have the Growth execution sleep, then shaving some off to beat the weaken execution
        var hsleep = ((WeakenTime - HackTime - hOffset)); //Getting time for hack, shaving off more to make sure it beats both weaken and growth
        var UsedRam = ns.getServerUsedRam(target);


        if ((totalRamForRun >= (maxRam - UsedRam)) == false) //making sure I have enough RAM to do a full run
        {
            ns.exec('weaken.js', host, weakenThreads, target, wsleep, `${index}|${settings[host]['c']}`);
            ns.exec('grow.js', host, growThreads, target, gsleep, `${index}|${settings[host]['c']}`);
            ns.exec('hack.js', host, hackThreads, target, hsleep, `${index}|${settings[host]['c']}`);

            if (settings[host]['c'] < shiftCount) {
                settings[host]['sleep'] = Date.now() + sleepTime;
                settings[host]['c'] = settings[host]['c'] + 1;
            }
            else {
                settings[host]['sleep'] = Date.now() + sleepTime + offset;
                settings[host]['c'] = 0;
            }
        }
        else {
            ns.print(`Not enough RAM available! Need ${totalRamForRun} but have ${maxRam - UsedRam}!`)
            settings[host]['sleep'] = Date.now() + 1000;
        }
        await ns.sleep(10);
    }

    function getTargets() {
        let hskill = ns.getHackingLevel();
        let targets = JSON.parse(ns.read('servers.json')).filter(s => s.hostname != 'home' && !s.purchasedByPlayer);
        targets = targets.filter(s => s.moneyMax).sort((a, b) => (a.moneyMax < b.moneyMax) ? 1 : -1);
        // filter for currently hackable servers
        targets = targets.filter(s => s.requiredHackingSkill <= hskill && s.numOpenPortsRequired <= portOpenersAvailable()).slice(0, 25);
        return targets;
    }

    function portOpenersAvailable() {
        let openers = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'SQLInject.exe', 'HTTPWorm.exe'];
        let count = 0;
        for (const o of openers) {
            if (ns.fileExists(o, 'home'))
                count++
        }
        return count;
    }

    async function provisionServer(srv, scripts) {
        for (const f of scripts)
            await ns.scp(f, srv);
    }
}
