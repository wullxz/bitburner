/** @param {NS} ns */
export async function main(ns) {
    const doc = eval('document');
    const head = doc.getElementById('overview-extra-hook-0');
    const vals = doc.getElementById('overview-extra-hook-1');

    while (true) {
        try {
            const headers = [];
            const values = [] ;

            headers.push("Karma");
            values.push(ns.heart.break());

            head.innerText = headers.join(" \n");
            vals.innerText = values.join("\n");
        }
        catch (err) {
            ns.print("ERROR: Update Skipped: " + String(err));
        }
        await ns.sleep(1000);
    }
}