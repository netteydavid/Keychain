"use strict";
import * as $ from 'jquery';
import { Xpub } from './models/Xpub';
import * as bip32 from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import { get_accounts, get_settings, get_xpubs, set_accounts } from './popup';
import { gen_child_pub } from './manage_keys';
import * as QRCode from 'qrcode';
import { get_address_balance } from './api_calls';

export function generate_address(account_ind: number = 0){
    let accounts = get_accounts();
    const xpubs = get_xpubs();
    
    const xpub: Xpub = xpubs[account_ind];
    const settings = get_settings();

    //Generate a new address only if the gap between addresses is less than the address gap setting
    //Otherwise check balance and show appropriate address
    if (accounts[account_ind].gap_count < settings.address_gap){
        const bipXpub = bip32.fromBase58(settings.testnet ? xpub.testnet : xpub.mainnet);
        const key = gen_child_pub(bipXpub, false, ++accounts[account_ind].recieve_ind);
    
        const address = bitcoin.payments.p2wpkh({ pubkey: key.publicKey, 
            network: settings.testnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin });
    
        $("#address").val(address.address);
        
        //Gen QR code
        QRCode.toCanvas($("#qr").get(0), `bitcoin<${address.address}>`, error => {
            if (error) console.error(error);
        });

        ++accounts[account_ind].gap_count;
    
        set_accounts(accounts);
    }
    else{
        const bipXpub = bip32.fromBase58(settings.testnet ? xpub.testnet : xpub.mainnet);
        let key = gen_child_pub(bipXpub, false, accounts[account_ind].recieve_ind);
    
        let address = bitcoin.payments.p2wpkh({ pubkey: key.publicKey, 
            network: settings.testnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin });

        //Check if last used addresss has a balance. If not show it.
        //Otherwise reset gap count and show new address
        get_address_balance(address.address, (balance: number) => {
            if (balance == 0){
                $("#address").val(address.address);
        
                //Gen QR code
                QRCode.toCanvas($("#qr").get(0), `bitcoin<${address.address}>`, error => {
                    if (error) console.error(error);
                });
            }
            else{
                key = gen_child_pub(bipXpub, false, ++accounts[account_ind].recieve_ind);
    
                address = bitcoin.payments.p2wpkh({ pubkey: key.publicKey, 
                    network: settings.testnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin });

                $("#address").val(address.address);
    
                //Gen QR code
                QRCode.toCanvas($("#qr").get(0), `bitcoin<${address.address}>`, error => {
                    if (error) console.error(error);
                });
        
                accounts[account_ind].gap_count = 0;
            
                set_accounts(accounts);
            }
        });
    }
}