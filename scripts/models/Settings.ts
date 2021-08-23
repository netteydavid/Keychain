"use strict";

export class Settings{
    login_timeout: number = 5;
    testnet: boolean = false;
    unit: number = 1;
    fiat: number = 1;
    advanced: boolean = false;
    testnet_node: string = "https://mempool.space/testnet/api";
    mainnet_node: string = "https://mempool.space/api";
    price_endpoint: string = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd%2Ceur%2Cgpb%2Ccny%2Cjpy%2Crub%2Ccad%2Caud";
    address_gap: number = 20;
}