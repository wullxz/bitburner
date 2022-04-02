// Stock market bot for bitburner, written by steamid/Meng- https://danielyxie.github.io/bitburner/ - [github.io] 
// Runs infinitely - buys and sells stock, hopefully for a profit...
// version 1.21 - Added check for max stocks, cleaned things up a bit, cycle complete prints less frequently
import * as util from 'util.js';

export async function main(ns) {
    let lpad = util.lpad;
    let rpad = util.rpad;
    if (util.getBoolParam(ns.args, '--help', '-h')) {
        ns.tprint(`Help for stockbot:`);
        ns.tprint(`${rpad('--firesale, --fs', 20)}:\tSells all stock immediately.`);
        ns.tprint(`${rpad('--reserve, -r', 20)}:\tThe amount of money not to touch.`);
        ns.exit();
    }
    let fireSale = util.getBoolParam(ns.args, '--firesale', '--fs');
    let oldPrint = ns.print;
    let wins = 0;
    let loss = 0;
    ns.print = function(arg) {
        let d = new Date();
        let time = d.toLocaleTimeString();
        if (fireSale) ns.tprint(`${lpad(time, 11)} | ${arg}`);
        return oldPrint(`${lpad(time, 11)} | ${arg}`);
    }
    ns.print("Starting script here");
    //ns.disableLog('sleep');
    //ns.disableLog('getServerMoneyAvailable');
    ns.disableLog('ALL');

    let stockSymbols = ns.stock.getSymbols(); // all symbols
    let portfolio = []; // init portfolio
    let cycle = 0;
    // ~~~~~~~You can edit these~~~~~~~~
    const forecastThresh = 0.65; // Buy above this confidence level (forecast%)
    const minimumCash = util.getParam(ns.args, '-r', '--reserve') || 50000000; // Minimum cash to keep
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    ns.print("Starting run - Do we own any stocks?"); //Finds and adds any stocks we already own
    if (fireSale) {
        printStatus();
        let sum = 0;
        for (const stock of stockSymbols) {
            let pos = ns.stock.getPosition(stock);
            if (pos[0] > 0) {
                let ask = ns.stock.getAskPrice(stock);
                sum = sum + (pos[0] * ask);
                ns.stock.sell(stock, pos[0]);
            }
        }
        ns.print(`Sold total of ${lpad(nf(sum),9)} in shares.`);
        ns.exit();
    }
    for(const stock of stockSymbols){
        let pos = ns.stock.getPosition(stock);
        if(pos[0] > 0){
            portfolio.push({sym: stock, value: pos[1], shares: pos[0]});
            ns.print('Detected: '+ lpad(stock, 5) + ' quant: '+ lpad(nf(pos[0]), 9) +' @ '+ lpad(nf(pos[1]), 9));
        };
    };
    printStatus();

    while(true){
        for(const stock of stockSymbols){ // for each stock symbol
            if (portfolio.findIndex(obj => obj.sym === stock) !== -1){ //if we already have this stock
                let i = portfolio.findIndex(obj => obj.sym === stock); // log index of symbol as i
                if(ns.stock.getAskPrice(stock) >= portfolio[i].value*1.1){ // if the price is higher than what we bought it at +10% then we SELL
                    sellStock(stock);
                }
                else if(ns.stock.getForecast(stock) < 0.4){
                    sellStock(stock);
                }
            }

            else if (ns.stock.getForecast(stock) >= forecastThresh){ // if the forecast is better than threshold and we don't own then BUY
                buyStock(stock);
            }
        } // end of for loop (iterating stockSymbols)
        cycle++;
        //if (cycle % 5 === 0){ ns.print('Cycle '+ cycle + ' Complete') };
        if (cycle % 10 === 0) printStatus();
        await ns.sleep(6000);
    } // end of while true loop

    function buyStock(stock) {
        let stockPrice = ns.stock.getAskPrice(stock); // Get the stockprice
        let shares = stockBuyQuantCalc(stockPrice, stock); // calculate the shares to buy using StockBuyQuantCalc
        if (shares === 0) return ns.print(`Not enough money to buy stonks. (${stock})`);

        if (ns.stock.getVolatility(stock) <= 0.05){ // if volatility is < 5%, buy the stock
            ns.stock.buy(stock, shares);
            ns.print(`${rpad('BUY', 5)}: ${lpad(stock, 5)} shares: ${lpad(nf(shares),9)} @ ${lpad(nf(stockPrice),9)} / ${lpad(nf(shares*stockPrice), 9)}`);

            portfolio.push({sym: stock, value: stockPrice, shares: shares}); //store the purchase info in portfolio
        }
    }

    function sellStock(stock) {
        let position = ns.stock.getPosition(stock);
        var forecast = ns.stock.getForecast(stock);
        if (forecast < 0.55) {
            let i = portfolio.findIndex(obj => obj.sym === stock); //Find the stock info in the portfolio
            let ask = ns.stock.getAskPrice(stock);
            let shares = portfolio[i].shares;
            let value = portfolio[i].value;
            let gain_t = (shares * ask) - (shares * value);
            let gain_p = ((shares * ask) / (shares * value)) - 1;
            if (gain_t > 0) wins = wins + gain_t;
            else loss = loss + gain_t;
            ns.print(`${rpad('SELL', 5)}: ${lpad(stock, 5)} quant: ${lpad(nf(shares),9)} @ ${lpad(nf(value),9)} / ${lpad(nf(shares*ask), 9)} | Gain: ${lpad(nf(gain_t), 9)} - ${lpad(ns.nFormat(gain_p, '0.00 %'), 8)}`);
            portfolio.splice(i, 1); // Remove the stock from portfolio
            ns.stock.sell(stock, position[0]);

        }
    };

    function stockBuyQuantCalc(stockPrice, stock){ // Calculates how many shares to buy
        let playerMoney = ns.getServerMoneyAvailable('home') - minimumCash;
        if (playerMoney <= 0) return 0;
        let maxSpend = playerMoney * 0.25;
        let calcShares = maxSpend/stockPrice;
        let maxShares = ns.stock.getMaxShares(stock);

        if (calcShares > maxShares){
            return maxShares
        }
        else {return calcShares}
    }

    function printStatus() {
        //portfolio.push({sym: stock, value: pos[1], shares: pos[0]})
        let width = 88;
        iprint("-".repeat(width));
        iprint(`${rpad('Sym', 5)} | ${lpad('amount', 9)} | ${lpad('avg buy', 9)} | ${lpad('cur ask', 9)} | ${lpad('old value', 9)} | ${lpad('cur value', 9)} | ${lpad('gain', 9)} | ${lpad('gain %', 8)}`);
        iprint("-".repeat(width));
        for (const shares of portfolio) {
            let sym = shares['sym'];
            let amnt = shares['shares'];
            let avgb = shares['value'];
            let ask = ns.stock.getAskPrice(sym);
            let bought = avgb * amnt;
            let cval = ask * amnt;
            let gain_total = cval - bought;
            let gain_percent = (ask / avgb) - 1;
            iprint(`${rpad(sym, 5)} | ${lpad(nf(amnt), 9)} | ${lpad(nf(avgb), 9)} | ${lpad(nf(ask), 9)} | ${lpad(nf(bought), 9)} | ${lpad(nf(cval), 9)} | ${lpad(nf(gain_total), 9)} | ${lpad(ns.nFormat(gain_percent, '0.00 %'), 8)}`);
        }
        iprint("-".repeat(width));
        iprint(`Stats: ${lpad(nf(wins), 9)} win / ${lpad(nf(loss), 9)} loss / ${lpad(nf(wins+loss), 9)} total.`);
    }

    /**
     * Infoprint. Might react to debugging flags at some point.
     */
    function iprint(arg, verbosity) {
        verbosity = verbosity || 0;
        ns.print(arg);
    }

    function nf(num) {
        return ns.nFormat(num, '0.000 a');
    }

}