import axios from "axios";
import type { Account } from "./accounts";
export async function getPortfolio(account: Account): Promise<string> {
    const response = await axios.get("enter url here");
    return response.data.account[0]?.collateral;
}