import { NonceManagerType } from "../nonce_manager";
import { SignerClient } from "../signer";
import { AccountApi, ApiKeyAuthentication, IsomorphicFetchHttpLibrary, OrderApi, ServerConfiguration } from "../generated";
import type { Account } from "./accounts";
import type { MARKETS } from "./createOrder";


const BASE_URL = process.env['BASE_URL']!
const API_KEY_PRIVATE_KEY = process.env['API_KEY_PRIVATE_KEY']!
const ACCOUNT_INDEX = 283587
const API_KEY_INDEX = 2 // Api Key index, create yours from https://app.lighter.xyz/apikeys
const SOL_MARKET_ID = 2 // Market index, 2 is for SOL


export async function createPosition(account: Account, symbol: string, side: 'long' | 'short', quantity: number, leverage: number) {
    const client = await SignerClient.create({
        url: BASE_URL,
        private_Key: API_KEY_PRIVATE_KEY,
        api_key_index: API_KEY_INDEX,
        account_index: ACCOUNT_INDEX,
        nonceManagementType: NonceManagerType.OPTIMISTIC
    });
    const candleStickApi = new CandlestickApi({
    baseServer: BASE_URL,
    httpApi = new ServerConfiguration<{ }>(BASE_URL, { }),
    middleware : [],
    authMethods : {}
    });

    const candleStickData = await candleStickApi.candlestick(SOL_MARKET_ID, '5m', Date.now()-1000*60*60*2, Date.now(), 50, false);
    const latestPrice = candleStickData.candlesticks[candleStickData.candlesticks.length - 1].close;
    if(!latestPrice){
        throw new Error("Failed to fetch latest price for SOL market");
    }


    // creates a limit order to buy 1.0 SOL at 170000 (170 USDC)
    const market = MARKETS[symbol as keyof typeof MARKETS].marketId,
    await client.createOrder({
        marketIndex: market.marketId,
        clientOrderIndex: 0,
        baseAmount: quantity * market.qtyDecimals,
        price:  market.priceDecimals,
        isAsk: side == 'LONG',? false:true,
        orderType: SignerClient.ORDER_TYPE_LIMIT,
        timeInForce: SignerClient.ORDER_TIME_IN_FORCE_GOOD_TILL_TIME,
        reduceOnly: 0,
        triggerPrice: SignerClient.NIL_TRIGGER_PRICE,
        orderExpiry: SignerClient.DEFAULT_28_DAY_ORDER_EXPIRY,
    });
}

main()