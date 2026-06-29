import { NonceManagerType } from "../nonce_manager";
import { SignerClient } from "../signer";
import { AccountApi, ApiKeyAuthentication, IsomorphicFetchHttpLibrary, OrderApi, ServerConfiguration } from "../generated";
import type { Account } from "./accounts";
import type { MARKETS } from "./createOrder";

export async function cancelOrder(account: Account,) {
    const client = await SignerClient.create({
        url: BASE_URL,
        private_Key: API_KEY_PRIVATE_KEY,
        api_key_index: API_KEY_INDEX,
        account_index: ACCOUNT_INDEX,
        nonceManagementType: NonceManagerType.OPTIMISTIC
    });

    Object.values(MARKETS).forEach(async (market) => {
        await client.cancelOrder(
            market.marketId, 
            market.clientOrderIndex
        );
    });
}

