"use strict";

export class Settings{
    login_timeout: number = 1;
    testnet: boolean = false;
    unit: number = 0;
    update_interval: number = 5;
    advanced: boolean = false;
    testnet_node: string = "https://mempool.space/testnet/api";
    mainnet_node: string = "https://mempool.space/api";
}