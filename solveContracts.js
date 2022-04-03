import * as util from 'util.js';

export function main(ns) {
    const contracts = getAllServers(ns, "home").flatMap((server) => {
        const onServer = ns.ls(server, ".cct").map((contract) => {
            const type = ns.codingcontract.getContractType(contract, server);
            const data = ns.codingcontract.getData(contract, server);
            let [solution, didSolve] = solve(type, data, server, contract, ns);
            solution = (didSolve) ? "" : `${solution} - `;
            return `${server} - ${contract} - ${type} - ${solution}${didSolve || "FAILED!"}`;
        });
        return onServer;
    });
    ns.tprint(`Found ${contracts.length} contracts`);
    contracts.forEach((contract) => void ns.tprint(contract));
}

function getAllServers(ns, start) {
	return ns.read('servers.txt').split(",");
}

function solve(type, data, server, contract, ns) {
    let solution = "";
    ns.tprint(type);
    switch (type) {
        case "Algorithmic Stock Trader I":
            solution = maxProfit([1, data]);
            break;
        case "Algorithmic Stock Trader II":
            solution = maxProfit([Math.ceil(data.length / 2), data]);
            break;
        case "Algorithmic Stock Trader III":
            solution = maxProfit([2, data]);
            break;
        case "Algorithmic Stock Trader IV":
            solution = maxProfit(data);
            break;
        case "Array Jumping Game":
            solution = arrayJumpingGame(ns, data);
            break;
        case "Find All Valid Math Expressions":
            solution = findAllValidMathExpr(ns, data);
            break;
        case "Find Largest Prime Factor":
            solution = largestPrimeFactor(ns, data);
            break;
        case "Generate IP Addresses":
            solution = generateIps(data);
            break;
        case "Merge Overlapping Intervals":
            solution = mergeOverlap(data);
            break;
        case "Minimum Path Sum in a Triangle":
            solution = solveTriangleSum(data, ns);
            break;
        case "Sanitize Parentheses in Expression":
            solution = fixParentheses(data);
            break;
        case "Spiralize Matrix":
            solution = spiral(data);
            break;
        case "Subarray with Maximum Sum":
            solution = findMaxSubArraySum(data);
            break;
        case "Total Ways to Sum":
            solution = totalWaysToSum(data);
            break;
        case "Unique Paths in a Grid I":
            solution = uniquePathsI(data);
            break;
        case "Unique Paths in a Grid II":
            solution = uniquePathsII(data);
            break;
        default:
            return ['-', "NOT IMPLEMENTED!"];
    }
    return [solution, (solution !== "") ? ns.codingcontract.attempt(solution, contract, server, {returnReward: true}) : "FAILED!"];
}

// TOTAL WAYS TO SUM

function totalWaysToSum(arrayData) {
	var ways = [];
    ways[0] = 1;
 
    for (var a = 1; a <= arrayData; a++) {
        ways[a] = 0;
    }
 
    for (var i = 1; i <= arrayData - 1; i++) {
        for (var j = i; j <= arrayData; j++) {
            ways[j] += ways[j - i];
        }
    }
 
    return ways[arrayData];
}

//ALGORITHMIC STOCK TRADER

function maxProfit(arrayData) {
    let i, j, k;

    let maxTrades = arrayData[0];
    let stockPrices = arrayData[1];

    // WHY?
    let tempStr = "[0";
    for (i = 0; i < stockPrices.length; i++) {
        tempStr += ",0";
    }
    tempStr += "]";
    let tempArr = "[" + tempStr;
    for (i = 0; i < maxTrades - 1; i++) {
        tempArr += "," + tempStr;
    }
    tempArr += "]";

    let highestProfit = JSON.parse(tempArr);

    for (i = 0; i < maxTrades; i++) {
        for (j = 0; j < stockPrices.length; j++) { // Buy / Start
            for (k = j; k < stockPrices.length; k++) { // Sell / End
                if (i > 0 && j > 0 && k > 0) {
                    highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i - 1][k], highestProfit[i][k - 1], highestProfit[i - 1][j - 1] + stockPrices[k] - stockPrices[j]);
                } else if (i > 0 && j > 0) {
                    highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i - 1][k], highestProfit[i - 1][j - 1] + stockPrices[k] - stockPrices[j]);
                } else if (i > 0 && k > 0) {
                    highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i - 1][k], highestProfit[i][k - 1], stockPrices[k] - stockPrices[j]);
                } else if (j > 0 && k > 0) {
                    highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i][k - 1], stockPrices[k] - stockPrices[j]);
                } else {
                    highestProfit[i][k] = Math.max(highestProfit[i][k], stockPrices[k] - stockPrices[j]);
                }
            }
        }
    }
    return highestProfit[maxTrades - 1][stockPrices.length - 1];
}

//SMALLEST TRIANGLE SUM

function solveTriangleSum(arrayData, ns) {
    let triangle = arrayData;
    let nextArray;
    let previousArray = triangle[0];
   
    for (let i = 1; i < triangle.length; i++) {
        nextArray = [];
        for (let j = 0; j < triangle[i].length; j++) {
            if (j == 0) {
                nextArray.push(previousArray[j] + triangle[i][j]);
            } else if (j == triangle[i].length - 1) {
                nextArray.push(previousArray[j - 1] + triangle[i][j]);
            } else {
                nextArray.push(Math.min(previousArray[j], previousArray[j - 1]) + triangle[i][j]);
            }

        }

        previousArray = nextArray;
    }

    return Math.min.apply(null, nextArray);
}

//UNIQUE PATHS IN A GRID

function uniquePathsI(grid) {
    const rightMoves = grid[0] - 1;
    const downMoves = grid[1] - 1;

    return Math.round(factorialDivision(rightMoves + downMoves, rightMoves) / (factorial(downMoves)));
}

function factorial(n) {
    return factorialDivision(n, 1);
}

function factorialDivision(n, d) {
    if (n == 0 || n == 1 || n == d)
        return 1;
    return factorialDivision(n - 1, d) * n;
}

function uniquePathsII(grid, ignoreFirst = false, ignoreLast = false) {
    const rightMoves = grid[0].length - 1;
    const downMoves = grid.length - 1;

    let totalPossiblePaths = Math.round(factorialDivision(rightMoves + downMoves, rightMoves) / (factorial(downMoves)));

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {

            if (grid[i][j] == 1 && (!ignoreFirst || (i != 0 || j != 0)) && (!ignoreLast || (i != grid.length - 1 || j != grid[i].length - 1))) {
                const newArray = [];
                for (let k = i; k < grid.length; k++) {
                    newArray.push(grid[k].slice(j, grid[i].length));
                }

                let removedPaths = uniquePathsII(newArray, true, ignoreLast);
                removedPaths *= uniquePathsI([i + 1, j + 1]);

                totalPossiblePaths -= removedPaths;
            }
        }

    }

    return totalPossiblePaths;
}

//GENERATE IP ADDRESSES

function generateIps(num) {
    num = num.toString();

    const length = num.length;

    const ips = [];

    for (let i = 1; i < length - 2; i++) {
        for (let j = i + 1; j < length - 1; j++) {
            for (let k = j + 1; k < length; k++) {
                const ip = [
                    num.slice(0, i),
                    num.slice(i, j),
                    num.slice(j, k),
                    num.slice(k, num.length)
                ];
                let isValid = true;

                ip.forEach(seg => {
                    isValid = isValid && isValidIpSegment(seg);
                });

                if (isValid) ips.push(ip.join("."));

            }

        }
    }

    return ips;

}

function isValidIpSegment(segment) {
    if (segment[0] == "0" && segment != "0") return false;
    segment = Number(segment);
    if (segment < 0 || segment > 255) return false;
    return true;
}

//GREATEST FACTOR

function factor(num) {
    for (let div = 2; div <= Math.sqrt(num); div++) {
        if (num % div != 0) {
            continue;
        }
        num = num / div;
        div = 2;
    }
    return num;
}

//SPIRALIZE Matrix

function spiral(arr, accum = []) {
    if (arr.length === 0 || arr[0].length === 0) {
        return accum;
    }
    accum = accum.concat(arr.shift());
    if (arr.length === 0 || arr[0].length === 0) {
        return accum;
    }
    accum = accum.concat(column(arr, arr[0].length - 1));
    if (arr.length === 0 || arr[0].length === 0) {
        return accum;
    }
    accum = accum.concat(arr.pop().reverse());
    if (arr.length === 0 || arr[0].length === 0) {
        return accum;
    }
    accum = accum.concat(column(arr, 0).reverse());
    if (arr.length === 0 || arr[0].length === 0) {
        return accum;
    }
    return spiral(arr, accum);
}

function column(arr, index) {
    const res = [];
    for (let i = 0; i < arr.length; i++) {
        const elm = arr[i].splice(index, 1)[0];
        if (elm) {
            res.push(elm);
        }
    }
    return res;
}

// Merge Overlapping Intervals

function mergeOverlap(intervals) {
    intervals.sort(([minA], [minB]) => minA - minB);
    for (let i = 0; i < intervals.length; i++) {
        for (let j = i + 1; j < intervals.length; j++) {
            const [min, max] = intervals[i];
            const [laterMin, laterMax] = intervals[j];
            if (laterMin <= max) {
                const newMax = laterMax > max ? laterMax : max;
                const newInterval = [min, newMax];
                intervals[i] = newInterval;
                intervals.splice(j, 1);
                j = i;
            }
        }
    }
    return intervals;
}

function arrayJumpingGame(ns, data) {
    return findJump(data, 0);
}

function findJump(data, pos) {
    var maxJump = data[pos];
    if (pos + maxJump >= (data.length - 1)) {
        return 1;
    }
    for (var i=1;i<=maxJump;i++) {
        if (findJump(data, pos + i) == 1) {
            return 1;
        }
    }
    return 0;
}


function sanitizeParentheses(ns, data) {
    var context = {"maxLeftLength":0}
    var exprs = findSanitized(ns, data, 0, context);
    exprs = exprs.filter(e=>e.length>=context["maxLeftLength"]).sort();
    for (var i=0;i<exprs.length-1;i++) {
        while (exprs==exprs[i+1]) {
            exprs.splice(i+1, 1);
        }
    }
    return exprs;
}

function findSanitized(ns, s, pos, context) {
    // ns.tprint(s, " ", pos, " ", context["maxLeftLength"], " ", validateParentheses(s));
    if (s.length < context["maxLeftLength"]) {
        return [];
    }
    if (pos == s.length) {
        if (validateParentheses(s)) {
            if (s.length > context["maxLeftLength"]) {
                context["maxLeftLength"] = s.length;
            }
            return [s];
        } else {
            return [];
        }
    }
    var results = [];
    var c = s[pos];
    if (c == "(" || c == ")") {
        results = results.concat(
            findSanitized(ns, s, pos+1, context),
            findSanitized(ns, s.slice(0, pos)+s.slice(pos+1), pos, context)
            );
    } else {
        results = results.concat(
            findSanitized(ns, s, pos+1, context)
            );
    }
    return results;
}

function validateParentheses(s) {
    var n = 0;
    for (var i=0;i<s.length;i++) {
        if (s == "(") {
            n++;
            }
            if (s == ")") {
            n--;
        }
        if (n<0) {
            return false;
        }
    }
    return n == 0;
}
/** @param {NS} ns **/

function findAllValidMathExpr(ns, data) {
    var s = data[0];
    var n = data[1];
    return findExpr(s, n, "");
}

function findExpr(s, n, expr) {
    if (s.length == 0) {
        if (eval(expr) == n) {
            return [expr]
        } else {
            return []
        }
    }
    var results = [];
    if (s.startsWith("0")) {
        var sliced = s.slice(1);
        if (expr.length == 0) {
            return findExpr(sliced, n, expr+"0");
        }
        results = results.concat(
            findExpr(sliced, n, expr+"+0"),
            findExpr(sliced, n, expr+"-0"),
            findExpr(sliced, n, expr+"*0"),
            );
        return results;
    }
    var maxLength = s.length;
    var ops = [];
    if (expr.length == 0) {
        ops = ["", "-"];
    } else {
        ops = ["-", "+", "*"];
    }
    for (var op of ops) {
        for (var i=1;i<=maxLength;i++) {
            results = results.concat(
                findExpr(s.slice(i), n, expr+op+s.slice(0, i))
                );
        }
    }
    return results;
}

/**
 * Sanitize Parentheses in Expression
 * @param {string} expression
 * @returns {string[]}
 */
function fixParentheses(expression) {
  if (expression.length === 0) return [''];
  /** @type {(x: string) => boolean} */
  function sanitary(value) {
    let open = 0;
    for (const char of value) {
      if (char === '(') open++;
      else if (char === ')') open--;
      if (open < 0) return false;
    }
    return open === 0;
  }
  /** @type {string[]} */
  let queue = [expression];
  let tested = new Set();
  tested.add(expression);
  let found = false;
  let solution = [];
  while (queue.length > 0) {
    // @ts-ignore
    expression = queue.shift();
    if (sanitary(expression)) {
      solution.push(expression);
      found = true;
    }
    if (found) continue;
    for (let i = 0; i < expression.length; i++) {
      if (expression.charAt(i) !== '(' && expression.charAt(i) !== ')')
        continue;
      let stripped = expression.slice(0, i) + expression.slice(i + 1);
      if (!tested.has(stripped)) {
        queue.push(stripped);
        tested.add(stripped);
      }
    }
  }
  return solution;
}

function findMaxSubArraySum(data) {
	let vals = [];
	for (let i=1; i<data.length; i++) {
		for (let j=0; j<(data.length-i+1); j++) {
			let tmp = data.slice(j, j+i);
			let sum = tmp.reduce((x, y) => x + y);
			vals.push(sum);
		}
	}

	return Math.max(...vals);
}

function isPrime(ns, n) {
    if (n <= 1)
        return false;

    for (let i = 2; i<n/2; i++)
        if (n % i === 0)
            return false
    return true
}

function largestPrimeFactor(ns, n) {    
    let factors = [];
    for (let i = 2; i<n/2; i++) {
        if (n % i === 0) {
            if (isPrime(ns, i))
                factors.push(i);
        }
    }
    return factors.pop();
}