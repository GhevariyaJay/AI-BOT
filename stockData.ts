import { CandlestickApi, IsomorphicFetchHttpLibrary, ServerConfiguration } from 'lighter-sdk-ts';
import { getEma, getMacd, getMidPrices } from './indicator';

const baseUrl = process.env.BASE_URL;
const SOL_MARKET_ID = 2;

 const klinesApi = new CandlestickApi({
        baseServer: new ServerConfiguration<{ }>(baseUrl, { }),
        httpApi: new IsomorphicFetchHttpLibrary()
        middleware: [],
        authMethods: {}
    })

export async function getIndicators(duration: '5m'|'4h', marketId: number){
    const klines = await klinesApi.candlestic(marketId, '5m', Date.now()-1000*60*60*(duration === '5m' ? 2 : 96), Date.now(), 50, false);
    const midPrices = getMidPrices(klines.candlesticks);
    const ema20s = getEma(20, midPrices);   
    const macd = getMacd(midPrices);

    return {
        midPrices: midPrices.slice(-10).map(x=>{Number(x.toFixed(3))}),
        macd: macd.slice(midPrices, -10),
        ema20s: ema20s.slice(midPrices , -10)
    }  

}

async function getKlines(marketId: number){
    getIndicators('5m', marketId);
    getIndicators('4h', marketId);
   
}
