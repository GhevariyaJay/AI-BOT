import { AccountApi, IsomorphicFetchHttpLibrary, ServerConfiguration, OrderApi } from 'lighter-sdk-ts';
const baseUrl = process.env.BASE_URL;
const apiKey = process.env.API_KEY;
const account_index = process.env.ACCOUNT_INDEX;
const api_key_index = process.env.API_KEY_INDEX;

export async function getOpenPositions(apiKey: string){
    const accountApi = new AccountApi({
        baseServer: new ServerConfiguration<{ }>(baseUrl, { }),
        httpApi: new IsomorphicFetchHttpLibrary(),
        midlleware: [],
        authMethods: {
            apiKey: new ApiKeyAuthentication(apiKey)
        }
        
})

const currentOpenOrders = await accountApi.accountWithHttpInfo('index', account_index.toString());
console.log(currentOpenOrders.data.accounts[0]?.positions);
return currentOpenOrders.data.accounts[0].map((accountPosition)=> ({
    symbol: accountPosition.symbol,
    position: accountPosition.position,
    sign: accountPosition.sign,
    unrealizedPnl: accountPosition.unrealizedPnl,
    realizedPnl: accountPosition.realizedPnl,
    liquidationPrice: accountPosition.liquidationPrice,
}))
};

getOpenPositions(0);
