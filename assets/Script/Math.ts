function thousandComma(number: number | string) {
    let num = number.toString();
    let pattern = /(-?\d+)(\d{3})/;

    // 將整數和小數分開
    let index: number = num.indexOf('.');
    let integer: string
    if (index < 0) { integer = num; }
    else { integer = num.slice(0, index); }

    let fraction: string = num.slice(index, num.length);
    while (pattern.test(integer)) { integer = integer.replace(pattern, "$1,$2"); }
    let result: string;

    if (index < 0) { result = integer; }
    else {
        result = integer.concat(fraction);
        integer = num.slice(0, index);
    }
    return result;
}

/**
 * 整數運算
 * @param num 未經處理的數字 (server給的)
 */
function intOperation(num: number, digit: number) {
    // 無條件捨去
    var numStr = num.toString();
    // 判斷有沒有小數點
    var dotIndex = numStr.indexOf('.');
    if (digit > 0) {
        if (dotIndex >= 0) { numStr = numStr.slice(0, dotIndex + digit + 1); }
        numStr = Number(numStr).toFixed(digit);
    }
    return numStr;
}

/**
 * 隨機數字
 * @param max 最大數字
 */
function getRandom(min: number, max: number) {
    return Math.floor(Math.random() * max) + min;
};

export { thousandComma, intOperation, getRandom }