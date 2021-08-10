"use strict";

import { bip32 } from "bitcoinjs-lib";

export class Account {
    name: string;
    recieve_ind: number;
    change_ind: number;
    xpub: string;
    xpub_testnet: string;

    constructor(name: string, recieve_ind: number = 0, change_ind: number = 0) {
        this.name = name;
        this.recieve_ind = recieve_ind;
        this.change_ind = change_ind;
        this.xpub = "";
        this.xpub_testnet = "";
    }
}

export function get_key(account: Account){
    return bip32.fromBase58(account.xpub_testnet);
}