"use strict";
import * as $ from 'jquery';
import * as QRCode from 'qrcode';
import { Account } from './models/Account';
import { Xpub } from './models/Xpub';
import * as bip32 from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import { get_accounts, get_settings, get_xpubs, set_accounts } from './popup';
import { gen_child_pub } from './manage_keys';

export function generate_address(account_ind: number = 0){
    let accounts = get_accounts();
    const xpubs = get_xpubs();
    
    const xpub: Xpub = xpubs[account_ind];
    const settings = get_settings();
    const bipXpub = bip32.fromBase58(settings.testnet ? xpub.testnet : xpub.mainnet);
    const key = gen_child_pub(bipXpub, false, ++accounts[account_ind].recieve_ind);

    const address = bitcoin.payments.p2wpkh({ pubkey: key.publicKey, 
        network: settings.testnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin });

    $("#address").val(address.address);
    // QRCode.toCanvas($("#qr").get(0), `bitcoin<${address.address}>`, (error) => {
    //     $("#qr").text("Unable to generate QR code");
    // });
    
    //TODO: Figure out why this doesn't save across methods
    set_accounts(accounts);
}