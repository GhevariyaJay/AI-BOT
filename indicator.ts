import type { Candlestick } from "lighter-sdk-ts/generated";
export function getEma(period: number, prices: number[]){
    const multiplier = 2 / (period + 1);
    const smaInterval = prices.length - period;
    if(smaInterval < 1) {
        throw new Error('Not enough data to calculate EMA');
        return;
    }
    let sma = 0;
    for (let i = 0;i<smaInterval;i++){
        sma += prices[i]??0;

    }
    sma /= smaInterval;
    let emas: number[] = [sma];
    for(let i = 0;i<period;i++){
        const ema = (emas[emas.length - 1] ?? 0) * (1 - multiplier) + (prices[smaInterval + i]?? 0) * multiplier;
        emas.push(ema);
    }
   return emas;

}

export function getMidPrices(candlesticks: Candlestick[]){
  return candlesticks.map(({open, close}) => (open + close) / 2).toFixed(2);
}

export function getMacd(prices: number[]){
    const ema26 = getEma(26, prices);
    const ema14 = getEma(14, prices);
    const macd = ema26?.slice(-14).map((_, index)=>(ema26[index]?? 0) -(ema14[index]?? 0));
    return macd;
}